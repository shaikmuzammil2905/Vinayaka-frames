export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { orderDetails } = req.body;
    
    // Delhivery API URL (use sandbox by default if not specified)
    const baseUrl = process.env.DELHIVERY_ENVIRONMENT === 'production' 
      ? 'https://track.delhivery.com' 
      : 'https://staging-express.delhivery.com';

    const apiKey = process.env.DELHIVERY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Delhivery API key is not configured.' });
    }

    // Format the payload according to Delhivery API specifications
    // https://delhivery.com/docs/
    
    const payload = {
      "format": "json",
      "data": {
        "shipments": [
          {
            "name": orderDetails.customer_name,
            "add": orderDetails.address,
            "pin": orderDetails.pincode,
            "city": orderDetails.city,
            "state": orderDetails.state,
            "country": "India",
            "phone": orderDetails.customer_phone,
            "order": orderDetails.order_number,
            "payment_mode": orderDetails.payment_method === 'COD' ? 'COD' : 'Prepaid',
            "return_pin": "", // Add your return pincode here
            "return_city": "", // Add your return city here
            "return_phone": "",
            "return_add": "",
            "return_state": "",
            "return_country": "India",
            "products_desc": "Frames and Artworks",
            "hsn_code": "",
            "cod_amount": orderDetails.payment_method === 'COD' ? orderDetails.total_amount : 0,
            "order_date": new Date().toISOString(),
            "total_amount": orderDetails.total_amount,
            "quantity": "1", // Simplified, can be sum of items
            "seller_name": "Vinayaka Frames",
            "seller_add": "",
            "seller_cst": "",
            "seller_tin": "",
            "seller_inv": orderDetails.order_number,
            "seller_inv_date": new Date().toISOString()
          }
        ],
        "pickup_location": {
          "name": process.env.DELHIVERY_PICKUP_LOCATION || "Default Pickup",
          "city": "",
          "pin": "",
          "country": "India",
          "phone": "",
          "add": ""
        }
      }
    };

    const response = await fetch(`${baseUrl}/api/cmu/create.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`
      },
      // The payload must be a URL encoded string with parameter 'format=json' & 'data=jsonString'
      body: `format=json&data=${encodeURIComponent(JSON.stringify(payload.data))}`
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Delhivery API Error:", data);
      return res.status(400).json({ error: 'Failed to create shipment', details: data });
    }

    // data.packages[0].waybill holds the tracking number
    res.status(200).json({ success: true, waybill: data.packages[0].waybill, status: data });
    
  } catch (error) {
    console.error('Delhivery Create Shipment Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
