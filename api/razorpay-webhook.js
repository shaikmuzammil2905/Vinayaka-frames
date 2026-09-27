import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Vercel helper to get raw body if needed
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBodyBuffer = await getRawBody(req);
    const rawBody = rawBodyBuffer.toString('utf-8');
    const signature = req.headers['x-razorpay-signature'];

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret is not configured on the server.');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!signature) {
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    // 1. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(signature, 'utf-8');

    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      console.error('Webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    console.log(`Received Razorpay webhook event: ${eventType}, ID: ${event.id}`);

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({ status: 'received_unconfigured_db' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;
      const internalOrderId = paymentEntity?.notes?.order_id;

      if (rzpOrderId || internalOrderId) {
        // Find the internal order
        let orderQuery = supabase.from('orders').select('id, payment_status, order_status');
        if (internalOrderId) {
          orderQuery = orderQuery.eq('id', internalOrderId);
        } else {
          orderQuery = orderQuery.eq('razorpay_order_id', rzpOrderId);
        }

        const { data: existingOrders } = await orderQuery;
        const targetOrder = existingOrders?.[0];

        // Idempotency: If already marked Paid, do nothing
        if (targetOrder && targetOrder.payment_status === 'Paid') {
          console.log(`Order ${targetOrder.id} already marked Paid. Skipping duplicate webhook.`);
          return res.status(200).json({ status: 'idempotent_ok' });
        }

        if (targetOrder) {
          try {
            await supabase.rpc('confirm_razorpay_payment', {
              p_order_id: targetOrder.id,
              p_razorpay_order_id: rzpOrderId,
              p_razorpay_payment_id: rzpPaymentId,
              p_razorpay_signature: 'webhook_verified'
            });
          } catch {
            await supabase.from('orders').update({
              payment_status: 'Paid',
              order_status: 'Confirmed',
              notes: JSON.stringify({
                razorpay_order_id: rzpOrderId,
                razorpay_payment_id: rzpPaymentId,
                paid_at: new Date().toISOString(),
                verified_by: 'webhook'
              })
            }).eq('id', targetOrder.id);
          }
          console.log(`Order ${targetOrder.id} confirmed via Razorpay webhook.`);
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const internalOrderId = paymentEntity?.notes?.order_id;
      const failureReason = paymentEntity?.error_description || 'Payment failed';

      if (rzpOrderId || internalOrderId) {
        let orderQuery = supabase.from('orders').select('id, payment_status');
        if (internalOrderId) {
          orderQuery = orderQuery.eq('id', internalOrderId);
        } else {
          orderQuery = orderQuery.eq('razorpay_order_id', rzpOrderId);
        }

        const { data: existingOrders } = await orderQuery;
        const targetOrder = existingOrders?.[0];

        if (targetOrder && targetOrder.payment_status !== 'Paid') {
          try {
            await supabase.rpc('record_payment_failure', {
              p_order_id: targetOrder.id,
              p_razorpay_order_id: rzpOrderId,
              p_reason: failureReason
            });
          } catch {
            await supabase.from('orders').update({
              payment_status: 'Failed',
              notes: JSON.stringify({ failure_reason: failureReason, rzpOrderId })
            }).eq('id', targetOrder.id);
          }
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
}
