import firestore from "@react-native-firebase/firestore";
import { DeliveryTimeUtils } from "../utils/deliveryTime";

// Order service for managing order data and operations
export class OrderService {
  // Order status constants
  static ORDER_STATUS = {
    PLACED: "placed",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    FAILED: "failed",
  };

  // Payment status constants
  static PAYMENT_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
  };

  // Create a new order
  static async createOrder(orderData) {
    try {
      console.log(
        "📝 OrderService: Starting order creation with data:",
        orderData,
      );

      // Generate order ID with timestamp
      const timestamp = Date.now();
      const orderId = `ORD${timestamp}`;
      console.log("📝 OrderService: Generated order ID:", orderId);

      const order = {
        orderId: orderId,
        userId: orderData.userId,
        communityId: orderData.communityId,
        status: this.ORDER_STATUS.PLACED,
        paymentStatus: this.PAYMENT_STATUS.PENDING,

        // Product details
        products: orderData.products.map((product) => ({
          productId: product.productId,
          name: product.name,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          totalPrice: product.totalPrice,
          specifications: product.specifications || {},
        })),

        // Order totals
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee || 0,
        discount: orderData.discount || 0,
        tax: orderData.tax || 0,
        totalAmount: orderData.totalAmount,

        // Delivery details
        deliveryAddress: {
          communityId: orderData.deliveryAddress.communityId,
          communityName: orderData.deliveryAddress.communityName,
          apartmentNumber: orderData.deliveryAddress.apartmentNumber,
          fullAddress: orderData.deliveryAddress.fullAddress || `${orderData.deliveryAddress.communityName}, Unit ${orderData.deliveryAddress.apartmentNumber}`,
          contactName: orderData.deliveryAddress.contactName,
          contactPhone: orderData.deliveryAddress.contactPhone,
          specialInstructions:
            orderData.deliveryAddress.specialInstructions || "",
        },

        // Payment details
        paymentMethod: {
          type: orderData.paymentMethod.type, // 'card', 'wallet', 'cash'
          cardId: orderData.paymentMethod.cardId || null,
          cardLastFour: orderData.paymentMethod.cardLastFour || null,
          cardType: orderData.paymentMethod.cardType || null,
        },

        // Delivery scheduling
        deliverySchedule: {
          preferredTime: orderData.deliverySchedule?.preferredTime || "asap",
          estimatedDelivery:
            orderData.deliverySchedule?.estimatedDelivery ||
            this.calculateEstimatedDelivery(),
          actualDelivery: null,
        },

        // Order metadata
        orderNotes: orderData.orderNotes || "",
        source: "mobile_app",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // Status history
        statusHistory: [
          {
            status: this.ORDER_STATUS.PLACED,
            timestamp: new Date().toISOString(),
            note: "Order placed successfully",
            updatedBy: "system",
          },
        ],
      };

      // Save order to Firestore
      console.log("📝 OrderService: Saving order to Firestore...");
      await firestore().collection("orders").doc(orderId).set(order);
      console.log("✅ OrderService: Order saved to Firestore successfully");

      // Update product stock
      console.log("📝 OrderService: Updating product stock...");
      for (const product of orderData.products) {
        await this.updateProductStock(product.productId, product.quantity);
        console.log(
          `📝 OrderService: Updated stock for product ${product.productId}`,
        );
      }

      console.log("✅ OrderService: Order creation completed successfully");
      return {
        success: true,
        orderId: orderId,
        order: order,
      };
    } catch (error) {
      console.error("❌ OrderService: Error creating order:", error);
      console.error("❌ OrderService: Error details:", error.message);
      console.error("❌ OrderService: Error stack:", error.stack);
      throw new Error("Failed to create order");
    }
  }

  // Get orders for a specific user
  static async getUserOrders(userId, limit = 20, startAfter = null) {
    try {
      console.log("📦 OrderService: Getting orders for user:", userId);

      // First try with orderBy (requires index)
      try {
        let query = firestore()
          .collection("orders")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .limit(limit);

        if (startAfter) {
          query = query.startAfter(startAfter);
        }

        const snapshot = await query.get();
        const orders = [];

        snapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        console.log(
          "📦 OrderService: Found",
          orders.length,
          "orders with index",
        );
        return orders;
      } catch (indexError) {
        console.log(
          "📦 OrderService: Index not available, using fallback query",
        );

        // Fallback: Query without orderBy and sort in memory
        const snapshot = await firestore()
          .collection("orders")
          .where("userId", "==", userId)
          .limit(limit)
          .get();

        const orders = [];
        snapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort by createdAt in memory
        orders.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA; // Descending order (newest first)
        });

        console.log(
          "📦 OrderService: Found",
          orders.length,
          "orders with fallback",
        );
        return orders;
      }
    } catch (error) {
      console.error("❌ OrderService: Error getting user orders:", error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Get order by ID
  static async getOrderById(orderId) {
    try {
      const orderDoc = await firestore()
        .collection("orders")
        .doc(orderId)
        .get();

      if (!orderDoc.exists) {
        return null;
      }

      return {
        id: orderDoc.id,
        ...orderDoc.data(),
      };
    } catch (error) {
      console.error("Error getting order:", error);
      throw new Error("Failed to get order details");
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId,
    newStatus,
    note = "",
    updatedBy = "system",
  ) {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      const statusUpdate = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...order.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note,
            updatedBy: updatedBy,
          },
        ],
      };

      // If delivered, update actual delivery time
      if (newStatus === this.ORDER_STATUS.DELIVERED) {
        statusUpdate["deliverySchedule.actualDelivery"] =
          new Date().toISOString();
      }

      await firestore().collection("orders").doc(orderId).update(statusUpdate);

      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error("Failed to update order status");
    }
  }

  // Update payment status
  static async updatePaymentStatus(
    orderId,
    paymentStatus,
    paymentDetails = {},
  ) {
    try {
      const updateData = {
        paymentStatus: paymentStatus,
        updatedAt: new Date().toISOString(),
      };

      // Add payment details if provided
      if (paymentDetails.transactionId) {
        updateData["paymentDetails.transactionId"] =
          paymentDetails.transactionId;
      }
      if (paymentDetails.paymentMethod) {
        updateData["paymentDetails.method"] = paymentDetails.paymentMethod;
      }
      if (paymentDetails.paidAt) {
        updateData["paymentDetails.paidAt"] = paymentDetails.paidAt;
      }

      await firestore().collection("orders").doc(orderId).update(updateData);

      return true;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw new Error("Failed to update payment status");
    }
  }

  // Cancel order
  static async cancelOrder(orderId, reason = "", cancelledBy = "customer") {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Check if order can be cancelled
      if (order.status === this.ORDER_STATUS.DELIVERED) {
        throw new Error("Cannot cancel delivered order");
      }

      if (order.status === this.ORDER_STATUS.CANCELLED) {
        throw new Error("Order is already cancelled");
      }

      // Update order status to cancelled
      await this.updateOrderStatus(
        orderId,
        this.ORDER_STATUS.CANCELLED,
        `Order cancelled: ${reason}`,
        cancelledBy,
      );

      // Restore product stock
      for (const product of order.products) {
        await this.restoreProductStock(product.productId, product.quantity);
      }

      return true;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw new Error("Failed to cancel order");
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status, limit = 50) {
    try {
      const snapshot = await firestore()
        .collection("orders")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const orders = [];
      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return orders;
    } catch (error) {
      console.error("Error getting orders by status:", error);
      throw new Error("Failed to load orders");
    }
  }

  // Get orders for a specific community (for delivery partners)
  static async getCommunityOrders(communityId, status = null) {
    try {
      let query = firestore()
        .collection("orders")
        .where("communityId", "==", communityId)
        .orderBy("createdAt", "desc");

      if (status) {
        query = query.where("status", "==", status);
      }

      const snapshot = await query.get();
      const orders = [];

      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return orders;
    } catch (error) {
      console.error("Error getting community orders:", error);
      throw new Error("Failed to load community orders");
    }
  }

  // Calculate estimated delivery time
  static calculateEstimatedDelivery() {
    return DeliveryTimeUtils.calculateEstimatedDelivery();
  }

  // Update product stock (decrease)
  static async updateProductStock(productId, quantity) {
    try {
      const productRef = firestore().collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (productDoc.exists) {
        const currentStock = productDoc.data().availability.stock;
        const newStock = Math.max(0, currentStock - quantity);

        await productRef.update({
          "availability.stock": newStock,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating product stock:", error);
      // Don't throw error as this is a background operation
    }
  }

  // Restore product stock (increase)
  static async restoreProductStock(productId, quantity) {
    try {
      const productRef = firestore().collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (productDoc.exists) {
        const currentStock = productDoc.data().availability.stock;
        const newStock = currentStock + quantity;

        await productRef.update({
          "availability.stock": newStock,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error restoring product stock:", error);
      // Don't throw error as this is a background operation
    }
  }

  // Get order statistics for user
  static async getUserOrderStats(userId) {
    try {
      const snapshot = await firestore()
        .collection("orders")
        .where("userId", "==", userId)
        .get();

      const stats = {
        totalOrders: 0,
        totalSpent: 0,
        ordersByStatus: {},
      };

      snapshot.forEach((doc) => {
        const order = doc.data();
        stats.totalOrders++;
        stats.totalSpent += order.totalAmount;

        if (stats.ordersByStatus[order.status]) {
          stats.ordersByStatus[order.status]++;
        } else {
          stats.ordersByStatus[order.status] = 1;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting user order stats:", error);
      throw new Error("Failed to get order statistics");
    }
  }

  // Validate order data before creation
  static validateOrderData(orderData) {
    const errors = [];

    // Required fields validation
    if (!orderData.userId) {
      errors.push("User ID is required");
    }

    if (!orderData.communityId) {
      errors.push("Community ID is required");
    }

    if (!orderData.products || orderData.products.length === 0) {
      errors.push("At least one product is required");
    }

    if (!orderData.deliveryAddress) {
      errors.push("Delivery address is required");
    }

    if (!orderData.paymentMethod) {
      errors.push("Payment method is required");
    }

    if (!orderData.totalAmount || orderData.totalAmount <= 0) {
      errors.push("Total amount must be greater than 0");
    }

    // Product validation
    if (orderData.products) {
      orderData.products.forEach((product, index) => {
        if (!product.productId) {
          errors.push(`Product ${index + 1}: Product ID is required`);
        }
        if (!product.quantity || product.quantity <= 0) {
          errors.push(`Product ${index + 1}: Quantity must be greater than 0`);
        }
        if (!product.unitPrice || product.unitPrice <= 0) {
          errors.push(
            `Product ${index + 1}: Unit price must be greater than 0`,
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Format order for display
  static formatOrderForDisplay(order) {
    return {
      ...order,
      formattedTotal: `₹${order.totalAmount.toFixed(2)}`,
      formattedDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      statusDisplay: this.getStatusDisplay(order.status),
      paymentStatusDisplay: this.getPaymentStatusDisplay(order.paymentStatus),
    };
  }

  // Get display text for order status
  static getStatusDisplay(status) {
    const statusMap = {
      [this.ORDER_STATUS.PLACED]: "Order Placed",
      [this.ORDER_STATUS.CONFIRMED]: "Confirmed",
      [this.ORDER_STATUS.PREPARING]: "Preparing",
      [this.ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
      [this.ORDER_STATUS.DELIVERED]: "Delivered",
      [this.ORDER_STATUS.CANCELLED]: "Cancelled",
      [this.ORDER_STATUS.FAILED]: "Failed",
    };

    return statusMap[status] || status;
  }

  // Get display text for payment status
  static getPaymentStatusDisplay(paymentStatus) {
    const statusMap = {
      [this.PAYMENT_STATUS.PENDING]: "Payment Pending",
      [this.PAYMENT_STATUS.PROCESSING]: "Processing Payment",
      [this.PAYMENT_STATUS.COMPLETED]: "Payment Completed",
      [this.PAYMENT_STATUS.FAILED]: "Payment Failed",
      [this.PAYMENT_STATUS.REFUNDED]: "Refunded",
    };

    return statusMap[paymentStatus] || paymentStatus;
  }
}

export default OrderService;
