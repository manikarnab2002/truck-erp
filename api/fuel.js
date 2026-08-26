import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const fuelLogs = client.db("truck_erp").collection("fuelLogs");

    if (req.method === "GET") {
      const data = await fuelLogs.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
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

      const result = await fuelLogs.insertOne(fuelLog);
      return res.status(201).json({
        success: true,
        message: "Fuel log added successfully",
        data: { _id: result.insertedId, ...fuelLog },
      });
    }

    if (req.method === "DELETE") {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ success: false, message: "Fuel log ID is required" });
      }

      const result = await fuelLogs.deleteOne({ id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Fuel log not found" });
      }

      return res.status(200).json({ success: true, message: "Fuel log deleted successfully" });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Fuel API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
