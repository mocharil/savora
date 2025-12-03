const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const storeId = 'fc2c603f-163e-484b-83b7-e820e7841f3c';

  console.log('Checking analytics data for store:', storeId);
  console.log('---');

  // Get ALL orders without date filter
  const { data: allOrders, error } = await supabase
    .from('orders')
    .select('id, status, created_at, total')
    .eq('store_id', storeId);

  if (error) {
    console.log('Error fetching orders:', error.message);
    return;
  }

  console.log('Total orders:', allOrders?.length || 0);
  allOrders?.forEach(o => {
    console.log(`  - ${o.id.substring(0,8)} | status: ${o.status} | created: ${o.created_at} | total: ${o.total}`);
  });

  // Check completed orders
  const completedOrders = allOrders?.filter(o => o.status === 'completed') || [];
  console.log('\nCompleted orders:', completedOrders.length);

  if (completedOrders.length > 0) {
    // Get order items
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select(`
        order_id,
        quantity,
        price,
        menu_item:menu_items(id, name)
      `)
      .in('order_id', completedOrders.map(o => o.id));

    console.log('Order items:', items?.length || 0, itemsErr?.message || '');
    items?.forEach(i => {
      const menuItem = i.menu_item;
      console.log(`  - order: ${i.order_id.substring(0,8)} | menu: ${menuItem?.name || 'N/A'} | qty: ${i.quantity} | price: ${i.price}`);
    });
  }

  // Check date range issue
  console.log('\n--- Date Range Check ---');
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  console.log('Now:', now.toISOString());
  console.log('Week ago:', weekAgo.toISOString());

  allOrders?.forEach(o => {
    const orderDate = new Date(o.created_at);
    const inRange = orderDate >= weekAgo && orderDate <= now;
    console.log(`  - ${o.id.substring(0,8)} | ${o.created_at} | in 7-day range: ${inRange}`);
  });
}

check().catch(console.error);
