const MenuModel = require("../models/menu.model");
const ResponseUtil = require("../utils/response.util");

class MenuController {
  /**
   * Get all subscription plans
   */
  static getAllPlans(req, res) {
    try {
      const plans = MenuModel.getAllPlans();
      ResponseUtil.send(res, 200, "Plans retrieved successfully", { plans });
    } catch (error) {
      console.error("Error getting plans:", error);
      ResponseUtil.error(res, 500, "Failed to retrieve plans", error);
    }
  }

  /**
   * Get specific plan details
   */
  static getPlan(req, res) {
    try {
      const { planType } = req.params;
      const plan = MenuModel.getPlan(planType);

      if (!plan) {
        return ResponseUtil.error(res, 404, "Plan not found");
      }

      ResponseUtil.send(res, 200, "Plan retrieved successfully", { plan });
    } catch (error) {
      console.error("Error getting plan:", error);
      ResponseUtil.error(res, 500, "Failed to retrieve plan", error);
    }
  }

  /**
   * Get weekly menu for a plan
   */
  static getWeeklyMenu(req, res) {
    try {
      const { planType } = req.params;
      const weeklyMenu = MenuModel.getWeeklyMenu(planType);

      if (!weeklyMenu) {
        return ResponseUtil.error(res, 404, "Menu not found for this plan");
      }

      ResponseUtil.send(res, 200, "Weekly menu retrieved successfully", {
        planType,
        weeklyMenu,
      });
    } catch (error) {
      console.error("Error getting weekly menu:", error);
      ResponseUtil.error(res, 500, "Failed to retrieve weekly menu", error);
    }
  }

  /**
   * Get menu for specific day
   */
  static getDayMenu(req, res) {
    try {
      const { planType, day } = req.params;
      const dayMenu = MenuModel.getDayMenu(planType, day);

      if (!dayMenu) {
        return ResponseUtil.error(res, 404, "Menu not found for this day/plan");
      }

      ResponseUtil.send(res, 200, "Day menu retrieved successfully", {
        planType,
        day,
        menu: dayMenu,
      });
    } catch (error) {
      console.error("Error getting day menu:", error);
      ResponseUtil.error(res, 500, "Failed to retrieve day menu", error);
    }
  }

  /**
   * Get Saturday special options (Premium only)
   */
  static getSaturdaySpecials(req, res) {
    try {
      const specials = MenuModel.getSaturdaySpecials();
      ResponseUtil.send(res, 200, "Saturday specials retrieved successfully", {
        specials,
      });
    } catch (error) {
      console.error("Error getting Saturday specials:", error);
      ResponseUtil.error(
        res,
        500,
        "Failed to retrieve Saturday specials",
        error,
      );
    }
  }

  /**
   * Get service information
   */
  static getServiceInfo(req, res) {
    try {
      const serviceInfo = MenuModel.getServiceInfo();
      ResponseUtil.send(res, 200, "Service info retrieved successfully", {
        serviceInfo,
      });
    } catch (error) {
      console.error("Error getting service info:", error);
      ResponseUtil.error(res, 500, "Failed to retrieve service info", error);
    }
  }
}

module.exports = MenuController;
