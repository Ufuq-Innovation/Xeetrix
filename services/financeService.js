import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Service to handle financial transactions and expense management
 */
export const FinanceService = {
  /**
   * Record a new expense
   */
  async addExpense(data) {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    
    return await db.collection("expenses").insertOne({
      title: data.title,
      amount: Number(data.amount),
      category: data.category,
      date: data.date ? new Date(data.date) : new Date(),
      createdAt: new Date(),
    });
  },

  /**
   * Retrieve all recorded expenses sorted by latest
   */
  async getExpenses() {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    return await db.collection("expenses").find({}).sort({ createdAt: -1 }).toArray();
  },

  /**
   * Delete an expense record by ID
   */
  async deleteExpense(id) {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    return await db.collection("expenses").deleteOne({ _id: new ObjectId(id) });
  }
};