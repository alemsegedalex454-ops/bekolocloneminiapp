import prisma from '../src/lib/prisma';

async function main() {
  try {
    const pCount = await prisma.product.count();
    const cCount = await prisma.category.count();
    const oCount = await prisma.order.count();
    console.log('--- DATABASE STATS ---');
    console.log('Product count:', pCount);
    console.log('Category count:', cCount);
    console.log('Order count:', oCount);

    if (pCount > 0) {
      const sampleProducts = await prisma.product.findMany({ take: 5 });
      console.log('Sample Products:', sampleProducts.map(p => ({ id: p.id, name: p.name, price: p.price, active: p.isActive })));
    } else {
      console.log('No products found in database.');
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
