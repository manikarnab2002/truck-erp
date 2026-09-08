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
      const driverSalary = Number(req.body.driverSalary || 0);

      // Calculations
      const dueAmount = Math.max(deliveryCost - advancePaid, 0);
      const totalExpense = fuelCost + tollCost + maintenanceCost + driverSalary;
      const netProfit = deliveryCost - totalExpense;

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
        material: req.body.material || "",
        quantity: Number(req.body.quantity || 0),
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
        driverSalary,
        totalExpense,
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