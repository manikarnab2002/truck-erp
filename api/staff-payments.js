import clientPromise from "../lib/mongodb.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("truck_erp");
    const collection = db.collection("staff_payments");

    // GET ALL PAYMENTS
    if (req.method === "GET") {
      const payments = await collection
        .find({})
        .sort({ date: -1, createdAt: -1 })
        .toArray();

      return res.status(200).json(payments);
    }

    // CREATE STAFF PAYMENT
    if (req.method === "POST") {
      const {
        date,
        staffType,
        staffName,
        paymentType,
        paymentMethod,
        amount,
        notes,
      } = req.body;

      if (!staffName || !staffType || !amount || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Staff name, type, and a valid amount are required.",
        });
      }

      const paymentDate = date || new Date().toISOString().split("T")[0];
      const [year, month] = paymentDate.split("-");

      const record = {
        paymentId: `PAY-${Date.now()}`,
        date: paymentDate,
        month: `${year}-${month}`,
        year: year,
        staffType,
        staffName: staffName.trim(),
        paymentType: paymentType || "Salary",
        paymentMethod: paymentMethod || "Cash",
        amount: Number(amount),
        notes: notes || "",
        createdAt: new Date(),
      };

      const result = await collection.insertOne(record);

      return res.status(201).json({
        success: true,
        message: "Staff payment recorded successfully.",
        data: { _id: result.insertedId, ...record },
      });
    }

    // DELETE STAFF PAYMENT
    if (req.method === "DELETE") {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required.",
        });
      }

      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { paymentId: id };

      const result = await collection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment record deleted successfully.",
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Staff payment API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}