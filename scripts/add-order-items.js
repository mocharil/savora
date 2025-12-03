const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addOrderItems() {
  const orderId = '3a1eb8c4-73dc-45e1-acc9-f96ee8e3bb2b'; // order dari store fc2c603f
  const storeId = 'fc2c603f-163e-484b-83b7-e820e7841f3c';

  // Get menu items from the store
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name, price')
    .eq('store_id', storeId)
    .limit(3);

  console.log('Menu items found:', menuItems?.length || 0, menuError?.message || '');

  if (!menuItems || menuItems.length === 0) {
    console.log('No menu items found for store');
    return;
  }

  menuItems.forEach(m => console.log('  -', m.name, ':', m.price));

  // Add order items
  const orderItems = menuItems.map((item, idx) => ({
    order_id: orderId,
    menu_item_id: item.id,
    quantity: idx + 1,
    unit_price: item.price,
    subtotal: item.price * (idx + 1)
  }));

  console.log('\nInserting order items:', orderItems.length);

  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Inserted:', data?.length, 'items');
    data?.forEach(i => console.log('  - qty:', i.quantity, '| subtotal:', i.subtotal));
  }
}

addOrderItems().catch(console.error);
