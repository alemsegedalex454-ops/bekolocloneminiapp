import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@bekollo.com' },
    update: {},
    create: {
      email: 'admin@bekollo.com',
      password: hashedPassword,
      name: 'Store Admin',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'men' },
      update: {},
      create: { name: 'Men', slug: 'men', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'women' },
      update: {},
      create: { name: 'Women', slug: 'women', sortOrder: 2 },
    }),
  ]);
  console.log(`✅ Categories created: ${categories.map((c) => c.name).join(', ')}`);

  // Create sample products
  const sampleProducts = [
    {
      name: 'MG Red T-Shirt',
      slug: 'mg-red-t-shirt',
      description: 'Classic red t-shirt made from premium cotton. Comfortable fit for everyday wear.',
      price: 299,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Red', hex: '#DC2626' }],
      stock: 50,
      categoryId: categories[0].id,
    },
    {
      name: 'MG Black T-Shirt',
      slug: 'mg-black-t-shirt',
      description: 'Essential black t-shirt with a modern fit. Perfect for any occasion.',
      price: 299,
      images: ['https://images.unsplash.com/photo-1503341504253-dff4f82297fa?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#1A1A1A' }],
      stock: 45,
      categoryId: categories[0].id,
    },
    {
      name: 'MG Burgundy T-Shirt',
      slug: 'mg-burgundy-t-shirt',
      description: 'Rich burgundy t-shirt with premium fabric. Soft and durable.',
      price: 299,
      images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Burgundy', hex: '#800020' }],
      stock: 30,
      categoryId: categories[0].id,
    },
    {
      name: 'MG Light Green T-Shirt',
      slug: 'mg-light-green-t-shirt',
      description: 'Fresh light green t-shirt for a casual look. Breathable material.',
      price: 299,
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Light Green', hex: '#86EFAC' }],
      stock: 35,
      categoryId: categories[0].id,
    },
    {
      name: 'Malia Neon Green T-Shirt',
      slug: 'malia-neon-green-t-shirt',
      description: 'Eye-catching neon green t-shirt. Stand out from the crowd.',
      price: 199,
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Neon Green', hex: '#39FF14' }],
      stock: 40,
      categoryId: categories[0].id,
    },
    {
      name: 'Malia Blue T-Shirt',
      slug: 'malia-blue-t-shirt',
      description: 'Cool blue t-shirt perfect for summer. Lightweight and comfortable.',
      price: 199,
      images: ['https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Blue', hex: '#3B82F6' }],
      stock: 55,
      categoryId: categories[0].id,
    },
    {
      name: 'Grey Full Sleeve T-Shirt',
      slug: 'grey-full-sleeve-t-shirt',
      description: 'Elegant grey full sleeve t-shirt. Perfect for layering.',
      price: 399,
      images: ['https://images.unsplash.com/photo-1618354691551-44de113f0164?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Grey', hex: '#9CA3AF' }],
      stock: 25,
      categoryId: categories[1].id,
    },
    {
      name: 'Sabi Green Full Sleeve Top',
      slug: 'sabi-green-full-sleeve-top',
      description: 'Stylish green full sleeve top for women. Modern and versatile.',
      price: 399,
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Green', hex: '#22C55E' }],
      stock: 20,
      categoryId: categories[1].id,
    },
    {
      name: 'Sabi Half Sleeve Grey Top',
      slug: 'sabi-half-sleeve-grey-top',
      description: 'Comfortable half sleeve grey top. Casual and chic.',
      price: 399,
      images: ['https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Grey', hex: '#D1D5DB' }],
      stock: 30,
      categoryId: categories[1].id,
    },
    {
      name: 'Red Crop Top',
      slug: 'red-crop-top',
      description: 'Bold red crop top for a trendy look. Flattering fit.',
      price: 499,
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cda3aa5?w=500'],
      sizes: ['S', 'M', 'L'],
      colors: [{ name: 'Red', hex: '#EF4444' }],
      stock: 15,
      categoryId: categories[1].id,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log(`✅ ${sampleProducts.length} products created`);

  // Create default store settings
  const defaultSettings = [
    { key: 'storeName', value: 'Bekollo' },
    { key: 'storeTagline', value: 'ዋጋው! Online Shop' },
    { key: 'currency', value: JSON.stringify({ symbol: 'Br', code: 'ETB' }) },
    { key: 'contactEmail', value: 'info@bekollo.com' },
    { key: 'contactPhone', value: '+251911000000' },
    { key: 'shippingMethods', value: JSON.stringify([
      { name: 'Standard Delivery', price: 0, description: 'Free delivery within Addis Ababa' },
      { name: 'Express Delivery', price: 100, description: 'Same day delivery' },
    ]) },
    { key: 'paymentMethods', value: JSON.stringify([
      { id: 'cod', name: 'Cash on Delivery', enabled: true },
      { id: 'bank_transfer', name: 'Bank Transfer', enabled: true },
      { id: 'telebirr', name: 'Telebirr', enabled: false },
    ]) },
  ];

  for (const setting of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ Store settings created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Admin login: admin@bekollo.com / admin123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
