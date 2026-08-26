import clientPromise from "../lib/mongodb.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("truck_erp");
    const trucks = db.collection("trucks");

    // GET
    if (req.method === "GET") {
      const data = await trucks
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      const normalizedTrucks = data.map((truck) => ({
        ...truck,
        id: truck.id || truck._id?.toString() || `TRK-${Date.now()}`,
        regNo: truck.regNo || truck.truckNumber || "",
        model: truck.model || "",
        type: truck.type || "Trailer",
        date: truck.date || truck.registeredDate || "",
      }));

      return res.status(200).json(normalizedTrucks);
    }

    // POST
    if (req.method === "POST") {
      const { regNo, model, type, date } = req.body;

      if (!regNo?.trim() || !model?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Registration number and model are required",
        });
      }

      const existingTruck = await trucks.findOne({ regNo: regNo.trim() });

      if (existingTruck) {
        return res.status(409).json({
          success: false,
          message: "A truck with this registration number already exists",
        });
      }

      const truck = {
        id: `TRK-${Date.now()}`,
        regNo: regNo.trim(),
        model: model.trim(),
        type: type || "Trailer",
        date: date || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await trucks.insertOne(truck);

      return res.status(201).json({
        success: true,
        id: result.insertedId,
        message: "Truck added successfully",
        data: { _id: result.insertedId, ...truck },
      });
    }

    // DELETE
    if (req.method === "DELETE") {
      const id = req.query.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Truck ID is required",
        });
      }

      const filter = ObjectId.isValid(id)
        ? { $or: [{ id }, { _id: new ObjectId(id) }] }
        : { id };

      const result = await trucks.deleteOne(filter);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Truck not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Truck deleted successfully",
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