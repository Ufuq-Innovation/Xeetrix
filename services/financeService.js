// services/financeService.js
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB || "your_database";

async function getCollection() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    const db = client.db(dbName);
    return db.collection("finance_transactions");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export const FinanceService = {
  // Get all transactions with optional filter
  async getTransactions(filter = {}) {
    try {
      const collection = await getCollection();
      const transactions = await collection
        .find(filter)
        .sort({ date: -1, createdAt: -1 })
        .toArray();
      return transactions;
    } catch (error) {
      console.error("Get transactions error:", error);
      throw error;
    }
  },

  // Get expenses only (for backward compatibility)
  async getExpenses() {
    try {
      const collection = await getCollection();
      const expenses = await collection
        .find({ type: 'expense' })
        .sort({ date: -1, createdAt: -1 })
        .toArray();
      return expenses;
    } catch (error) {
      console.error("Get expenses error:", error);
      throw error;
    }
  },

  // Add transaction (income or expense)
  async addTransaction(data) {
    try {
      const collection = await getCollection();
      
      const transaction = {
        ...data,
        amount: Number(data.amount),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await collection.insertOne(transaction);
      return result;
    } catch (error) {
      console.error("Add transaction error:", error);
      throw error;
    }
  },

  // Add expense (for backward compatibility)
  async addExpense(data) {
    return this.addTransaction({ ...data, type: 'expense' });
  },

  // Delete transaction
  async deleteTransaction(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid transaction ID");
      }
      
      const collection = await getCollection();
      const result = await collection.deleteOne({ 
        _id: new ObjectId(id) 
      });
      
      if (result.deletedCount === 0) {
        throw new Error("Transaction not found");
      }
      
      return result;
    } catch (error) {
      console.error("Delete transaction error:", error);
      throw error;
    }
  },

  // Delete expense (for backward compatibility)
  async deleteExpense(id) {
    return this.deleteTransaction(id);
  },

  // Get financial summary
  async getSummary(filter = {}) {
    try {
      const collection = await getCollection();
      const transactions = await collection.find(filter).toArray();
      
      const summary = transactions.reduce((acc, transaction) => {
        const amount = Number(transaction.amount) || 0;
        if (transaction.type === 'income') {
          acc.totalIncome += amount;
        } else if (transaction.type === 'expense') {
          acc.totalExpense += amount;
        }
        return acc;
      }, { totalIncome: 0, totalExpense: 0 });
      
      summary.netBalance = summary.totalIncome - summary.totalExpense;
      summary.transactionCount = transactions.length;
      
      return summary;
    } catch (error) {
      console.error("Get summary error:", error);
      throw error;
    }
  }
};