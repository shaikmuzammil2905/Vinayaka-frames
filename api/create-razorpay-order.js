import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { orderData, items } = req.body || {};

    if (!orderData || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order request. Missing orderData or items.' });
    }

    const {
      customer_name,
      customer_phone,
      customer_email,
      address,
      city,
      state,
      pincode,
    } = orderData;

    if (!customer_name || !customer_phone || !customer_email || !address || !city || !state || !pincode) {
      return res.status(400).json({ error: 'All customer and delivery address fields are required.' });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials missing in server environment variables.');
      return res.status(500).json({ error: 'Payment gateway configuration error.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing in server environment variables.');
      return res.status(500).json({ error: 'Database configuration error.' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // 1. Sanitize items and resolve UUIDs if necessary
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let activeDbProducts = null;
    const sanitizedItems = [];

    for (const item of items) {
      let resolvedId = item.product_id;

      if (!UUID_REGEX.test(resolvedId)) {
        if (!activeDbProducts) {
          const { data } = await supabase.from('products').select('id, name, slug').eq('active', true);
          activeDbProducts = data || [];
        }
        const match = activeDbProducts.find(p => 
          p.slug === item.product_id || 
          (item.product_name && p.name.toLowerCase().includes(item.product_name.toLowerCase()))
        );
        if (match) {
          resolvedId = match.id;
        } else if (activeDbProducts.length > 0) {
          resolvedId = activeDbProducts[0].id;
        }
      }

      sanitizedItems.push({
        product_id: resolvedId,
        size: item.size || null,
        finish: item.finish || null,
        quantity: Math.max(1, Number(item.quantity) || 1),
        image: item.image || null,
        personalization: item.personalization || null
      });
    }

    // 2. Execute place_order RPC in Supabase to create the order with server-calculated price
    const { data: orderId, error: placeError } = await supabase.rpc('place_order', {
      p_customer_name: customer_name.trim(),
      p_customer_phone: customer_phone.trim(),
      p_customer_email: customer_email.trim(),
      p_address: address.trim(),
      p_city: city.trim(),
      p_state: state.trim(),
      p_pincode: pincode.trim(),
      p_payment_method: 'Razorpay',
      p_items: sanitizedItems
    });

    if (placeError || !orderId) {
      console.error('Error in place_order RPC:', placeError);
      return res.status(400).json({
        error: placeError?.message || 'Failed to place internal order with server price calculation.'
      });
    }

    // 3. Fetch the verified order details from Supabase to get the exact total_amount and order_number
    const { data: dbOrder, error: fetchError } = await supabase.rpc('get_order_by_id', {
      p_order_id: orderId
    });

    if (fetchError || !dbOrder) {
      console.error('Error fetching newly created order:', fetchError);
      return res.status(500).json({ error: 'Failed to retrieve order calculations.' });
    }

    const calculatedTotal = Number(dbOrder.total_amount);
    if (isNaN(calculatedTotal) || calculatedTotal <= 0) {
      return res.status(400).json({ error: 'Invalid order total amount.' });
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(calculatedTotal * 100);

    // 4. Initialize Razorpay client and create Razorpay Order
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const receiptStr = (dbOrder.order_number || orderId).substring(0, 40);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptStr,
      notes: {
        order_id: orderId,
        order_number: dbOrder.order_number || '',
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        customer_email: customer_email.trim()
      }
    });

    // 5. Update the internal order record with the created Razorpay Order ID
    try {
      await supabase.rpc('set_razorpay_order_id', {
        p_order_id: orderId,
        p_razorpay_order_id: rzpOrder.id
      });
    } catch {
      // Fallback update if RPC is not yet registered
      await supabase.from('orders').update({
        notes: JSON.stringify({ razorpay_order_id: rzpOrder.id })
      }).eq('id', orderId);
    }

    // 6. Return secure response to frontend
    res.status(200).json({
      success: true,
      orderId: orderId,
      orderNumber: dbOrder.order_number,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      keyId: razorpayKeyId,
      totalAmount: calculatedTotal
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
