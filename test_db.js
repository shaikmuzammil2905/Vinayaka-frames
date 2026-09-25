import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcyjbljpgdggmomlisxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeWpibGpwZ2RnZ21vbWxpc3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDYxNzUsImV4cCI6MjEwNTMyMjE3NX0.ad7SXUA31dTgKzs91t1yaQAL8BNB8ziMQ1NQ8VWzkWY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: catData, error: catError } = await supabase.from('categories').select('*').eq('slug', 'death-frames').maybeSingle();
  console.log('Category:', catData, catError);
  
  if (catData) {
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
      .eq('category_id', catData.id)
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    console.log('Products returned by exact api.ts query:', data?.length, error);
    console.log('First product data:', JSON.stringify(data?.[0], null, 2));
  } else {
    console.log("Category 'death-frames' not found by slug");
  }

  // Find all categories
  const { data: allCats } = await supabase.from('categories').select('id, name, slug');
  console.log('\nAll Categories:', allCats);

  // Find all products
  const { data: allProds } = await supabase.from('products').select('id, name, slug, category_id, active');
  console.log('\nAll Products (sample):', allProds?.slice(0, 10));
}
test();
