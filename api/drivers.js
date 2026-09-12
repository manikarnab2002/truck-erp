import clientPromise from "../lib/mongodb.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {

  try {

    const client =
      await clientPromise;

    const db =
      client.db("truck_erp");

    const drivers =
      db.collection("drivers");


    /*
    ========================================
    GET ALL DRIVERS
    ========================================
    */

    if (req.method === "GET") {

      const data =
        await drivers
          .find({})
          .sort({
            createdAt: -1
          })
          .toArray();

      return res.status(200).json(data);
    }


    /*
    ========================================
    ADD DRIVER
    ========================================
    */

    if (req.method === "POST") {

      const payload = req.body || {};
      const {
        name,
        phone,
        assignedTruck,
        experience,
        status
      } = payload;

      const cleanName = typeof name === "string" ? name.trim() : "";
      const cleanPhone = typeof phone === "string" ? phone.trim() : "";

      // Validation

      if (
        !cleanName ||
        !cleanPhone
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Name and phone number are required."

        });

      }


      /*
      Generate Driver ID
      */

      const driverId =
        `DRV-${Date.now()}`;


      /*
      Check duplicate license
      */

      const existingDriver =
        await drivers.findOne({
          phone: cleanPhone
        });


      if (existingDriver) {

        return res.status(409).json({

          success: false,

          message:
            "A driver with this license number already exists."

        });

      }


      /*
      Create Driver
      */

      const driver = {

        id: driverId,

        name:
          cleanName,

        phone:
          cleanPhone,

        assignedTruck:
          assignedTruck || "Unassigned",

        experience:
          experience || "",

        status:
          status || "Available",

        createdAt:
          new Date(),

        updatedAt:
          new Date()

      };


      /*
      Insert into MongoDB
      */

      const result =
        await drivers.insertOne(driver);


      return res.status(201).json({

        success: true,

        message:
          "Driver added successfully.",

        data: {
          _id: result.insertedId,
          ...driver
        }

      });

    }


    /*
    ========================================
    DELETE DRIVER
    ========================================
    */

    if (req.method === "PUT") {

      
      const id = req.params?.id || req.query?.id;
      const payload = req.body || {};
      const {
        name,
        phone,
        assignedTruck,
        status,
      } = payload;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Driver ID is required.",
        });
      }

      const cleanName = typeof name === "string" ? name.trim() : "";
      const cleanPhone = typeof phone === "string" ? phone.trim() : "";

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Name is required.",
        });
      }

      const driverFilter = ObjectId.isValid(id)
        ? { $or: [{ id }, { _id: new ObjectId(id) }] }
        : { id };
      const currentDriver = await drivers.findOne(driverFilter);

      if (!currentDriver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found.",
        });
      }

      const { _id, ...currentDriverFields } = currentDriver;
      const updatedDriver = {
        ...currentDriverFields,
        name: cleanName,
        phone: cleanPhone,
        assignedTruck: assignedTruck || currentDriver.assignedTruck || "Unassigned",
        status: status || currentDriver.status || "Available",
        updatedAt: new Date(),
      };

      await drivers.updateOne(driverFilter, { $set: updatedDriver });

      return res.status(200).json({
        success: true,
        message: "Driver updated successfully.",
        data: updatedDriver,
      });
    }

    if (req.method === "DELETE") {

      const id = req.params?.id || req.query?.id;


      if (!id) {

        return res.status(400).json({

          success: false,

          message:
            "Driver ID is required."

        });

      }


      /*
      Find by custom driver ID
      */

      const filter = ObjectId.isValid(id)
        ? { $or: [{ id }, { _id: new ObjectId(id) }] }
        : { id };

      const result = await drivers.deleteOne(filter);


      if (
        result.deletedCount === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Driver not found."

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Driver deleted successfully."

      });

    }


    /*
    ========================================
    METHOD NOT ALLOWED
    ========================================
    */

    return res.status(405).json({

      success: false,

      message:
        "Method not allowed."

    });


  } catch (error) {

    console.error(
      "Driver API Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Internal server error."

    });

  }

}