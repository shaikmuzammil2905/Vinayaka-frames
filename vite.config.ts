import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import dotenv from 'dotenv'

// Load environment variables for the local API
dotenv.config({ path: '.env.local' });

const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/api/create-razorpay-order' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const razorpay = new (Razorpay as any)({
              key_id: process.env.VITE_RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            const order = await razorpay.orders.create({
              amount: Math.round(data.amount * 100),
              currency: 'INR',
              receipt: 'receipt#1'
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(order));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }
      
      if (req.url === '/api/verify-razorpay-payment' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const text = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
            const expectedSignature = crypto
              .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
              .update(text)
              .digest('hex');
            
            res.setHeader('Content-Type', 'application/json');
            if (expectedSignature === data.razorpay_signature) {
              res.end(JSON.stringify({ success: true }));
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: 'Invalid signature' }));
            }
          } catch (e: any) {
            res.statusCode = 500;
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
