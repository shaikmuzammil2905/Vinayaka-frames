import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification parameters.' });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKeySecret) {
      console.error('RAZORPAY_KEY_SECRET is not configured on the server.');
      return res.status(500).json({ success: false, error: 'Payment gateway configuration error.' });
    }

    // 1. Verify Razorpay Payment Signature using HMAC-SHA256
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');

    const isMatch = expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }

    if (!isMatch) {
      console.error('Razorpay Signature Verification Mismatch:', {
        razorpay_order_id,
        razorpay_payment_id,
        order_id
      });

      if (supabase && order_id) {
        try {
          await supabase.rpc('record_payment_failure', {
            p_order_id: order_id,
            p_razorpay_order_id: razorpay_order_id,
            p_reason: 'Invalid signature verification'
          });
        } catch {
          await supabase.from('orders').update({
            payment_status: 'Failed',
            notes: JSON.stringify({ failure_reason: 'Invalid signature', razorpay_order_id, razorpay_payment_id })
          }).eq('id', order_id);
        }
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature verification failed.'
      });
    }

    // 2. Payment verified! Update order in Supabase
    if (supabase && order_id) {
      try {
        await supabase.rpc('confirm_razorpay_payment', {
          p_order_id: order_id,
          p_razorpay_order_id: razorpay_order_id,
          p_razorpay_payment_id: razorpay_payment_id,
          p_razorpay_signature: razorpay_signature
        });
      } catch (err) {
        console.warn('RPC confirm_razorpay_payment failed, updating fallback columns:', err?.message);
        // Fallback update
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

    return res.status(200).json({
      success: true,
      orderId: order_id,
      message: 'Payment verified and order confirmed successfully.'
    });
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
