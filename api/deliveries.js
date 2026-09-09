import clientPromise from "../lib/mongodb.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("truck_erp");
    const deliveries = db.collection("deliveries");

    // GET DELIVERIES
    if (req.method === "GET") {
      const data = await deliveries
        .find({})
        .sort({
          goingDate: -1,
          createdAt: -1,
        })
        .toArray();

      return res.status(200).json(data);
    }

    // ADD DELIVERY
    if (req.method === "POST") {
      const deliveryCost = Number(req.body.deliveryCost || 0);
      const advancePaid = Number(req.body.advancePaid || 0);
      const fuelCost = Number(req.body.fuelCost || 0);
      const tollCost = Number(req.body.tollCost || 0);
      const maintenanceCost = Number(req.body.maintenanceCost || 0);

      // Calculations
      const dueAmount = Math.max(deliveryCost - advancePaid, 0);
      const totalExpense = fuelCost + tollCost + maintenanceCost;
      const netProfit = deliveryCost - totalExpense - dueAmount;

      const delivery = {
        // Truck Info
        truckName: req.body.truckName || "",
        truckNumber: req.body.truckNumber || "",
        driverName: req.body.driverName || "",
        status: req.body.status || "In Transit",

        // Delivery Route (Going & Coming)
        goingDate: req.body.goingDate || new Date().toISOString().split("T")[0],
        goingSource: req.body.goingSource || "",
        goingDestination: req.body.goingDestination || "",
        deliveryDate:
          req.body.deliveryDate ||
          req.body.goingDate ||
          new Date().toISOString().split("T")[0],
        source: req.body.source || req.body.goingSource || "",
        destination: req.body.destination || req.body.goingDestination || "",
        comingDate: req.body.comingDate || "",
        comingSource: req.body.comingSource || "",
        comingDestination: req.body.comingDestination || "",

        // Materials & Quantity
        going_material: req.body.going_material || "",
        coming_material: req.body.coming_material || "",
        goingQuantity: Number(req.body.goingQuantity ?? req.body.quantity ?? 0),
        comingQuantity: Number(req.body.comingQuantity || 0),
        quantityUnit: req.body.quantityUnit || "Ton",

        // Financials
        deliveryCost,
        advancePaid,
        amountPaid: advancePaid,
        dueAmount,
        fuelCost,
        tollCost,
        maintenanceCost,
        maintenanceType: req.body.maintenanceType || "",
        totalExpense,
        net_profit: netProfit,
        netProfit,
        netIncome: netProfit,

        // Additional Notes
        notes: req.body.notes || "",
        maintenanceDetails: req.body.maintenanceDetails || "",
        createdAt: new Date(),
      };

      const result = await deliveries.insertOne(delivery);

      return res.status(201).json({
        success: true,
        id: result.insertedId,
        data: { _id: result.insertedId, ...delivery },
        message: "Delivery saved successfully",
      });
    }

    // UPDATE DUE AMOUNT
    if (req.method === "PATCH") {
      const id = req.query.id;
      const dueAmount = Number(req.body?.dueAmount);

      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Valid delivery ID is required" });
      }
      if (!Number.isFinite(dueAmount) || dueAmount < 0) {
        return res.status(400).json({ success: false, message: "A valid due amount is required" });
      }

      const delivery = await deliveries.findOne({ _id: new ObjectId(id) });
      if (!delivery) {
        return res.status(404).json({ success: false, message: "Delivery not found" });
      }

      const deliveryCost = Number(delivery.deliveryCost || 0);

      // Fallback in case totalExpense was not stored previously
      const totalExpense =
        delivery.totalExpense !== undefined
          ? Number(delivery.totalExpense)
          : Number(delivery.fuelCost || 0) +
            Number(delivery.tollCost || 0) +
            Number(delivery.maintenanceCost || 0);

      // Net profit = (Total revenue collected) - total expense
      const netProfit = deliveryCost - totalExpense - dueAmount;
      const updatedReceived = Math.max(deliveryCost - dueAmount, 0);

      const updateFields = {
        dueAmount,
        totalExpense,
        net_profit: netProfit,
        netProfit,
        netIncome: netProfit,
        amountPaid: updatedReceived,
      };

      await deliveries.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );

      return res.status(200).json({
        success: true,
        dueAmount,
        net_profit: netProfit,
        netProfit,
        amountPaid: updatedReceived,
      });
    }

    // DELETE DELIVERY
    if (req.method === "DELETE") {
      const id = req.query.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Delivery ID is required",
        });
      }

      await deliveries.deleteOne({
        _id: new ObjectId(id),
      });

      return res.status(200).json({
        success: true,
        message: "Delivery deleted successfully",
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}