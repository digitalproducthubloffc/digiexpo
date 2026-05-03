const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const products = [
  {
    title: "The Bauhaus Residencies",
    description: "A comprehensive study of the Bauhaus residencies...",
    details: ["Detailed Floor Plans", "Exclusive Brand Interviews", "80+ Exclusive Photographs"],
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?q=80&w=1000",
    images: [],
    originalPrice: 120.00,
    realPrice: 49.00,
    category: "Architecture",
    inStock: true,
  },
  {
    title: "Expert PDF resources",
    description: "Curated intellectual assets from industry leaders...",
    details: ["Professional Blueprints", "Market Reports", "Strategic Frameworks"],
    image: "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=1000",
    images: [],
    originalPrice: 99.00,
    realPrice: 59.00,
    category: "Business",
    inStock: true,
  },
  {
    title: "Visual Identity Blueprint",
    description: "Detailed blueprints for visual identity systems...",
    details: ["Brand Guidelines", "Logo Variations", "Style Guides"],
    image: "https://images.unsplash.com/photo-1541462608141-ad6019705c84?q=80&w=1000",
    images: [],
    originalPrice: 150.00,
    realPrice: 89.00,
    category: "Creative",
    inStock: true,
  }
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digiexpo');
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Database Seeded!');
  mongoose.connection.close();
};

seedDB();
