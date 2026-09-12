import clientPromise from "../lib/mongodb.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("truck_erp");
    const deliveries = db.collection("deliveries");

    // =========================
    // GET DELIVERIES
    // =========================
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

    // =========================
    // ADD DELIVERY
    // =========================
    if (req.method === "POST") {
      const deliveryCost = Number(req.body.deliveryCost || 0);
      const advancePaid = Number(req.body.advancePaid ?? req.body.amountPaid ?? 0);

      const fuelCost = Number(req.body.fuelCost || 0);
      const tollCost = Number(req.body.tollCost || 0);
      const maintenanceCost = Number(req.body.maintenanceCost || 0);
      const ureaCost = Number(req.body.ureaCost || 0);
      const extraCost = Number(req.body.extraCost || 0);

      // =========================
      // CALCULATIONS
      // =========================

      // Due = Delivery Cost - Advance
      const dueAmount = Math.max(deliveryCost - advancePaid, 0);

      // Total Expenses
      const totalExpense =
        fuelCost +
        tollCost +
        maintenanceCost +
        ureaCost +
        extraCost;

      // Amount actually received
      const receivedAmount = Math.max(
        deliveryCost - dueAmount,
        0
      );

      // Net Profit
      const netProfit = receivedAmount - totalExpense;

      const delivery = {
        // =========================
        // TRUCK INFO
        // =========================
        truckName: req.body.truckName || "",
        truckNumber: req.body.truckNumber || "",
        driverName: req.body.driverName || "",
        status: req.body.status || "In Transit",

        // =========================
        // DELIVERY ROUTE
        // =========================
        goingDate:
          req.body.goingDate ||
          new Date().toISOString().split("T")[0],

        goingSource: req.body.goingSource || "",
        goingDestination: req.body.goingDestination || "",

        deliveryDate:
          req.body.deliveryDate ||
          req.body.goingDate ||
          new Date().toISOString().split("T")[0],

        source:
          req.body.source ||
          req.body.goingSource ||
          "",

        destination:
          req.body.destination ||
          req.body.goingDestination ||
          "",

        comingDate: req.body.comingDate || "",
        comingSource: req.body.comingSource || "",
        comingDestination: req.body.comingDestination || "",

        // =========================
        // MATERIALS & QUANTITY
        // =========================
        going_material: req.body.going_material || "",
        coming_material: req.body.coming_material || "",

        goingQuantity: Number(
          req.body.goingQuantity ??
          req.body.quantity ??
          0
        ),

        comingQuantity: Number(
          req.body.comingQuantity || 0
        ),

        quantityUnit: req.body.quantityUnit || "Ton",

        // =========================
        // FINANCIAL DETAILS
        // =========================
        deliveryCost,

        advancePaid: receivedAmount,
        amountPaid: receivedAmount,

        dueAmount,

        fuelCost,
        tollCost,
        maintenanceCost,

        // IMPORTANT: UREA
        ureaCost,

        // IMPORTANT: EXTRA COST
        extraCost,

        extraCostNote:
          req.body.extraCostNote || "",

        totalExpense,

        // All three profit fields contain
        // exactly the same calculated value
        net_profit: netProfit,
        netProfit,
        netIncome: netProfit,

        maintenanceType:
          req.body.maintenanceType || "",

        maintenanceDetails:
          req.body.maintenanceDetails || "",

        // =========================
        // NOTES
        // =========================
        notes: req.body.notes || "",

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await deliveries.insertOne(delivery);

      return res.status(201).json({
        success: true,
        id: result.insertedId,
        data: {
          _id: result.insertedId,
          ...delivery,
        },
        message: "Delivery saved successfully",
      });
    }

    // =========================
    // UPDATE DUE AMOUNT
    // =========================
    if (req.method === "PATCH") {
      const id = req.query.id;
      const dueAmount = Number(req.body?.dueAmount);

      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid delivery ID is required",
        });
      }

      if (!Number.isFinite(dueAmount) || dueAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "A valid due amount is required",
        });
      }

      const delivery = await deliveries.findOne({
        _id: new ObjectId(id),
      });

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: "Delivery not found",
        });
      }

      const deliveryCost =
        Number(delivery.deliveryCost || 0);

      // ALWAYS recalculate expenses from individual fields.
      // Do NOT trust old totalExpense values.
      const fuelCost =
        Number(delivery.fuelCost || 0);

      const tollCost =
        Number(delivery.tollCost || 0);

      const maintenanceCost =
        Number(delivery.maintenanceCost || 0);

      const ureaCost =
        Number(delivery.ureaCost || 0);

      const extraCost =
        Number(delivery.extraCost || 0);

      const totalExpense =
        fuelCost +
        tollCost +
        maintenanceCost +
        ureaCost +
        extraCost;

      // Amount actually received
      const receivedAmount = Math.max(
        deliveryCost - dueAmount,
        0
      );

      // Net Profit
      const netProfit =
        receivedAmount - totalExpense;

      const updateFields = {
        dueAmount,

        receivedAmount,

        amountPaid: receivedAmount,
        advancePaid: receivedAmount,

        // Re-save all expense values
        fuelCost,
        tollCost,
        maintenanceCost,
        ureaCost,
        extraCost,

        totalExpense,

        net_profit: netProfit,
        netProfit,
        netIncome: netProfit,

        updatedAt: new Date(),
      };

      await deliveries.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );

      return res.status(200).json({
        success: true,
        dueAmount,
        receivedAmount,
        totalExpense,
        net_profit: netProfit,
        netProfit,
        amountPaid: receivedAmount,
        advancePaid: receivedAmount,
      });
    }

    // =========================
    // DELETE DELIVERY
    // =========================
    if (req.method === "DELETE") {
      const id = req.query.id;

      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Valid Delivery ID is required",
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
    console.error("Delivery API error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}