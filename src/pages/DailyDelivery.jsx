import React, { useEffect, useState } from "react";
import FormGroup from "../components/FormGroup";
import { exportCsv } from "../utils/exportCsv";
import {
  Truck,
  MapPin,
  IndianRupee,
  Calendar,
  User,
  FileText,
  Save,
  RotateCcw,
  Trash2,
  TrendingUp,
} from "lucide-react";

const emptyForm = {
  // Truck Info
  truckNumber: "",
  driverName: "",
  status: "In Transit",

  // Delivery Route - Going
  goingDate: new Date().toISOString().split("T")[0],
  goingSource: "",
  goingDestination: "",

  // Delivery Route - Coming (Return)
  comingDate: "",
  comingSource: "",
  comingDestination: "",

  // Material & Quantity
  material: "",
  quantity: "",
  quantityUnit: "Ton",

  // Financial Details
  deliveryCost: "",
  advancePaid: "",
  dueAmount: "0",
  fuelCost: "",
  tollCost: "",
  maintenanceCost: "",
  maintenanceType: "",
  driverSalary: "",
  netProfit: "0",

  // Additional Notes
  notes: "",
};

export default function DailyDelivery() {
  const [formData, setFormData] = useState(emptyForm);
  const [deliveries, setDeliveries] = useState([]);
  const [truckOptions, setTruckOptions] = useState([]);
  const [driverOptions, setDriverOptions] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
    loadTruckOptions();
    loadDriverOptions();
  }, []);

  const loadTruckOptions = async () => {
    try {
      const response = await fetch("/api/trucks");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load truck list.");
      const options = Array.isArray(data)
        ? data.map((truck) => truck?.regNo?.trim()).filter(Boolean)
        : [];
      setTruckOptions([...new Set(options)]);
    } catch (error) {
      console.error("Load truck options error:", error);
    }
  };

  const loadDriverOptions = async () => {
    try {
      const response = await fetch("/api/drivers");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load driver list.");
      const options = Array.isArray(data)
        ? data.map((driver) => driver?.name?.trim()).filter(Boolean)
        : [];
      setDriverOptions([...new Set(options)]);
    } catch (error) {
      console.error("Load driver options error:", error);
    }
  };

  const loadDeliveries = async () => {
    try {
      const response = await fetch("/api/deliveries");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load deliveries.");
      setDeliveries(data);
    } catch (error) {
      console.error("Load deliveries error:", error);
      alert("Unable to load delivery records. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes & auto-calculate Due Amount & Net Profit
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Financial calculations
      const deliveryCost = Number(name === "deliveryCost" ? value : prev.deliveryCost) || 0;
      const advancePaid = Number(name === "advancePaid" ? value : prev.advancePaid) || 0;
      const fuelCost = Number(name === "fuelCost" ? value : prev.fuelCost) || 0;
      const tollCost = Number(name === "tollCost" ? value : prev.tollCost) || 0;
      const maintenanceCost = Number(name === "maintenanceCost" ? value : prev.maintenanceCost) || 0;
      const driverSalary = Number(name === "driverSalary" ? value : prev.driverSalary) || 0;

      // Due Amount = Delivery Cost - Advance Paid
      updated.dueAmount = Math.max(deliveryCost - advancePaid, 0).toString();

      // Net Profit = Delivery Cost - Total Expenses (Fuel + Toll + Maintenance + Driver Salary)
      const totalExpenses = fuelCost + tollCost + maintenanceCost + driverSalary;
      updated.netProfit = (deliveryCost - totalExpenses).toString();

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Unable to save delivery");
        return;
      }

      setDeliveries((prev) => [result.data, ...prev]);
      setSaved(true);
      setFormData(emptyForm);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this delivery record?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/deliveries?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete delivery.");
      }

      setDeliveries((prev) => prev.filter((delivery) => delivery._id !== id));
    } catch (error) {
      console.error("Delete delivery error:", error);
      alert(error.message || "Unable to delete delivery.");
    }
  };

  const handleReset = () => {
    setFormData(emptyForm);
  };

  const handleExportExcel = () => {
    const headers = [
      "Going Date",
      "Truck Reg No",
      "Driver",
      "Going Source",
      "Going Destination",
      "Coming Date",
      "Coming Source",
      "Coming Destination",
      "Material",
      "Quantity",
      "Unit",
      "Delivery Cost",
      "Advance",
      "Due",
      "Fuel Cost",
      "Toll Cost",
      "Maintenance Cost",
      "Driver Salary",
      "Total Expense",
      "Net Profit",
      "Status",
      "Notes",
    ];
    const rows = deliveries.map((delivery) => [
      delivery.goingDate || delivery.deliveryDate || "",
      delivery.truckNumber,
      delivery.driverName,
      delivery.goingSource || delivery.source,
      delivery.goingDestination || delivery.destination,
      delivery.comingDate,
      delivery.comingSource,
      delivery.comingDestination,
      delivery.material,
      delivery.quantity,
      delivery.quantityUnit,
      delivery.deliveryCost,
      delivery.advancePaid ?? delivery.amountPaid,
      delivery.dueAmount,
      delivery.fuelCost,
      delivery.tollCost,
      delivery.maintenanceCost,
      delivery.driverSalary,
      delivery.totalExpense,
      delivery.netProfit ?? delivery.netIncome,
      delivery.status,
      delivery.notes,
    ]);
    exportCsv(`Daily_Deliveries_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
  };

  return (
    <div style={styles.container}>
      {/* PAGE HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily Truck Delivery</h1>
          <p style={styles.subtitle}>
            Record daily truck trips, return routes, expenses, and driver salaries.
          </p>
        </div>
        <div style={styles.dateBox}>
          <Calendar size={17} />
          <span>
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {saved && <div style={styles.successMessage}>Delivery record saved successfully.</div>}

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit}>
        {/* 1. TRUCK INFO */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.sectionIcon}>
              <Truck size={18} />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Truck Info</h2>
              <p style={styles.cardSubtitle}>Select vehicle, assigned driver, and operational status.</p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <FormGroup label="Truck Reg No" required>
              <select
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">Select Truck Reg No</option>
                {truckOptions.map((truckNo) => (
                  <option key={truckNo} value={truckNo}>
                    {truckNo}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Driver Name" required>
              <div style={styles.inputWithIcon}>
                <User size={16} color="#64748b" />
                <select
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  style={styles.iconInput}
                  required
                >
                  <option value="">Select Driver</option>
                  {driverOptions.map((driverName) => (
                    <option key={driverName} value={driverName}>
                      {driverName}
                    </option>
                  ))}
                </select>
              </div>
            </FormGroup>

            <FormGroup label="Delivery Status" fullWidth>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </FormGroup>
          </div>
        </div>

        {/* 2. DELIVERY ROUTE (GOING & COMING) */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.sectionIcon}>
              <MapPin size={18} />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Delivery Route</h2>
              <p style={styles.cardSubtitle}>Going and coming trip route dates and locations.</p>
            </div>
          </div>

          {/* GOING SECTION */}
          <div style={styles.subSectionTitle}>Going Trip</div>
          <div style={styles.formGridThree}>
            <FormGroup label="Going Date" required>
              <input
                type="date"
                name="goingDate"
                value={formData.goingDate}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </FormGroup>

            <FormGroup label="Source / Pickup Location" required>
              <input
                type="text"
                name="goingSource"
                value={formData.goingSource}
                onChange={handleChange}
                placeholder="e.g. Kolkata Warehouse"
                style={styles.input}
                required
              />
            </FormGroup>

            <FormGroup label="Destination" required>
              <input
                type="text"
                name="goingDestination"
                value={formData.goingDestination}
                onChange={handleChange}
                placeholder="e.g. Durgapur Plant"
                style={styles.input}
                required
              />
            </FormGroup>
          </div>

          {/* COMING SECTION */}
          <div style={{ ...styles.subSectionTitle, marginTop: "20px" }}>Coming Trip (Return)</div>
          <div style={styles.formGridThree}>
            <FormGroup label="Coming Date">
              <input
                type="date"
                name="comingDate"
                value={formData.comingDate}
                onChange={handleChange}
                style={styles.input}
              />
            </FormGroup>

            <FormGroup label="Source / Pickup Location">
              <input
                type="text"
                name="comingSource"
                value={formData.comingSource}
                onChange={handleChange}
                placeholder="e.g. Durgapur Plant"
                style={styles.input}
              />
            </FormGroup>

            <FormGroup label="Destination">
              <input
                type="text"
                name="comingDestination"
                value={formData.comingDestination}
                onChange={handleChange}
                placeholder="e.g. Kolkata Warehouse"
                style={styles.input}
              />
            </FormGroup>
          </div>

          {/* MATERIALS & QUANTITY */}
          <div style={{ ...styles.formGrid, marginTop: "20px" }}>
            <FormGroup label="Materials">
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g. Cement, Plywood, Iron Rods"
                style={styles.input}
              />
            </FormGroup>

            <FormGroup label="Quantity">
              <div style={styles.quantityGroup}>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  style={styles.quantityInput}
                />
                <select
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  style={styles.unitSelect}
                >
                  <option value="Ton">Ton</option>
                  <option value="Kg">Kg</option>
                  <option value="Piece">Piece</option>
                  <option value="Load">Load</option>
                  <option value="CFT">CFT</option>
                </select>
              </div>
            </FormGroup>
          </div>
        </div>

        {/* 3. FINANCIAL DETAILS */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.sectionIcon}>
              <IndianRupee size={18} />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Financial Details</h2>
              <p style={styles.cardSubtitle}>
                Trip charges, advance, operating expenses, due amount, and net profit.
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <FormGroup label="Delivery Cost">
              <div style={styles.inputWithIcon}>
                <IndianRupee size={15} color="#64748b" />
                <input
                  type="number"
                  name="deliveryCost"
                  value={formData.deliveryCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  style={styles.iconInput}
                />
              </div>
            </FormGroup>

            <FormGroup label="Advance">
              <div style={styles.inputWithIcon}>
                <IndianRupee size={15} color="#64748b" />
                <input
                  type="number"
                  name="advancePaid"
                  value={formData.advancePaid}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  style={styles.iconInput}
                />
              </div>
            </FormGroup>

            <FormGroup label="Fuel Cost">
              <div style={styles.inputWithIcon}>
                <IndianRupee size={15} color="#64748b" />
                <input
                  type="number"
                  name="fuelCost"
                  value={formData.fuelCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  style={styles.iconInput}
                />
              </div>
            </FormGroup>

            <FormGroup label="Toll Cost">
              <div style={styles.inputWithIcon}>
                <IndianRupee size={15} color="#64748b" />
                <input
                  type="number"
                  name="tollCost"
                  value={formData.tollCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  style={styles.iconInput}
                />
              </div>
            </FormGroup>

            <FormGroup label="Maintenance Cost & Type">
              <div style={styles.inlineSplit}>
                <div style={{ ...styles.inputWithIcon, flex: 1 }}>
                  <IndianRupee size={15} color="#64748b" />
                  <input
                    type="number"
                    name="maintenanceCost"
                    value={formData.maintenanceCost}
                    onChange={handleChange}
                    placeholder="Cost"
                    min="0"
                    style={styles.iconInput}
                  />
                </div>
                <select
                  name="maintenanceType"
                  value={formData.maintenanceType}
                  onChange={handleChange}
                  style={{ ...styles.input, flex: 1 }}
                >
                  <option value="">Select Type</option>
                  <option value="Engine">Engine</option>
                  <option value="Tyre">Tyre</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake">Brake</option>
                  <option value="Electrical">Electrical</option>
                  <option value="General Service">General Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </FormGroup>

            <FormGroup label="Driver Salary">
              <div style={styles.inputWithIcon}>
                <IndianRupee size={15} color="#64748b" />
                <input
                  type="number"
                  name="driverSalary"
                  value={formData.driverSalary}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  style={styles.iconInput}
                />
              </div>
            </FormGroup>

            <FormGroup label="Due Amount">
              <div style={styles.dueBox}>
                <IndianRupee size={15} />
                <span>₹ {Number(formData.dueAmount || 0).toLocaleString("en-IN")}</span>
              </div>
            </FormGroup>

            <FormGroup label="Net Profit">
              <div
                style={{
                  ...styles.profitBox,
                  backgroundColor: Number(formData.netProfit) >= 0 ? "#f0fdf4" : "#fef2f2",
                  borderColor: Number(formData.netProfit) >= 0 ? "#bbf7d0" : "#fecaca",
                  color: Number(formData.netProfit) >= 0 ? "#166534" : "#b91c1c",
                }}
              >
                <TrendingUp size={15} />
                <span>₹ {Number(formData.netProfit || 0).toLocaleString("en-IN")}</span>
              </div>
            </FormGroup>
          </div>
        </div>

        {/* 4. ADDITIONAL NOTES */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.sectionIcon}>
              <FileText size={18} />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Additional Notes</h2>
              <p style={styles.cardSubtitle}>Special remarks, gate passes, or customer notes.</p>
            </div>
          </div>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any additional information..."
            rows="3"
            style={styles.textarea}
          />
        </div>

        {/* FORM ACTIONS */}
        <div style={styles.actions}>
          <button type="button" onClick={handleReset} style={styles.resetBtn}>
            <RotateCcw size={16} />
            Reset
          </button>

          <button type="submit" style={styles.saveBtn}>
            <Save size={17} />
            Save Delivery Record
          </button>
        </div>
      </form>

      {/* TABLE RECORDS */}
      <div style={styles.recordsCard}>
        <div style={styles.recordsHeader}>
          <div>
            <h2 style={styles.recordsTitle}>Daily Delivery Records</h2>
            <p style={styles.recordsSubtitle}>View all delivery records added today.</p>
          </div>
          <div style={styles.recordsActions}>
            <button type="button" style={styles.exportBtn} onClick={handleExportExcel}>
              Export Excel
            </button>
            <div style={styles.recordCount}>{deliveries.length} Records</div>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading delivery records...</div>
        ) : deliveries.length === 0 ? (
          <div style={styles.emptyState}>
            <Truck size={38} color="#94a3b8" />
            <h3>No Delivery Records</h3>
            <p>Add your first daily truck delivery using the form above.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Going Date</th>
                  <th style={styles.th}>Truck Reg</th>
                  <th style={styles.th}>Driver</th>
                  <th style={styles.th}>Route (Going & Coming)</th>
                  <th style={styles.th}>Material & Qty</th>
                  <th style={styles.th}>Delivery Cost</th>
                  <th style={styles.th}>Advance</th>
                  <th style={styles.th}>Due</th>
                  <th style={styles.th}>Net Profit</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery._id} style={styles.tr}>
                    <td style={styles.td}>
                      {(delivery.goingDate || delivery.deliveryDate)
                        ? new Date(delivery.goingDate || delivery.deliveryDate).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td style={styles.td}>
                      <strong>{delivery.truckNumber || "-"}</strong>
                    </td>

                    <td style={styles.td}>{delivery.driverName || "-"}</td>

                    <td style={styles.td}>
                      <div style={styles.routeCell}>
                        <span>{delivery.goingSource || delivery.source || "-"}</span>
                        <span style={styles.routeArrow}>→</span>
                        <strong>{delivery.goingDestination || delivery.destination || "-"}</strong>
                      </div>
                      {(delivery.comingDate || delivery.comingSource || delivery.comingDestination) && (
                        <div style={{ ...styles.routeCell, color: "#64748b", fontSize: "11px" }}>
                          <span>
                            ↩ {delivery.comingDate
                              ? new Date(delivery.comingDate).toLocaleDateString("en-IN")
                              : delivery.comingSource || "Return"}
                          </span>
                          <span style={styles.routeArrow}>→</span>
                          <span>{delivery.comingDestination || "-"}</span>
                        </div>
                      )}
                    </td>

                    <td style={styles.td}>
                      {delivery.material ? <strong>{delivery.material}</strong> : null}
                      {delivery.quantity ? (
                        <div>
                          {delivery.quantity} {delivery.quantityUnit}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td style={styles.td}>
                      ₹ {Number(delivery.deliveryCost || 0).toLocaleString("en-IN")}
                    </td>

                    <td style={styles.td}>
                      ₹ {Number(delivery.advancePaid ?? delivery.amountPaid ?? 0).toLocaleString("en-IN")}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          Number(delivery.dueAmount) > 0 ? styles.dueBadge : styles.paidBadge
                        }
                      >
                        ₹ {Number(delivery.dueAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <strong
                        style={{
                          color:
                            Number(delivery.netProfit ?? delivery.netIncome ?? 0) >= 0
                              ? "#15803d"
                              : "#dc2626",
                        }}
                      >
                        ₹ {Number(delivery.netProfit ?? delivery.netIncome ?? 0).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(delivery.status === "Delivered"
                            ? styles.delivered
                            : delivery.status === "Cancelled"
                            ? styles.cancelled
                            : styles.inTransit),
                        }}
                      >
                        {delivery.status}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => handleDelete(delivery._id)}
                        style={styles.deleteBtn}
                        title="Delete Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    paddingBottom: "40px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },
  title: {
    fontSize: "22px",
    color: "#0f172a",
    fontWeight: "700",
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "5px",
  },
  dateBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 13px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "600",
  },
  successMessage: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "12px 15px",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
    padding: "22px",
    marginBottom: "20px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    paddingBottom: "14px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  cardSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: "3px 0 0",
  },
  subSectionTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "10px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },
  formGridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  input: {
    width: "100%",
    height: "40px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    boxSizing: "border-box",
  },
  inputWithIcon: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    height: "40px",
    padding: "0 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },
  iconInput: {
    border: "none",
    outline: "none",
    width: "100%",
    height: "100%",
    fontSize: "13px",
    backgroundColor: "transparent",
    color: "#334155",
  },
  inlineSplit: {
    display: "flex",
    gap: "8px",
  },
  quantityGroup: {
    display: "flex",
    height: "40px",
  },
  quantityInput: {
    flex: 1,
    minWidth: 0,
    border: "1px solid #cbd5e1",
    borderRight: "none",
    borderRadius: "6px 0 0 6px",
    padding: "0 12px",
    outline: "none",
    fontSize: "13px",
  },
  unitSelect: {
    width: "90px",
    border: "1px solid #cbd5e1",
    borderRadius: "0 6px 6px 0",
    backgroundColor: "#f8fafc",
    outline: "none",
    color: "#475569",
    fontSize: "12px",
  },
  dueBox: {
    height: "40px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "0 12px",
    backgroundColor: "#fff7ed",
    color: "#c2410c",
    border: "1px solid #fed7aa",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
  },
  profitBox: {
    height: "40px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "0 12px",
    border: "1px solid",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
  },
  textarea: {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "13px",
    color: "#334155",
    boxSizing: "border-box",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginBottom: "20px",
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 18px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  recordsCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
    padding: "22px",
    overflow: "hidden",
  },
  recordsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  recordsTitle: {
    fontSize: "16px",
    color: "#0f172a",
    fontWeight: "700",
    margin: 0,
  },
  recordsSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  },
  recordCount: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },
  recordsActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  exportBtn: {
    padding: "8px 12px",
    border: "none",
    backgroundColor: "#047857",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "12px",
  },
  th: {
    padding: "11px 10px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "12px 10px",
    color: "#334155",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  routeCell: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  routeArrow: {
    color: "#94a3b8",
  },
  dueBadge: {
    display: "inline-block",
    backgroundColor: "#fff7ed",
    color: "#c2410c",
    padding: "4px 7px",
    borderRadius: "5px",
    fontWeight: "700",
  },
  paidBadge: {
    display: "inline-block",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    padding: "4px 7px",
    borderRadius: "5px",
    fontWeight: "700",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "5px",
    fontSize: "10px",
    fontWeight: "700",
  },
  delivered: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  inTransit: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  cancelled: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    border: "1px solid #fecaca",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "5px",
    cursor: "pointer",
  },
  emptyState: {
    minHeight: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
};