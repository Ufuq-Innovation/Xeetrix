import clientPromise from "@/lib/db";

/**
 * Service to calculate business analytics and dashboard statistics
 */
export const DashboardService = {
  /**
   * Get overall business statistics using optimized aggregation
   */
  async getStats() {
    const client = await clientPromise;
    const db = client.db("xeetrix");

    // Optimized Aggregation for Orders
    const orderStats = await db.collection("orders").aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $multiply: ["$sellingPrice", "$quantity"] } },
          totalOrderProfit: { $sum: "$netProfit" },
          totalOrders: { $sum: 1 }
        }
      }
    ]).toArray();

    // Optimized Aggregation for Expenses
    const expenseStats = await db.collection("expenses").aggregate([
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$amount" }
        }
      }
    ]).toArray();

    const stats = orderStats[0] || { totalSales: 0, totalOrderProfit: 0, totalOrders: 0 };
    const expenses = expenseStats[0] || { totalExpense: 0 };

    return {
      totalSales: stats.totalSales || 0,
      totalOrders: stats.totalOrders || 0,
      totalExpense: expenses.totalExpense || 0,
      totalProfit: (stats.totalOrderProfit || 0) - (expenses.totalExpense || 0)
    };
  }
};