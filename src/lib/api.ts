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
        product_finishes(finish_type)
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

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(image_url, is_main),
        product_sizes(size, price, is_led),
        product_finishes(finish_type)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching product:', error);
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
  }
};

