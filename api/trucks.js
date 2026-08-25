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

      return res.status(200).json(data);
    }


    // POST
    if (req.method === "POST") {

      const truck = {
        truckName: req.body.truckName,
        truckNumber: req.body.truckNumber,
        model: req.body.model || "",
        capacity: Number(req.body.capacity || 0),
        status: req.body.status || "Available",
        createdAt: new Date(),
      };

      const result = await trucks.insertOne(truck);

      return res.status(201).json({
        success: true,
        id: result.insertedId,
        message: "Truck added successfully",
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

      await trucks.deleteOne({
        _id: new ObjectId(id),
      });

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