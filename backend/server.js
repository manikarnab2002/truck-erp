const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// MONGODB
// ==========================================

const client = new MongoClient(
  process.env.MONGODB_URI
);

let db;


// ==========================================
// CONNECT DATABASE
// ==========================================

async function connectDatabase() {

  try {

    await client.connect();

    console.log(
      "MongoDB connected successfully"
    );

    db = client.db("truck_erp");

  } catch (error) {

    console.error(
      "MongoDB connection failed:",
      error
    );

    process.exit(1);

  }

}


// ==========================================
// TEST
// ==========================================

app.get("/", (req, res) => {

  res.json({

    success: true,

    message:
      "Truck ERP API is running"

  });

});


// ==========================================
// GET DRIVERS
// ==========================================

app.get(
  "/api/drivers",
  async (req, res) => {

    try {

      const drivers =
        await db
          .collection("drivers")
          .find({})
          .sort({
            createdAt: -1
          })
          .toArray();


      res.status(200).json(
        drivers
      );


    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to load drivers"

      });

    }

  }
);


// ==========================================
// ADD DRIVER
// ==========================================

app.post(
  "/api/drivers",
  async (req, res) => {

    try {

      const {

        name,
        phone,
        licenseNo,
        licenseExpiry,
        experience,
        assignedTruck,
        status

      } = req.body;


      // Validation

      if (
        !name ||
        !licenseNo
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Name and license number are required."

        });

      }


      // Check duplicate license

      const existingDriver =
        await db
          .collection("drivers")
          .findOne({

            licenseNo:
              licenseNo.trim()

          });


      if (existingDriver) {

        return res.status(409).json({

          success: false,

          message:
            "This license number already exists."

        });

      }


      // Create driver

      const driver = {

        id:
          `DRV-${Date.now()}`,

        name:
          name.trim(),

        phone:
          phone?.trim() || "",

        licenseNo:
          licenseNo.trim(),

        licenseExpiry:
          licenseExpiry || "",

        experience:
          experience || "3 Yrs",

        assignedTruck:
          assignedTruck ||
          "Unassigned",

        status:
          status || "Available",

        createdAt:
          new Date(),

        updatedAt:
          new Date()

      };


      // Save

      const result =
        await db
          .collection("drivers")
          .insertOne(driver);


      res.status(201).json({

        success: true,

        message:
          "Driver added successfully.",

        data: {

          _id:
            result.insertedId,

          ...driver

        }

      });


    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to add driver."

      });

    }

  }
);


// ==========================================
// DELETE DRIVER
// ==========================================

app.delete(
  "/api/drivers/:id",
  async (req, res) => {

    try {

      const id =
        req.params.id;


      const result =
        await db
          .collection("drivers")
          .deleteOne({

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


      res.status(200).json({

        success: true,

        message:
          "Driver deleted successfully."

      });


    } catch (error) {

      console.error(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to delete driver."

      });

    }

  }
);

// ==========================================
// TRUCKS
// ==========================================

app.get("/api/trucks", async (req, res) => {
  try {
    const trucks = await db
      .collection("trucks")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(trucks);
  } catch (error) {
    console.error("Failed to load trucks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load trucks.",
    });
  }
});

app.post("/api/trucks", async (req, res) => {
  try {
    const {
      regNo,
      model,
      type,
      driver,
      mileage,
      date,
      status,
    } = req.body;

    if (!regNo?.trim() || !model?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Registration number and model are required.",
      });
    }

    const existingTruck = await db.collection("trucks").findOne({
      regNo: regNo.trim(),
    });

    if (existingTruck) {
      return res.status(409).json({
        success: false,
        message: "A truck with this registration number already exists.",
      });
    }

    const truck = {
      id: `TRK-${Date.now()}`,
      regNo: regNo.trim(),
      model: model.trim(),
      type: type || "Trailer",
      driver: driver?.trim() || "Unassigned",
      mileage: mileage ? `${Number(mileage).toLocaleString()} km` : "0 km",
      lastService: date || "",
      status: status || "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("trucks").insertOne(truck);

    res.status(201).json({
      success: true,
      message: "Truck added successfully.",
      data: { _id: result.insertedId, ...truck },
    });
  } catch (error) {
    console.error("Failed to add truck:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add truck.",
    });
  }
});

app.delete("/api/trucks/:id", async (req, res) => {
  try {
    const result = await db.collection("trucks").deleteOne({
      id: req.params.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Truck not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Truck deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete truck:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete truck.",
    });
  }
});

// ==========================================
// FUEL LOGS
// ==========================================

app.get("/api/fuel", async (req, res) => {
  try {
    const fuelLogs = await db
      .collection("fuelLogs")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(fuelLogs);
  } catch (error) {
    console.error("Failed to load fuel logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load fuel logs.",
    });
  }
});

app.post("/api/fuel", async (req, res) => {
  try {
    const {
      truckNo,
      driver,
      liters,
      totalCost,
      odometer,
      mileage,
      date,
      station,
    } = req.body;

    const litersValue = Number(liters);
    const totalCostValue = Number(totalCost);

    if (!truckNo?.trim() || !Number.isFinite(litersValue) || litersValue <= 0 || !Number.isFinite(totalCostValue) || totalCostValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Truck registration, liters, and a valid total cost are required.",
      });
    }

    const fuelLog = {
      id: `FL-${Date.now()}`,
      truckNo: truckNo.trim(),
      driver: driver?.trim() || "Unassigned",
      liters: `${litersValue} L`,
      totalCost: `₹${totalCostValue.toLocaleString("en-IN")}`,
      odometer: odometer ? `${Number(odometer).toLocaleString()} km` : "N/A",
      mileage: mileage || "4.0 km/L",
      date: date || new Date().toISOString().split("T")[0],
      station: station?.trim() || "Local Station",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("fuelLogs").insertOne(fuelLog);

    res.status(201).json({
      success: true,
      message: "Fuel log added successfully.",
      data: { _id: result.insertedId, ...fuelLog },
    });
  } catch (error) {
    console.error("Failed to add fuel log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add fuel log.",
    });
  }
});

app.delete("/api/fuel/:id", async (req, res) => {
  try {
    const result = await db.collection("fuelLogs").deleteOne({
      id: req.params.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Fuel log not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fuel log deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete fuel log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete fuel log.",
    });
  }
});

// ==========================================
// DAILY DELIVERIES
// ==========================================

app.get("/api/deliveries", async (req, res) => {
  try {
    const deliveries = await db
      .collection("deliveries")
      .find({})
      .sort({ deliveryDate: -1, createdAt: -1 })
      .toArray();

    res.status(200).json(deliveries);
  } catch (error) {
    console.error("Failed to load deliveries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load deliveries.",
    });
  }
});

app.post("/api/deliveries", async (req, res) => {
  try {
    const {
      deliveryDate,
      truckName,
      truckNumber,
      driverName,
      source,
      destination,
      material,
      quantity,
      quantityUnit,
      deliveryCost,
      amountPaid,
      fuelCost,
      tollCost,
      maintenanceCost,
      status,
      maintenanceType,
      maintenanceDetails,
      notes,
    } = req.body;

    if (!deliveryDate || !truckName || !truckNumber || !driverName || !source || !destination) {
      return res.status(400).json({
        success: false,
        message: "Date, truck, driver, source, and destination are required.",
      });
    }

    const income = Number(deliveryCost || 0);
    const paid = Number(amountPaid || 0);
    const fuel = Number(fuelCost || 0);
    const toll = Number(tollCost || 0);
    const maintenance = Number(maintenanceCost || 0);
    const totalExpense = fuel + toll + maintenance;

    const delivery = {
      deliveryDate,
      truckName: truckName.trim(),
      truckNumber: truckNumber.trim(),
      driverName: driverName.trim(),
      source: source.trim(),
      destination: destination.trim(),
      material: material?.trim() || "",
      quantity: Number(quantity || 0),
      quantityUnit: quantityUnit || "Ton",
      deliveryCost: income,
      amountPaid: paid,
      dueAmount: Math.max(income - paid, 0),
      fuelCost: fuel,
      tollCost: toll,
      maintenanceCost: maintenance,
      totalExpense,
      netIncome: income - totalExpense,
      status: status || "In Transit",
      maintenanceType: maintenanceType || "",
      maintenanceDetails: maintenanceDetails || "",
      notes: notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("deliveries").insertOne(delivery);

    res.status(201).json({
      success: true,
      id: result.insertedId,
      data: { _id: result.insertedId, ...delivery },
      message: "Delivery saved successfully.",
    });
  } catch (error) {
    console.error("Failed to save delivery:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save delivery.",
    });
  }
});

app.delete("/api/deliveries", async (req, res) => {
  try {
    if (!req.query.id || !ObjectId.isValid(req.query.id)) {
      return res.status(400).json({
        success: false,
        message: "A valid delivery ID is required.",
      });
    }

    const result = await db.collection("deliveries").deleteOne({
      _id: new ObjectId(req.query.id),
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete delivery:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete delivery.",
    });
  }
});


// ==========================================
// START SERVER
// ==========================================

connectDatabase()
  .then(() => {

    app.listen(
      PORT,
      () => {

        console.log(
          `Server running on http://localhost:${PORT}`
        );

      }
    );

  });