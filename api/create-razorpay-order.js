import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise for INR)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
