const mongoose = require('mongoose');
require('dotenv').config();

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/digiexpo');
    console.log('Connected to MongoDB.');
    
    const User = mongoose.model('User', new mongoose.Schema({}));
    const result = await User.deleteMany({});
    
    console.log(`Successfully deleted ${result.deletedCount} users from the database.`);
    process.exit(0);
  } catch (err) {
    console.error('Error clearing users:', err);
    process.exit(1);
  }
}

clearUsers();
