import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Service to handle inventory business logic
 */
export const InventoryService = {
  /**
   * Add new product to inventory
   */
  async addProduct(data) {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    
    return await db.collection("inventory").insertOne({
      ...data,
      stock: Number(data.stock),
      costPrice: Number(data.costPrice || 0),
      sellingPrice: Number(data.sellingPrice || 0),
      createdAt: new Date(),
    });
  },

  /**
   * Update existing product details
   */
  async updateProduct(id, updateData) {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    
    return await db.collection("inventory").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          stock: Number(updateData.stock),
          costPrice: Number(updateData.costPrice),
          sellingPrice: Number(updateData.sellingPrice),
          updatedAt: new Date()
        } 
      }
    );
  },

  /**
   * Fetch all inventory items
   */
  async getInventory() {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    return await db.collection("inventory").find({}).sort({ _id: -1 }).toArray();
  }
};