import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const workOrders = client.db("truck_erp").collection("workOrders");

    if (req.method === "GET") {
      const data = await workOrders.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { truckNo, serviceType, mechanic, priority, cost, startDate, status } = req.body;

      if (!truckNo?.trim() || !serviceType?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Truck number and service type are required",
        });
      }

      const numericCost = Number(cost || 0);
      if (!Number.isFinite(numericCost) || numericCost < 0) {
        return res.status(400).json({ success: false, message: "Cost must be a valid non-negative number" });
      }

      const workOrder = {
        id: `WO-${Date.now()}`,
        truckNo: truckNo.trim(),
        serviceType: serviceType.trim(),
        mechanic: mechanic?.trim() || "Unassigned",
        priority: priority || "Medium",
        cost: `₹${numericCost.toLocaleString("en-IN")}`,
        startDate: startDate || new Date().toISOString().split("T")[0],
        status: status || "Queued",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await workOrders.insertOne(workOrder);
      return res.status(201).json({
        success: true,
        message: "Work order added successfully",
        data: { _id: result.insertedId, ...workOrder },
      });
    }

    if (req.method === "DELETE") {
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ success: false, message: "Work order ID is required" });
      }

      const result = await workOrders.deleteOne({ id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: "Work order not found" });
      }

      return res.status(200).json({ success: true, message: "Work order deleted successfully" });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Maintenance API error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
