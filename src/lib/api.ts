import { supabase } from './supabase';
import { Product, SizeOption, FinishType } from '../data/mockData';

// Map database product to frontend Product interface
const mapProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.categories?.name || 'Uncategorized',
    images: dbProduct.product_images?.map((img: any) => img.image_url) || [],
    description: dbProduct.description,
    rating: Number(dbProduct.rating) || 0,
    reviews: dbProduct.reviews_count || 0,
    price: Number(dbProduct.price),
    originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
    discount: dbProduct.discount || undefined,
    customizable: dbProduct.customizable,
    personalization: {
      photoUpload: dbProduct.photo_upload,
      customName: dbProduct.custom_name,
      customMessage: dbProduct.custom_message,
    },
    stock: dbProduct.stock,
    isNew: dbProduct.is_new,
    isBestSeller: dbProduct.is_best_seller,
    isTrending: dbProduct.is_trending,
    // The sizes and finishes are fetched separately or joined
    sizes: dbProduct.product_sizes?.map((s: any) => ({
      size: s.size,
      price: Number(s.price),
      isLed: s.is_led
    })) || undefined,
    finishTypes: dbProduct.product_finishes?.map((f: any) => f.finish_type) || undefined,
    variants: dbProduct.product_variants?.map((v: any) => ({
      id: v.id,
      name: v.name,
      imageUrl: v.image_url,
      priceAdjustment: Number(v.price_adjustment) || 0
    })) || undefined,
  };
};

export const api = {
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(image_url, is_main),
        product_sizes(size, price, is_led),
        product_finishes(finish_type),
        product_variants(id, name, image_url, price_adjustment)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Sort images so main is first
    data.forEach(p => {
      if (p.product_images) {
        p.product_images.sort((a: any, b: any) => (a.is_main === b.is_main ? 0 : a.is_main ? -1 : 1));
      }
    });

    return data.map(mapProduct);
  },

  async getProductById(idOrSlug: string) {
    if (!idOrSlug) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const LEGACY_ID_MAP: Record<string, string> = {
      p1: '5c06c350-f02d-4b01-a6eb-ea65cc87e278',
      p2: '1c4788a4-b8d0-422c-a5e8-6d64ea4f0492',
      p3: '25f39418-8148-49f9-9b49-f12bea38266d',
      p4: '907a5662-ef0a-4541-ae11-d8696cbd246f',
    };

    const targetId = LEGACY_ID_MAP[idOrSlug] || idOrSlug;
    const targetIsUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

    let query = supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(image_url, is_main),
        product_sizes(size, price, is_led),
        product_finishes(finish_type),
        product_variants(id, name, image_url, price_adjustment)
      `);

    if (targetIsUuid) {
      query = query.eq('id', targetId);
    } else {
      query = query.eq('slug', targetId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }
    
    if (data.product_images) {
      data.product_images.sort((a: any, b: any) => (a.is_main === b.is_main ? 0 : a.is_main ? -1 : 1));
    }

    return mapProduct(data);
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data.map(c => ({
      id: c.slug, // Map slug to id for frontend
      name: c.name,
      image: c.image_url,
    }));
  },

  async getSiteSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) {
      console.error('Error fetching settings:', error);
      return {};
    }

    const settings: Record<string, any> = {};
    data.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  },

  async getReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return data.map(r => ({
      id: r.id,
      name: r.customer_name,
      role: 'Verified Buyer',
      content: r.content,
      rating: r.rating,
      date: new Date(r.created_at).toLocaleDateString(),
    }));
  },

  async submitReview(review: { customer_name: string; rating: number; content: string; product_id?: string }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...review,
        approved: false, // Default pending admin approval
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
    return data;
  },

  async placeOrder(orderData: any, items: any[]) {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let activeDbProducts: any[] | null = null;
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

    const { data, error } = await supabase.rpc('place_order', {
      p_customer_name: (orderData.customer_name || '').trim(),
      p_customer_phone: (orderData.customer_phone || '').trim(),
      p_customer_email: (orderData.customer_email || '').trim(),
      p_address: (orderData.address || '').trim(),
      p_city: (orderData.city || '').trim(),
      p_state: (orderData.state || '').trim(),
      p_pincode: (orderData.pincode || '').trim(),
      p_payment_method: orderData.payment_method || 'COD',
      p_items: sanitizedItems
    });

    if (error) {
      console.error('Supabase placeOrder error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      const msg = error.message || '';
      if (msg.includes('invalid or inactive')) {
        throw new Error('One of the products in your cart is no longer available. Please refresh your cart.');
      } else if (msg.includes('permission') || error.code === '42501') {
        throw new Error('Permission denied. Please refresh the page and try again.');
      } else if (msg.includes('violates') || msg.includes('constraint')) {
        throw new Error('There was an issue with the order details provided. Please check and try again.');
      } else if (error.code === '22P02') {
        throw new Error('Invalid product identification. Please refresh your cart and try again.');
      }
      throw new Error(msg || 'Unable to place your order right now. Please try again.');
    }

    return data; // Returns order_id UUID
  },

  async getOrder(orderId: string) {
    const { data, error } = await supabase.rpc('get_order_by_id', {
      p_order_id: orderId
    });

    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
    return data;
  },

  async getAdminOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Note: Could not fetch admin orders from Supabase:', error.message);
        return [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('getAdminOrders exception:', e?.message || e);
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId);

    if (error) throw error;
  },

  async updateOrderPaymentStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', orderId);

    if (error) throw error;
  },

  async getDashboardStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, order_status, payment_status');

    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: any) => o.order_status === 'Pending').length;
    const processingOrders = orders.filter((o: any) => o.order_status === 'Processing').length;
    const completedOrders = orders.filter((o: any) => o.order_status === 'Delivered').length;
    const cancelledOrders = orders.filter((o: any) => o.order_status === 'Cancelled').length;
    const pendingPayments = orders.filter((o: any) => o.payment_status === 'Pending').length;
    const totalRevenue = orders
      .filter((o: any) => o.order_status !== 'Cancelled')
      .reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      pendingPayments,
      totalRevenue
    };
  },

  async createDelhiveryShipment(orderDetails: any) {
    const response = await fetch('/api/create-delhivery-shipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderDetails })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create shipment');
    }
    return data;
  },

  async updateOrderTracking(orderId: string, awb: string) {
    const { error } = await supabase
      .from('orders')
      .update({ awb_number: awb, tracking_url: `https://delhivery.com/tracking?id=${awb}` })
      .eq('id', orderId);

    if (error) throw error;
  }
};

