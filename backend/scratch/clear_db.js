const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Updated list of collections based on actual models
    const collections = ['users', 'products', 'transactions', 'blogs', 'supports', 'visitors'];
    
    for (const collection of collections) {
      try {
        console.log(`Clearing collection: ${collection}...`);
        await mongoose.connection.collection(collection).deleteMany({});
      } catch (e) {
        console.log(`Collection ${collection} does not exist or could not be cleared. Skipping.`);
      }
    }

    console.log('Database cleared successfully for launch! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
}

clearDatabase();
