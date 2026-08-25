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

      const {
        name,
        phone,
        licenseNo,
        licenseExpiry,
        assignedTruck,
        experience,
        status
      } = req.body;


      // Validation

      if (
        !name ||
        !phone ||
        !licenseNo
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Name, phone and license number are required."

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
          licenseNo: licenseNo
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
          name.trim(),

        phone:
          phone.trim(),

        licenseNo:
          licenseNo.trim(),

        licenseExpiry:
          licenseExpiry || "",

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

    if (req.method === "DELETE") {

      const id =
        req.query.id;


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

      const result =
        await drivers.deleteOne({

          id: id

        });


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