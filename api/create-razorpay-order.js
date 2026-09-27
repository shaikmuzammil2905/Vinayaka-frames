const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fcyjbljpgdggmomlisxf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeWpibGpwZ2RnZ21vbWxpc3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDYxNzUsImV4cCI6MjEwNTMyMjE3NX0.ad7SXUA31dTgKzs91t1yaQAL8BNB8ziMQ1NQ8VWzkWY';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAYKEYID || 'rzp_live_Tgy0yqru5LmwIb';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAYKEYSECRET || 'NEi4glvuUVG3eF6wkX8F1fCd';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let rawBody = req.body;
    if (typeof rawBody === 'string') {
      try {
        rawBody = JSON.parse(rawBody);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { orderId: directOrderId, orderData, items } = rawBody || {};

    let orderId = directOrderId;
    let orderNumber = rawBody?.orderNumber || '';
    let finalAmount = 0;

    // Case 1: An order was already created via placeOrder and passed by orderId
    if (orderId) {
      const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_order_by_id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_order_id: orderId })
      });

      if (orderRes.ok) {
        const orderDataFromDb = await orderRes.json();
        if (orderDataFromDb) {
          orderNumber = orderDataFromDb.order_number || orderNumber;
          finalAmount = Number(orderDataFromDb.total_amount);
        }
      }
    }

    // Case 2: Order needs to be placed on the server from orderData and items
    if (!orderId && orderData && items) {
      // 1. Fetch products from Supabase to resolve IDs safely
      const prodsRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,slug,price&active=eq.true`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      const dbProducts = prodsRes.ok ? await prodsRes.json() : [];

      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const sanitizedItems = [];

      for (const item of items) {
        let resolvedId = item.product_id;
        const existsInDb = Array.isArray(dbProducts) && dbProducts.some(p => p.id === resolvedId);

        if (!existsInDb && Array.isArray(dbProducts)) {
          const match = dbProducts.find(p => 
            p.slug === item.product_id || 
            (item.product_name && (
              p.name.toLowerCase().includes(item.product_name.toLowerCase()) ||
              item.product_name.toLowerCase().includes(p.name.toLowerCase())
            ))
          );
          if (match) {
            resolvedId = match.id;
          } else if (dbProducts.length > 0) {
            resolvedId = dbProducts[0].id;
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

      // Execute place_order RPC in Supabase
      const placeRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/place_order`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_customer_name: (orderData.customer_name || '').trim(),
          p_customer_phone: (orderData.customer_phone || '').trim(),
          p_customer_email: (orderData.customer_email || '').trim(),
          p_address: (orderData.address || '').trim(),
          p_city: (orderData.city || '').trim(),
          p_state: (orderData.state || '').trim(),
          p_pincode: (orderData.pincode || '').trim(),
          p_payment_method: 'Razorpay',
          p_items: sanitizedItems
        })
      });

      if (!placeRes.ok) {
        const placeErr = await placeRes.json().catch(() => ({}));
        return res.status(400).json({ error: placeErr.message || 'Failed to place internal order in database' });
      }

      orderId = await placeRes.json();

      // Fetch the created order details to get true database total_amount and order_number
      const getOrderRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_order_by_id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_order_id: orderId })
      });

      if (getOrderRes.ok) {
        const createdOrder = await getOrderRes.json();
        orderNumber = createdOrder.order_number || '';
        finalAmount = Number(createdOrder.total_amount);
      }
    }

    if (!finalAmount || finalAmount <= 0) {
      finalAmount = Number(rawBody?.amount) || 0;
    }

    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount.' });
    }

    // Convert INR to paise
    const amountInPaise = Math.round(finalAmount * 100);

    // Create Razorpay Order via Direct REST API
    const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const receiptStr = (orderNumber || orderId || `order_${Date.now()}`).substring(0, 40);

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptStr,
        notes: {
          order_id: orderId || '',
          order_number: orderNumber || ''
        }
      })
    });

    const rzpOrder = await rzpResponse.json();

    if (!rzpResponse.ok || !rzpOrder.id) {
      console.error('Razorpay API Error:', rzpOrder);
      return res.status(400).json({
        error: rzpOrder.error?.description || 'Failed to create Razorpay payment order',
        details: rzpOrder
      });
    }

    // Attach razorpay_order_id to Supabase order record if orderId exists
    if (orderId) {
      fetch(`${SUPABASE_URL}/rest/v1/rpc/set_razorpay_order_id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_order_id: orderId,
          p_razorpay_order_id: rzpOrder.id
        })
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      orderId: orderId,
      orderNumber: orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency || 'INR',
      keyId: RAZORPAY_KEY_ID,
      totalAmount: finalAmount
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal Server Error'
    });
  }
}
