export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { waybill } = req.query;
    
    if (!waybill) {
        return res.status(400).json({ error: 'Waybill parameter is required' });
    }

    // Delhivery API URL (use sandbox by default if not specified)
    const baseUrl = process.env.DELHIVERY_ENVIRONMENT === 'production' 
      ? 'https://track.delhivery.com' 
      : 'https://staging-express.delhivery.com';

    const apiKey = process.env.DELHIVERY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Delhivery API key is not configured.' });
    }

    const response = await fetch(`${baseUrl}/api/v1/packages/json/?waybill=${waybill}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Delhivery Tracking API Error:", data);
      return res.status(400).json({ error: 'Failed to track shipment', details: data });
    }

    res.status(200).json({ success: true, tracking: data });
    
  } catch (error) {
    console.error('Delhivery Tracking Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
