const seedDatabase = require('./seed');

async function addSampleProduct() {
  let exitCode = 0;

  try {
    console.log('🔧 Ensuring starter jewelry catalog is available...');
    await seedDatabase();
    console.log('🎉 Starter catalog is ready.');
  } catch (error) {
    console.error('❌ Error ensuring starter catalog:', error);
    exitCode = 1;
  } finally {
    process.exit(exitCode);
  }
}

if (require.main === module) {
  addSampleProduct();
}

module.exports = addSampleProduct;
