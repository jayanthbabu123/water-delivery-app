const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json'); // You'll need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com" // Replace with your project URL
});

const db = admin.firestore();

// Product data to initialize
const initialProducts = [
  {
    id: "water_20l",
    name: "Premium Water Bottle",
    description: "Pure and clean 20-liter water bottle, perfect for home and office use. Sourced from natural springs and filtered through advanced purification systems.",
    category: "water",
    subCategory: "bottled_water",
    specifications: {
      volume: "20 Liters",
      material: "Food-grade plastic",
      type: "Purified Spring Water",
      shelf_life: "6 months",
      certifications: ["ISI", "BIS", "FSSAI"],
    },
    pricing: {
      basePrice: 120,
      currency: "INR",
      bulkDiscount: 10, // 10% discount
      minBulkQuantity: 5,
      maxOrderQuantity: 20,
    },
    availability: {
      isAvailable: true,
      stock: 1000,
      lowStockThreshold: 50,
    },
    delivery: {
      estimatedTime: "2-3 hours",
      freeDeliveryThreshold: 500,
      deliveryFee: 50,
    },
    images: {
      thumbnail: "https://via.placeholder.com/150x200/1976D2/FFFFFF?text=20L+Water",
      gallery: [
        "https://via.placeholder.com/400x500/1976D2/FFFFFF?text=20L+Water+Bottle"
      ],
    },
    features: [
      "100% Pure & Safe",
      "Advanced Filtration",
      "Home Delivery",
      "Eco-friendly Packaging",
      "Quality Assured"
    ],
    tags: ["water", "pure", "home-delivery", "bulk-order"],
    seo: {
      title: "20L Premium Water Bottle - Home Delivery",
      description: "Order pure 20-liter water bottles online with fast home delivery. Quality assured and eco-friendly packaging.",
      keywords: ["water bottle", "20 liter", "home delivery", "pure water"]
    },
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "water_10l",
    name: "Compact Water Bottle",
    description: "Convenient 10-liter water bottle, ideal for small families and offices. Easy to handle and store.",
    category: "water",
    subCategory: "bottled_water",
    specifications: {
      volume: "10 Liters",
      material: "Food-grade plastic",
      type: "Purified Spring Water",
      shelf_life: "6 months",
      certifications: ["ISI", "BIS", "FSSAI"],
    },
    pricing: {
      basePrice: 70,
      currency: "INR",
      bulkDiscount: 8,
      minBulkQuantity: 6,
      maxOrderQuantity: 30,
    },
    availability: {
      isAvailable: true,
      stock: 1500,
      lowStockThreshold: 75,
    },
    delivery: {
      estimatedTime: "2-3 hours",
      freeDeliveryThreshold: 500,
      deliveryFee: 50,
    },
    images: {
      thumbnail: "https://via.placeholder.com/150x180/2196F3/FFFFFF?text=10L+Water",
      gallery: [
        "https://via.placeholder.com/400x450/2196F3/FFFFFF?text=10L+Water+Bottle"
      ],
    },
    features: [
      "Compact Size",
      "Easy to Handle",
      "100% Pure Water",
      "Quick Delivery",
      "Affordable Price"
    ],
    tags: ["water", "compact", "small-family", "office"],
    seo: {
      title: "10L Compact Water Bottle - Quick Delivery",
      description: "Order 10-liter water bottles perfect for small families. Compact, affordable, and quick delivery.",
      keywords: ["10 liter water", "compact bottle", "small family", "office water"]
    },
    displayOrder: 2,
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "water_5l",
    name: "Mini Water Bottle",
    description: "Perfect 5-liter water bottle for personal use and small households. Lightweight and convenient.",
    category: "water",
    subCategory: "bottled_water",
    specifications: {
      volume: "5 Liters",
      material: "Food-grade plastic",
      type: "Purified Spring Water",
      shelf_life: "6 months",
      certifications: ["ISI", "BIS", "FSSAI"],
    },
    pricing: {
      basePrice: 40,
      currency: "INR",
      bulkDiscount: 5,
      minBulkQuantity: 10,
      maxOrderQuantity: 50,
    },
    availability: {
      isAvailable: true,
      stock: 2000,
      lowStockThreshold: 100,
    },
    delivery: {
      estimatedTime: "2-3 hours",
      freeDeliveryThreshold: 500,
      deliveryFee: 50,
    },
    images: {
      thumbnail: "https://via.placeholder.com/150x160/4CAF50/FFFFFF?text=5L+Water",
      gallery: [
        "https://via.placeholder.com/400x400/4CAF50/FFFFFF?text=5L+Water+Bottle"
      ],
    },
    features: [
      "Lightweight",
      "Personal Use",
      "Pure Water",
      "Convenient Size",
      "Budget Friendly"
    ],
    tags: ["water", "mini", "personal", "lightweight"],
    seo: {
      title: "5L Mini Water Bottle - Personal Use",
      description: "Order 5-liter water bottles for personal use. Lightweight, convenient, and budget-friendly.",
      keywords: ["5 liter water", "mini bottle", "personal use", "lightweight water"]
    },
    displayOrder: 3,
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

async function initializeProducts() {
  try {
    console.log('Initializing products in Firestore...');

    const batch = db.batch();

    // Check if products already exist
    const existingProducts = await db.collection('products').get();
    if (!existingProducts.empty) {
      console.log('Products already exist. Skipping initialization.');
      return;
    }

    // Add each product to the batch
    initialProducts.forEach((product) => {
      const productRef = db.collection('products').doc(product.id);
      batch.set(productRef, product);
    });

    // Commit the batch
    await batch.commit();

    console.log(`Successfully initialized ${initialProducts.length} products:`);
    initialProducts.forEach(product => {
      console.log(`- ${product.name} (₹${product.pricing.basePrice})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error initializing products:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeProducts();
