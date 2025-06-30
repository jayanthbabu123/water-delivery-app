// Utility functions for delivery time calculations
export class DeliveryTimeUtils {
  // Calculate estimated delivery time based on order placement time
  static calculateEstimatedDelivery(orderTime = new Date()) {
    const date = new Date(orderTime);
    const currentHour = date.getHours();
    const currentMinute = date.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes
    
    // Cutoff times in minutes (9am = 540, 5pm = 1020)
    const morningCutoff = 9 * 60; // 9:00 AM
    const eveningCutoff = 17 * 60; // 5:00 PM
    
    let deliveryDate = new Date(date);
    let deliveryTime;
    
    if (currentTime >= morningCutoff && currentTime < eveningCutoff) {
      // Order placed between 9am-5pm: deliver after 5pm same day
      deliveryTime = "5:00 PM";
    } else {
      // Order placed after 5pm or before 9am: deliver after 9am next day
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      deliveryTime = "9:00 AM";
    }
    
    const options = { weekday: "short", month: "short", day: "numeric" };
    const formattedDate = deliveryDate.toLocaleDateString("en-US", options);
    
    return `${formattedDate} by ${deliveryTime}`;
  }

  // Get delivery policy description
  static getDeliveryPolicy() {
    return "Orders placed 9am-5pm: Same day by 5pm • Orders after 5pm: Next day by 9am";
  }

  // Check if order is eligible for same-day delivery
  static isEligibleForSameDayDelivery(orderTime = new Date()) {
    const date = new Date(orderTime);
    const currentHour = date.getHours();
    const currentMinute = date.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const morningCutoff = 9 * 60; // 9:00 AM
    const eveningCutoff = 17 * 60; // 5:00 PM
    
    return currentTime >= morningCutoff && currentTime < eveningCutoff;
  }

  // Get next delivery slot
  static getNextDeliverySlot(orderTime = new Date()) {
    const isSameDay = this.isEligibleForSameDayDelivery(orderTime);
    
    if (isSameDay) {
      return "5:00 PM today";
    } else {
      const tomorrow = new Date(orderTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const options = { weekday: "short", month: "short", day: "numeric" };
      const formattedDate = tomorrow.toLocaleDateString("en-US", options);
      return `9:00 AM ${formattedDate}`;
    }
  }
}

export default DeliveryTimeUtils; 