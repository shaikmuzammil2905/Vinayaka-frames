import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://fcyjbljpgdggmomlisxf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeWpibGpwZ2RnZ21vbWxpc3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDYxNzUsImV4cCI6MjEwNTMyMjE3NX0.ad7SXUA31dTgKzs91t1yaQAL8BNB8ziMQ1NQ8VWzkWY';
const DEFAULT_RAZORPAY_KEY_SECRET = 'NEi4glvuUVG3eF6wkX8F1fCd';

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
        return res.status(400).json({ success: false, error: 'Invalid JSON body' });
      }
    }

    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = rawBody || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification parameters.' });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAYKEYSECRET || DEFAULT_RAZORPAY_KEY_SECRET;

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

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    if (!isMatch) {
      console.error('Razorpay Signature Verification Mismatch:', {
        razorpay_order_id,
        razorpay_payment_id,
        order_id
      });

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
    if (order_id) {
      try {
        await supabase.rpc('confirm_razorpay_payment', {
          p_order_id: order_id,
          p_razorpay_order_id: razorpay_order_id,
          p_razorpay_payment_id: razorpay_payment_id,
          p_razorpay_signature: razorpay_signature
        });
      } catch (err) {
        console.warn('RPC confirm_razorpay_payment failed, updating fallback columns:', err?.message);
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
    return res.status(500).json({ success: false, error: error?.message || 'Internal Server Error' });
  }
}
