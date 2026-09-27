import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcyjbljpgdggmomlisxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeWpibGpwZ2RnZ21vbWxpc3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDYxNzUsImV4cCI6MjEwNTMyMjE3NX0.ad7SXUA31dTgKzs91t1yaQAL8BNB8ziMQ1NQ8VWzkWY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDemoProducts() {
  console.log("Fetching all categories...");
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  
  if (catError || !categories) {
    console.error("Error fetching categories:", catError);
    return;
  }

  console.log(`Found ${categories.length} categories. Generating demo products...`);

  for (const category of categories) {
    // Check if category already has products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id);

    if (count && count > 0) {
      console.log(`Category '${category.name}' already has products. Skipping...`);
      continue;
    }

    const demoProducts = [
      {
        name: `Premium ${category.name} Edition`,
        slug: `premium-${category.slug}-edition-${Date.now()}`,
        description: `This is a beautiful premium edition for ${category.name}. Perfect for gifting and personal use.`,
        price: 999.00,
        original_price: 1299.00,
        category_id: category.id,
        active: true,
        stock: true,
        is_new: true,
        is_best_seller: false,
        is_trending: true
      },
      {
        name: `Classic ${category.name}`,
        slug: `classic-${category.slug}-${Date.now()}`,
        description: `Our classic style ${category.name} featuring timeless design and excellent build quality.`,
        price: 599.00,
        original_price: 799.00,
        category_id: category.id,
        active: true,
        stock: true,
        is_new: false,
        is_best_seller: true,
        is_trending: false
      }
    ];

    const { error: insertError } = await supabase.from('products').insert(demoProducts);
    
    if (insertError) {
      console.error(`Error inserting products for '${category.name}':`, insertError);
    } else {
      console.log(`Successfully added 2 demo products for '${category.name}'`);
      
      // Try to get the inserted products to add images
      const { data: insertedProducts } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false })
        .limit(2);
        
      if (insertedProducts && insertedProducts.length > 0) {
        for (const prod of insertedProducts) {
          await supabase.from('product_images').insert([
            { product_id: prod.id, image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', is_main: true },
            { product_id: prod.id, image_url: 'https://images.unsplash.com/photo-1544253139-4cb5038ec673?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', is_main: false }
          ]);
        }
      }
    }
  }
  console.log("Seeding complete!");
}

seedDemoProducts();
