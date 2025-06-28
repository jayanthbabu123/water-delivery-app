import firestore from "@react-native-firebase/firestore";

// Product service for managing product data and operations
export class ProductService {
  // Get all active products
  static async getProducts() {
    try {
      console.log("📦 ProductService: Fetching products from Firestore...");
      const productsRef = firestore().collection("products");

      // First try without orderBy to avoid index issues
      const snapshot = await productsRef.where("isActive", "==", true).get();

      console.log(
        "📦 ProductService: Firestore query completed, docs:",
        snapshot.size,
      );

      const products = [];
      snapshot.forEach((doc) => {
        const productData = {
          id: doc.id,
          ...doc.data(),
        };
        console.log("📦 ProductService: Found product:", productData.name);
        products.push(productData);
      });

      // Sort by displayOrder manually
      products.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      console.log("📦 ProductService: Returning", products.length, "products");
      return products;
    } catch (error) {
      console.error("❌ ProductService: Error getting products:", error);
      throw new Error("Failed to load products");
    }
  }

  // Get product by ID
  static async getProductById(productId) {
    try {
      const productDoc = await firestore()
        .collection("products")
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        return null;
      }

      return {
        id: productDoc.id,
        ...productDoc.data(),
      };
    } catch (error) {
      console.error("Error getting product:", error);
      throw new Error("Failed to get product details");
    }
  }

  // Get products by category
  static async getProductsByCategory(category) {
    try {
      const productsRef = firestore().collection("products");
      const snapshot = await productsRef
        .where("category", "==", category)
        .where("isActive", "==", true)
        .orderBy("displayOrder", "asc")
        .get();

      const products = [];
      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return products;
    } catch (error) {
      console.error("Error getting products by category:", error);
      throw new Error("Failed to load products by category");
    }
  }

  // Calculate total price for given quantity
  static calculateTotalPrice(product, quantity) {
    if (!product || !product.pricing) {
      return 0;
    }

    const basePrice = product.pricing.basePrice || 0;
    const bulkDiscount = product.pricing.bulkDiscount || 0;
    const minBulkQuantity = product.pricing.minBulkQuantity || 5;

    let totalPrice = basePrice * quantity;

    // Apply bulk discount if applicable
    if (quantity >= minBulkQuantity && bulkDiscount > 0) {
      const discountAmount = totalPrice * (bulkDiscount / 100);
      totalPrice = totalPrice - discountAmount;
    }

    return parseFloat(totalPrice.toFixed(2));
  }

  // Get delivery fee based on quantity or total order value
  static calculateDeliveryFee(totalOrderValue, quantity) {
    // Free delivery for orders above ₹500 or quantity > 3
    if (totalOrderValue >= 500 || quantity > 3) {
      return 0;
    }

    // Standard delivery fee
    return 50;
  }

  // Create initial products (for setup)
  static async createInitialProducts() {
    try {
      console.log("📦 ProductService: Creating initial products...");
      const products = [
        {
          id: "water_20l",
          name: "Premium Water Bottle",
          description:
            "Pure and clean 20-liter water bottle, perfect for home and office use. Sourced from natural springs and filtered through advanced purification systems.",
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
            thumbnail:
              "https://via.placeholder.com/150x200/1976D2/FFFFFF?text=20L+Water",
            gallery: [
              "https://via.placeholder.com/400x500/1976D2/FFFFFF?text=20L+Water+Bottle",
            ],
          },
          features: [
            "100% Pure & Safe",
            "Advanced Filtration",
            "Home Delivery",
            "Eco-friendly Packaging",
            "Quality Assured",
          ],
          tags: ["water", "pure", "home-delivery", "bulk-order"],
          seo: {
            title: "20L Premium Water Bottle - Home Delivery",
            description:
              "Order pure 20-liter water bottles online with fast home delivery. Quality assured and eco-friendly packaging.",
            keywords: [
              "water bottle",
              "20 liter",
              "home delivery",
              "pure water",
            ],
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
          description:
            "Convenient 10-liter water bottle, ideal for small families and offices. Easy to handle and store.",
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
            thumbnail:
              "https://via.placeholder.com/150x180/2196F3/FFFFFF?text=10L+Water",
            gallery: [
              "https://via.placeholder.com/400x450/2196F3/FFFFFF?text=10L+Water+Bottle",
            ],
          },
          features: [
            "Compact Size",
            "Easy to Handle",
            "100% Pure Water",
            "Quick Delivery",
            "Affordable Price",
          ],
          tags: ["water", "compact", "small-family", "office"],
          seo: {
            title: "10L Compact Water Bottle - Quick Delivery",
            description:
              "Order 10-liter water bottles perfect for small families. Compact, affordable, and quick delivery.",
            keywords: [
              "10 liter water",
              "compact bottle",
              "small family",
              "office water",
            ],
          },
          displayOrder: 2,
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const batch = firestore().batch();

      products.forEach((product) => {
        const productRef = firestore().collection("products").doc(product.id);
        console.log(
          "📦 ProductService: Adding product to batch:",
          product.name,
        );
        batch.set(productRef, product);
      });

      console.log("📦 ProductService: Committing batch write to Firestore...");
      await batch.commit();
      console.log("✅ ProductService: Initial products created successfully");
      return true;
    } catch (error) {
      console.error("Error creating initial products:", error);
      throw new Error("Failed to create initial products");
    }
  }

  // Update product stock
  static async updateStock(productId, newStock) {
    try {
      await firestore().collection("products").doc(productId).update({
        "availability.stock": newStock,
        updatedAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error("Error updating product stock:", error);
      throw new Error("Failed to update product stock");
    }
  }

  // Check if product is available for given quantity
  static async checkAvailability(productId, requestedQuantity) {
    try {
      const product = await this.getProductById(productId);

      if (!product) {
        return { available: false, reason: "Product not found" };
      }

      if (!product.availability.isAvailable) {
        return { available: false, reason: "Product is currently unavailable" };
      }

      if (product.availability.stock < requestedQuantity) {
        return {
          available: false,
          reason: "Insufficient stock",
          availableStock: product.availability.stock,
        };
      }

      if (requestedQuantity > product.pricing.maxOrderQuantity) {
        return {
          available: false,
          reason: `Maximum order quantity is ${product.pricing.maxOrderQuantity}`,
          maxQuantity: product.pricing.maxOrderQuantity,
        };
      }

      return { available: true };
    } catch (error) {
      console.error("Error checking product availability:", error);
      return { available: false, reason: "Error checking availability" };
    }
  }

  // Get product categories
  static async getCategories() {
    try {
      const snapshot = await firestore()
        .collection("products")
        .where("isActive", "==", true)
        .get();

      const categories = new Set();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category) {
          categories.add(data.category);
        }
      });

      return Array.from(categories);
    } catch (error) {
      console.error("Error getting product categories:", error);
      throw new Error("Failed to get product categories");
    }
  }

  // Search products by name or description
  static async searchProducts(searchTerm) {
    try {
      const searchTermLower = searchTerm.toLowerCase();
      const snapshot = await firestore()
        .collection("products")
        .where("isActive", "==", true)
        .get();

      const products = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name.toLowerCase();
        const description = data.description.toLowerCase();
        const tags = data.tags || [];

        if (
          name.includes(searchTermLower) ||
          description.includes(searchTermLower) ||
          tags.some((tag) => tag.toLowerCase().includes(searchTermLower))
        ) {
          products.push({
            id: doc.id,
            ...data,
          });
        }
      });

      return products;
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }
  }
}

export default ProductService;
