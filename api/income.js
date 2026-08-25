import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {

  try {

    const client =
      await clientPromise;

    const db =
      client.db("truck_erp");

    const deliveries =
      db.collection("deliveries");


    if (req.method !== "GET") {

      return res.status(405).json({
        message:
          "Method not allowed",
      });

    }


    const {
      startDate,
      endDate,
      truckNumber,
    } = req.query;


    const filter = {};


    // DATE FILTER

    if (startDate || endDate) {

      filter.deliveryDate = {};

      if (startDate) {

        filter.deliveryDate.$gte =
          startDate;

      }

      if (endDate) {

        filter.deliveryDate.$lte =
          endDate;

      }

    }


    // TRUCK FILTER

    if (truckNumber) {

      filter.truckNumber =
        truckNumber;

    }


    const records =
      await deliveries
        .find(filter)
        .sort({
          deliveryDate: -1,
        })
        .toArray();


    let totalIncome = 0;

    let totalPaid = 0;

    let totalDue = 0;

    let totalFuel = 0;

    let totalToll = 0;

    let totalMaintenance = 0;

    let totalExpense = 0;

    let netIncome = 0;

    let totalQuantity = 0;


    const truckIncome = {};


    records.forEach((record) => {

      const income =
        Number(
          record.deliveryCost || 0
        );

      const paid =
        Number(
          record.amountPaid || 0
        );

      const due =
        Number(
          record.dueAmount || 0
        );

      const fuel =
        Number(
          record.fuelCost || 0
        );

      const toll =
        Number(
          record.tollCost || 0
        );

      const maintenance =
        Number(
          record.maintenanceCost || 0
        );


      totalIncome += income;

      totalPaid += paid;

      totalDue += due;

      totalFuel += fuel;

      totalToll += toll;

      totalMaintenance +=
        maintenance;

      totalExpense +=
        fuel +
        toll +
        maintenance;

      netIncome +=
        income -
        fuel -
        toll -
        maintenance;


      totalQuantity +=
        Number(
          record.quantity || 0
        );


      const truck =
        record.truckNumber ||
        "Unknown";


      if (!truckIncome[truck]) {

        truckIncome[truck] = {

          truckNumber: truck,

          truckName:
            record.truckName || "",

          income: 0,

          paid: 0,

          due: 0,

          expenses: 0,

          netIncome: 0,

          deliveries: 0,

        };

      }


      truckIncome[truck].income +=
        income;

      truckIncome[truck].paid +=
        paid;

      truckIncome[truck].due +=
        due;

      truckIncome[truck].expenses +=
        fuel +
        toll +
        maintenance;

      truckIncome[truck].netIncome +=
        income -
        fuel -
        toll -
        maintenance;

      truckIncome[truck].deliveries++;

    });


    return res.status(200).json({

      summary: {

        totalIncome,

        totalPaid,

        totalDue,

        totalFuel,

        totalToll,

        totalMaintenance,

        totalExpense,

        netIncome,

        totalQuantity,

        totalDeliveries:
          records.length,

      },

      trucks:
        Object.values(
          truckIncome
        ),

      records,

    });


  } catch (error) {

    console.error(error);


    return res.status(500).json({

      success: false,

      message:
        "Unable to generate income report",

    });

  }

}