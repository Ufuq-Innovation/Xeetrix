import clientPromise from "@/lib/db";

export const DashboardService = {
  async getStats() {
    const client = await clientPromise;
    const db = client.db("xeetrix");

    // ১. ওভারঅল স্ট্যাটস (Sales, Profit, Orders, Expenses)
    const orderAggregation = await db.collection("orders").aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalSell" },
          totalOrderProfit: { $sum: "$netProfit" },
          totalDue: { $sum: "$dueAmount" },
          totalOrders: { $sum: 1 }
        }
      }
    ]).toArray();

    const expenseAggregation = await db.collection("expenses").aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();

    // ২. গত ৭ দিনের সেলস ট্রেন্ড (Chart এর জন্য)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await db.collection("orders").aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalSell" },
          profit: { $sum: "$netProfit" }
        }
      },
      { $sort: { "_id": 1 } }
    ]).toArray();

    const stats = orderAggregation[0] || { totalSales: 0, totalOrderProfit: 0, totalOrders: 0, totalDue: 0 };
    const totalExpense = expenseAggregation[0]?.total || 0;

    return {
      summary: {
        totalSales: stats.totalSales,
        totalOrders: stats.totalOrders,
        totalDue: stats.totalDue,
        totalExpense: totalExpense,
        netProfit: stats.totalOrderProfit - totalExpense,
      },
      salesTrend
    };
  }
};