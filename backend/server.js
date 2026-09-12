const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

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
const client = new MongoClient(process.env.MONGODB_URI);
let db;

// ==========================================
// CONNECT DATABASE
// ==========================================
async function connectDatabase() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");
    db = client.db("truck_erp");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

// ==========================================
// TEST
// ==========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Truck ERP API is running",
  });
});

// ==========================================
// GET DRIVERS
// ==========================================
app.get("/api/drivers", async (req, res) => {
  try {
    const drivers = await db
      .collection("drivers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load drivers",
    });
  }
});

// ==========================================
// ADD DRIVER
// ==========================================
app.post("/api/drivers", async (req, res) => {
  try {
    const {
      name,
      phone,
      licenseNo,
      experience,
      assignedTruck,
      status,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name and phone number are required.",
      });
    }

    if (licenseNo) {
      const existingDriver = await db
        .collection("drivers")
        .findOne({ licenseNo: licenseNo.trim() });

      if (existingDriver) {
        return res.status(409).json({
          success: false,
          message: "This license number already exists.",
        });
      }
    }

    const driver = {
      id: `DRV-${Date.now()}`,
      name: name.trim(),
      phone: phone?.trim() || "",
      assignedTruck: assignedTruck || "Unassigned",
      status: status || "Available",
      experience: experience || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("drivers").insertOne(driver);

    res.status(201).json({
      success: true,
      message: "Driver added successfully.",
      data: {
        _id: result.insertedId,
        ...driver,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add driver.",
    });
  }
});

app.put("/api/drivers/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone, assignedTruck, status } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const currentDriver = await db.collection("drivers").findOne({ id });

    if (!currentDriver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    const updatedDriver = {
      ...currentDriver,
      name: name.trim(),
      phone: phone?.trim() || "",
      assignedTruck: assignedTruck || "Unassigned",
      status: status || "Available",
      updatedAt: new Date(),
    };

    await db.collection("drivers").updateOne({ id }, { $set: updatedDriver });

    res.status(200).json({
      success: true,
      message: "Driver updated successfully.",
      data: updatedDriver,
    });
  } catch (error) {
    console.error("Failed to update driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update driver.",
    });
  }
});

// ==========================================
// DELETE DRIVER
// ==========================================
app.delete("/api/drivers/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.collection("drivers").deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Driver not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete driver.",
    });
  }
});

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
      chassisNo,
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
      chassisNo: chassisNo?.trim() || "",
      model: model.trim(),
      type: type || "Open_Truck",
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

app.put("/api/trucks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { regNo, chassisNo, model, type, driver, mileage, date, status } = req.body;

    if (!regNo?.trim() || !model?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Registration number and model are required.",
      });
    }

    const currentTruck = await db.collection("trucks").findOne({ id });

    if (!currentTruck) {
      return res.status(404).json({
        success: false,
        message: "Truck not found.",
      });
    }

    const duplicateTruck = await db.collection("trucks").findOne({
      regNo: regNo.trim(),
      id: { $ne: id },
    });

    if (duplicateTruck) {
      return res.status(409).json({
        success: false,
        message: "A truck with this registration number already exists.",
      });
    }

    const updatedTruck = {
      ...currentTruck,
      regNo: regNo.trim(),
      chassisNo: chassisNo?.trim() || "",
      model: model.trim(),
      type: type || "Open_Truck",
      driver: driver?.trim() || "Unassigned",
      mileage: mileage ? `${Number(mileage).toLocaleString()} km` : currentTruck.mileage || "0 km",
      lastService: date || currentTruck.lastService || "",
      status: status || currentTruck.status || "Active",
      updatedAt: new Date(),
    };

    await db.collection("trucks").updateOne({ id }, { $set: updatedTruck });

    res.status(200).json({
      success: true,
      message: "Truck updated successfully.",
      data: updatedTruck,
    });
  } catch (error) {
    console.error("Failed to update truck:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update truck.",
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

    if (
      !truckNo?.trim() ||
      !Number.isFinite(litersValue) ||
      litersValue <= 0 ||
      !Number.isFinite(totalCostValue) ||
      totalCostValue < 0
    ) {
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

app.put("/api/fuel/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { truckNo, driver, liters, totalCost, odometer, mileage, date, station } = req.body;

    const litersValue = Number(liters);
    const totalCostValue = Number(totalCost);

    if (
      !truckNo?.trim() ||
      !Number.isFinite(litersValue) ||
      litersValue <= 0 ||
      !Number.isFinite(totalCostValue) ||
      totalCostValue < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Truck registration, liters, and a valid total cost are required.",
      });
    }

    const currentLog = await db.collection("fuelLogs").findOne({ id });

    if (!currentLog) {
      return res.status(404).json({
        success: false,
        message: "Fuel log not found.",
      });
    }

    const updatedFuelLog = {
      ...currentLog,
      truckNo: truckNo.trim(),
      driver: driver?.trim() || "Unassigned",
      liters: `${litersValue} L`,
      totalCost: `₹${totalCostValue.toLocaleString("en-IN")}`,
      odometer: odometer ? `${Number(odometer).toLocaleString()} km` : "N/A",
      mileage: mileage || currentLog.mileage || "4.0 km/L",
      date: date || currentLog.date || new Date().toISOString().split("T")[0],
      station: station?.trim() || currentLog.station || "Local Station",
      updatedAt: new Date(),
    };

    await db.collection("fuelLogs").updateOne({ id }, { $set: updatedFuelLog });

    res.status(200).json({
      success: true,
      message: "Fuel log updated successfully.",
      data: updatedFuelLog,
    });
  } catch (error) {
    console.error("Failed to update fuel log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update fuel log.",
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
      .sort({ goingDate: -1, deliveryDate: -1, createdAt: -1 })
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
      goingDate,
      goingSource,
      goingDestination,
      goingQuantity,
      going_material,
      comingDate,
      comingSource,
      comingDestination,
      comingQuantity,
      coming_material,
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
      advancePaid,
      fuelCost,
      tollCost,
      maintenanceCost,
      ureaCost,
      extraCost,
      extraCostNote,
      status,
      maintenanceType,
      maintenanceDetails,
      notes,
    } = req.body;

    const recordDate = goingDate || deliveryDate || new Date().toISOString().split("T")[0];
    const recordSource = goingSource || source;
    const recordDestination = goingDestination || destination;

    if (!recordDate || !truckNumber || !driverName || !recordSource || !recordDestination) {
      return res.status(400).json({
        success: false,
        message: "Date, truck, driver, source, and destination are required.",
      });
    }

    const income = Number(deliveryCost || 0);
    const requestedAdvance = Number(advancePaid ?? amountPaid ?? 0);
    const requestedDue = Number(req.body?.dueAmount ?? 0);
    const paid = Number.isFinite(requestedAdvance) && requestedAdvance >= 0 ? requestedAdvance : 0;
    const fuel = Number(fuelCost || 0);
    const toll = Number(tollCost || 0);
    const maintenance = Number(maintenanceCost || 0);
    const urea = Number(ureaCost || 0);
    const extra = Number(extraCost || 0);

    const totalExpense = fuel + toll + maintenance + urea + extra;
    const dueAmount = Number.isFinite(requestedDue) && requestedDue >= 0
      ? requestedDue
      : Math.max(income - paid, 0);
    const receivedAmount = Math.max(income - dueAmount, 0);
    const netProfit = receivedAmount - totalExpense;

    const delivery = {
      deliveryDate: recordDate,
      goingDate: recordDate,
      truckName: truckName?.trim() || "",
      truckNumber: truckNumber.trim(),
      driverName: driverName.trim(),
      source: recordSource.trim(),
      destination: recordDestination.trim(),
      goingSource: recordSource.trim(),
      goingDestination: recordDestination.trim(),
      goingQuantity: Number(goingQuantity ?? quantity ?? 0),
      going_material: going_material?.trim() || material?.trim() || "",
      comingDate: comingDate || "",
      comingSource: comingSource || "",
      comingDestination: comingDestination || "",
      comingQuantity: Number(comingQuantity || 0),
      coming_material: coming_material?.trim() || "",
      material: going_material?.trim() || material?.trim() || "",
      quantity: Number(goingQuantity ?? quantity ?? 0),
      quantityUnit: quantityUnit || "Ton",
      deliveryCost: income,
      amountPaid: receivedAmount,
      advancePaid: receivedAmount,
      dueAmount,
      fuelCost: fuel,
      tollCost: toll,
      maintenanceCost: maintenance,
      ureaCost: urea,
      extraCost: extra,
      extraCostNote: extraCostNote || "",
      totalExpense,
      net_profit: netProfit,
      netIncome: netProfit,
      netProfit,
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


// UPDATE DUE AMOUNT AND RECALCULATE NET PROFIT
app.patch("/api/deliveries", async (req, res) => {
  try {
    const id = req.query.id;
    const incomingDueAmount = Number(req.body?.dueAmount);

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Valid delivery ID is required" });
    }
    if (!Number.isFinite(incomingDueAmount) || incomingDueAmount < 0) {
      return res.status(400).json({ success: false, message: "A valid due amount is required" });
    }

    const delivery = await db.collection("deliveries").findOne({ _id: new ObjectId(id) });
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery not found" });
    }

    const deliveryCost = Number(delivery.deliveryCost || 0);
    const requestedDueAmount = Number(req.body?.dueAmount ?? delivery.dueAmount ?? 0);
    const dueAmount = Number.isFinite(requestedDueAmount) && requestedDueAmount >= 0 ? requestedDueAmount : Number(delivery.dueAmount || 0);

    const totalExpense =
      delivery.totalExpense !== undefined
        ? Number(delivery.totalExpense)
        : Number(delivery.fuelCost || 0) +
          Number(delivery.tollCost || 0) +
          Number(delivery.maintenanceCost || 0) +
          Number(delivery.ureaCost || 0) +
          Number(delivery.extraCost || 0);

    const receivedAmount = Math.max(deliveryCost - dueAmount, 0);
    const netProfit = receivedAmount - totalExpense;

    const updateFields = {
      dueAmount,
      totalExpense,
      receivedAmount,
      net_profit: netProfit,
      netProfit,
      netIncome: netProfit,
      amountPaid: receivedAmount,
      advancePaid: receivedAmount,
      updatedAt: new Date(),
    };

    await db.collection("deliveries").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return res.status(200).json({
      success: true,
      dueAmount,
      net_profit: netProfit,
      netProfit,
      amountPaid: receivedAmount,
      advancePaid: receivedAmount,
    });
  } catch (error) {
    console.error("Failed to update due amount:", error);
    return res.status(500).json({ success: false, message: "Failed to update due amount" });
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
// STAFF PAYMENTS
// ==========================================
app.get("/api/staff-payments", async (req, res) => {
  try {
    const data = await db
      .collection("staff_payments")
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load payments." });
  }
});

app.post("/api/staff-payments", async (req, res) => {
  try {
    const { date, truckRegNo, staffType, paymentType, amount, notes } = req.body;

    if (!truckRegNo?.trim() || !staffType || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Truck registration number, staff type, and a valid amount are required.",
      });
    }

    const paymentDate = date || new Date().toISOString().split("T")[0];
    const [year, month] = paymentDate.split("-");

    const record = {
      paymentId: `PAY-${Date.now()}`,
      date: paymentDate,
      month: `${year}-${month}`,
      year: year,
      truckRegNo: truckRegNo.trim(),
      staffType,
      paymentType: paymentType || "Salary",
      amount: Number(amount),
      notes: notes || "",
      createdAt: new Date(),
    };

    const result = await db.collection("staff_payments").insertOne(record);
    res.status(201).json({
      success: true,
      message: "Payment saved.",
      data: { _id: result.insertedId, ...record },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to save payment." });
  }
});

app.delete("/api/staff-payments", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ success: false, message: "ID is required." });

    const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { paymentId: id };
    const result = await db.collection("staff_payments").deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Record not found." });
    }

    res.status(200).json({ success: true, message: "Record deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete record." });
  }
});

// ==========================================
// START SERVER
// ==========================================
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});