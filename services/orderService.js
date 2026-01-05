import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Service to handle business logic for Orders
 */
export const OrderService = {
  /**
   * Create a new order and adjust inventory
   */
  async createOrder(orderData) {
    const client = await clientPromise;
    const db = client.db("xeetrix");

    // Inventory Stock Check
    if (orderData.productId && ObjectId.isValid(orderData.productId)) {
      const product = await db.collection("inventory").findOne({ _id: new ObjectId(orderData.productId) });
      if (!product || product.stock < Number(orderData.quantity)) {
        throw new Error("Insufficient stock available!");
      }
    }

    // Insert Order
    const result = await db.collection("orders").insertOne({
      ...orderData,
      status: orderData.status || "Pending",
      createdAt: new Date(),
    });

    // Update Inventory
    if (orderData.productId) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(orderData.productId) },
        { $inc: { stock: -Number(orderData.quantity) } }
      );
    }

    return result.insertedId;
  },

  /**
   * Fetch all orders sorted by latest
   */
  async getAllOrders() {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    return await db.collection("orders").find({}).sort({ _id: -1 }).toArray();
  },

  /**
   * Update order status and handle return inventory logic
   */
  async updateStatus(id, status) {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const orderId = new ObjectId(id);

    const oldOrder = await db.collection("orders").findOne({ _id: orderId });
    if (!oldOrder) throw new Error("Order not found");

    // Handle Stock Adjustments for Returns
    if (status === "Returned" && oldOrder.status !== "Returned") {
      await this._adjustStock(db, oldOrder.productId, oldOrder.quantity);
    } else if (oldOrder.status === "Returned" && status !== "Returned") {
      await this._adjustStock(db, oldOrder.productId, -oldOrder.quantity);
    }

    return await db.collection("orders").updateOne(
      { _id: orderId },
      { $set: { status, updatedAt: new Date() } }
    );
  },

  /**
   * Delete order and reverse stock if necessary
   */
  async deleteOrder(id) {
    const client = await clientPromise;
    const db = client.db("xeetrix");
    const orderId = new ObjectId(id);

    const orderToDelete = await db.collection("orders").findOne({ _id: orderId });
    if (!orderToDelete) throw new Error("Order not found");

    if (orderToDelete.status !== "Returned" && orderToDelete.productId) {
      await this._adjustStock(db, orderToDelete.productId, orderToDelete.quantity);
    }

    return await db.collection("orders").deleteOne({ _id: orderId });
  },

  /** Helper to adjust stock */
  async _adjustStock(db, productId, amount) {
    if (productId && ObjectId.isValid(productId)) {
      await db.collection("inventory").updateOne(
        { _id: new ObjectId(productId) },
        { $inc: { stock: Number(amount) } }
      );
    }
  }
};