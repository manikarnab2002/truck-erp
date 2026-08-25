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
          deliveryDate: -1,
          createdAt: -1,
        })
        .toArray();


      return res.status(200).json(data);

    }


    // ADD DELIVERY

    if (req.method === "POST") {

      const deliveryCost =
        Number(req.body.deliveryCost || 0);

      const amountPaid =
        Number(req.body.amountPaid || 0);

      const fuelCost =
        Number(req.body.fuelCost || 0);

      const tollCost =
        Number(req.body.tollCost || 0);

      const maintenanceCost =
        Number(req.body.maintenanceCost || 0);


      const dueAmount =
        Math.max(
          deliveryCost - amountPaid,
          0
        );


      const totalExpense =
        fuelCost +
        tollCost +
        maintenanceCost;


      const netIncome =
        deliveryCost -
        totalExpense;


      const delivery = {

        deliveryDate:
          req.body.deliveryDate,

        truckName:
          req.body.truckName,

        truckNumber:
          req.body.truckNumber,

        driverName:
          req.body.driverName,

        source:
          req.body.source,

        destination:
          req.body.destination,

        material:
          req.body.material,

        quantity:
          Number(req.body.quantity || 0),

        quantityUnit:
          req.body.quantityUnit || "Ton",

        deliveryCost,

        amountPaid,

        dueAmount,

        fuelCost,

        tollCost,

        maintenanceCost,

        totalExpense,

        netIncome,

        status:
          req.body.status || "In Transit",

        maintenanceType:
          req.body.maintenanceType || "",

        maintenanceDetails:
          req.body.maintenanceDetails || "",

        notes:
          req.body.notes || "",

        createdAt:
          new Date(),

      };


      const result =
        await deliveries.insertOne(delivery);


      return res.status(201).json({

        success: true,

        id: result.insertedId,

        data: delivery,

        message:
          "Delivery saved successfully",

      });

    }


    // DELETE DELIVERY

    if (req.method === "DELETE") {

      const id = req.query.id;


      if (!id) {

        return res.status(400).json({

          success: false,

          message:
            "Delivery ID is required",

        });

      }


      await deliveries.deleteOne({

        _id:
          new ObjectId(id),

      });


      return res.status(200).json({

        success: true,

        message:
          "Delivery deleted successfully",

      });

    }


    return res.status(405).json({

      message:
        "Method not allowed",

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      success: false,

      message:
        "Server error",

    });

  }

}