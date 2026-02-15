const menuData = require("../data/menuData.json");

class MenuModel {
  /**
   * Get all subscription plans
   */
  static getAllPlans() {
    return menuData.plans;
  }

  /**
   * Get plan by type (basic, standard, premium)
   */
  static getPlan(planType) {
    return menuData.plans[planType.toLowerCase()] || null;
  }

  /**
   * Get weekly menu for a specific plan type
   */
  static getWeeklyMenu(planType) {
    return menuData.weeklyMenus[planType.toLowerCase()] || null;
  }

  /**
   * Get menu for a specific day and plan
   */
  static getDayMenu(planType, day) {
    const weeklyMenu = this.getWeeklyMenu(planType);
    if (!weeklyMenu) return null;
    return weeklyMenu[day.toLowerCase()] || null;
  }

  /**
   * Get Saturday special options (Premium only)
   */
  static getSaturdaySpecials() {
    const premiumSaturday = menuData.weeklyMenus.premium.saturday;
    return {
      specialFoodOptions: premiumSaturday.specialFoodOptions,
      dessertOptions: premiumSaturday.dessertOptions,
    };
  }

  /**
   * Get service information
   */
  static getServiceInfo() {
    return menuData.serviceInfo;
  }
}

module.exports = MenuModel;
