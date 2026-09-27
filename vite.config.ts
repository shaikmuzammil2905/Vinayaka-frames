import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables for the local API
dotenv.config({ path: '.env.local' });

const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      // Endpoint 1: Create Razorpay Order with server-side price validation
      if (req.url === '/api/create-razorpay-order' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { orderData, items } = JSON.parse(body || '{}');

            if (!orderData || !items || !Array.isArray(items) || items.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing orderData or items' }));
            }

            const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
            const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

            if (!razorpayKeyId || !razorpayKeySecret) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Razorpay credentials missing in server environment.' }));
            }

            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
            const supabase = createClient(supabaseUrl!, supabaseKey!, { auth: { persistSession: false } });

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
                const match = activeDbProducts.find((p: any) => 
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

            // 2. Execute place_order RPC in Supabase to calculate true price server-side
            const { data: orderId, error: placeError } = await supabase.rpc('place_order', {
              p_customer_name: (orderData.customer_name || '').trim(),
              p_customer_phone: (orderData.customer_phone || '').trim(),
              p_customer_email: (orderData.customer_email || '').trim(),
              p_address: (orderData.address || '').trim(),
              p_city: (orderData.city || '').trim(),
              p_state: (orderData.state || '').trim(),
              p_pincode: (orderData.pincode || '').trim(),
              p_payment_method: 'Razorpay',
              p_items: sanitizedItems
            });

            if (placeError || !orderId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: placeError?.message || 'Failed to place internal order.' }));
            }

            // 3. Fetch verified order totals
            const { data: dbOrder, error: fetchError } = await supabase.rpc('get_order_by_id', {
              p_order_id: orderId
            });

            if (fetchError || !dbOrder) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Failed to retrieve order totals.' }));
            }

            const calculatedTotal = Number(dbOrder.total_amount);
            const amountInPaise = Math.round(calculatedTotal * 100);

            // 4. Create Razorpay order
            const razorpay = new (Razorpay as any)({
              key_id: razorpayKeyId,
              key_secret: razorpayKeySecret,
            });

            const rzpOrder = await razorpay.orders.create({
              amount: amountInPaise,
              currency: 'INR',
              receipt: (dbOrder.order_number || orderId).substring(0, 40),
              notes: {
                order_id: orderId,
                order_number: dbOrder.order_number || '',
                customer_name: orderData.customer_name,
                customer_phone: orderData.customer_phone,
                customer_email: orderData.customer_email
              }
            });

            // 5. Update razorpay_order_id on record
            try {
              await supabase.rpc('set_razorpay_order_id', {
                p_order_id: orderId,
                p_razorpay_order_id: rzpOrder.id
              });
            } catch {
              await supabase.from('orders').update({
                notes: JSON.stringify({ razorpay_order_id: rzpOrder.id })
              }).eq('id', orderId);
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              orderId: orderId,
              orderNumber: dbOrder.order_number,
              razorpayOrderId: rzpOrder.id,
              amount: rzpOrder.amount,
              currency: rzpOrder.currency,
              keyId: razorpayKeyId,
              totalAmount: calculatedTotal
            }));
          } catch (e: any) {
            console.error('Vite local API create-razorpay-order error:', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
      
      // Endpoint 2: Verify Razorpay Payment Signature
      if (req.url === '/api/verify-razorpay-payment' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(body || '{}');
            const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: 'Missing payment parameters' }));
            }

            const text = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto
              .createHmac('sha256', razorpayKeySecret || '')
              .update(text)
              .digest('hex');
            
            const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
            const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');
            const isMatch = expectedBuffer.length === receivedBuffer.length &&
              crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

            const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
            const supabase = createClient(supabaseUrl!, supabaseKey!, { auth: { persistSession: false } });

            res.setHeader('Content-Type', 'application/json');
            if (isMatch) {
              if (order_id) {
                try {
                  await supabase.rpc('confirm_razorpay_payment', {
                    p_order_id: order_id,
                    p_razorpay_order_id: razorpay_order_id,
                    p_razorpay_payment_id: razorpay_payment_id,
                    p_razorpay_signature: razorpay_signature
                  });
                } catch {
                  await supabase.from('orders').update({
                    payment_status: 'Paid',
                    order_status: 'Confirmed',
                    notes: JSON.stringify({
                      razorpay_order_id,
                      razorpay_payment_id,
                      razorpay_signature,
                      paid_at: new Date().toISOString()
                    })
                  }).eq('id', order_id);
                }
              }
              res.end(JSON.stringify({ success: true, orderId: order_id }));
            } else {
              if (order_id) {
                try {
                  await supabase.rpc('record_payment_failure', {
                    p_order_id: order_id,
                    p_razorpay_order_id: razorpay_order_id,
                    p_reason: 'Invalid signature verification'
                  });
                } catch {
                  await supabase.from('orders').update({
                    payment_status: 'Failed',
                    notes: JSON.stringify({ failure_reason: 'Invalid signature', razorpay_order_id })
                  }).eq('id', order_id);
                }
              }
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'Invalid signature verification failed' }));
            }
          } catch (e: any) {
            console.error('Vite local API verify-razorpay-payment error:', e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
      
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
})
