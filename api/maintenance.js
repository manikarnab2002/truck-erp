import clientPromise from "../lib/mongodb.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("truck_erp");
    const collection = db.collection("maintenance");

    // GET ALL MAINTENANCE RECORDS
    if (req.method === "GET") {
      const records = await collection
        .find({})
        .sort({ paymentDate: -1, createdAt: -1 })
        .toArray();

      // If maintenance collection is empty, check legacy workOrders collection
      if (records.length === 0) {
        const legacyWorkOrders = await db.collection("workOrders").find({}).sort({ createdAt: -1 }).toArray();
        if (legacyWorkOrders.length > 0) {
          const mappedLegacy = legacyWorkOrders.map((wo) => ({
            _id: wo._id,
            id: wo.id,
            paymentDate: wo.startDate || new Date(wo.createdAt || Date.now()).toISOString().split("T")[0],
            truckRegNo: wo.truckNo || "",
            maintenanceCost: Number(String(wo.cost || "0").replace(/[^0-9.-]/g, "")) || 0,
            maintenanceType: wo.serviceType || "General Maintenance",
            notes: wo.mechanic ? `Mechanic: ${wo.mechanic}` : "",
            createdAt: wo.createdAt || new Date(),
            updatedAt: wo.updatedAt || new Date(),
          }));
          return res.status(200).json(mappedLegacy);
        }
      }

      return res.status(200).json(records);
    }

    // CREATE MAINTENANCE RECORD
    if (req.method === "POST") {
      const {
        paymentDate,
        date,
        truckRegNo,
        truckNo,
        maintenanceCost,
        cost,
        maintenanceType,
        serviceType,
        notes,
      } = req.body || {};

      const finalTruckRegNo = (truckRegNo || truckNo || "").trim();
      const finalMaintenanceType = (maintenanceType || serviceType || "").trim();
      const rawCost = maintenanceCost !== undefined ? maintenanceCost : cost;
      const numericCost = Number(rawCost);

      if (!finalTruckRegNo) {
        return res.status(400).json({
          success: false,
          message: "Truck registration number is required.",
        });
      }

      if (!finalMaintenanceType) {
        return res.status(400).json({
          success: false,
          message: "Maintenance type is required.",
        });
      }

      if (!Number.isFinite(numericCost) || numericCost <= 0) {
        return res.status(400).json({
          success: false,
          message: "Maintenance cost must be a valid positive number.",
        });
      }

      const finalPaymentDate = paymentDate || date || new Date().toISOString().split("T")[0];

      const record = {
        id: `MNT-${Date.now()}`,
        paymentDate: finalPaymentDate,
        truckRegNo: finalTruckRegNo,
        maintenanceCost: numericCost,
        maintenanceType: finalMaintenanceType,
        notes: (notes || "").trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(record);

      return res.status(201).json({
        success: true,
        message: "Maintenance record saved successfully.",
        data: { _id: result.insertedId, ...record },
      });
    }

    // UPDATE MAINTENANCE RECORD
    if (req.method === "PUT") {
      const id = req.query.id || req.body?.id || req.body?._id;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Record ID is required for update.",
        });
      }

      const {
        paymentDate,
        date,
        truckRegNo,
        truckNo,
        maintenanceCost,
        cost,
        maintenanceType,
        serviceType,
        notes,
      } = req.body || {};

      const finalTruckRegNo = (truckRegNo || truckNo || "").trim();
      const finalMaintenanceType = (maintenanceType || serviceType || "").trim();
      const rawCost = maintenanceCost !== undefined ? maintenanceCost : cost;
      const numericCost = Number(rawCost);

      if (!finalTruckRegNo || !finalMaintenanceType || !Number.isFinite(numericCost) || numericCost <= 0) {
        return res.status(400).json({
          success: false,
          message: "Truck reg no, maintenance type, and valid positive cost are required.",
        });
      }

      const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
      const current = await collection.findOne(query);

      if (!current) {
        return res.status(404).json({
          success: false,
          message: "Maintenance record not found.",
        });
      }

      const updatedRecord = {
        ...current,
        paymentDate: paymentDate || date || current.paymentDate,
        truckRegNo: finalTruckRegNo,
        maintenanceCost: numericCost,
        maintenanceType: finalMaintenanceType,
        notes: notes !== undefined ? (notes || "").trim() : current.notes,
        updatedAt: new Date(),
      };

      await collection.updateOne(query, { $set: updatedRecord });

      return res.status(200).json({
        success: true,
        message: "Maintenance record updated successfully.",
        data: updatedRecord,
      });
    }

    // DELETE MAINTENANCE RECORD
    if (req.method === "DELETE") {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Maintenance record ID is required.",
        });
      }

      const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
      const result = await collection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Maintenance record not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Maintenance record deleted successfully.",
      });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Maintenance API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
