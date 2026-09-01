import React, { useEffect, useState } from "react";
import FormGroup from "../components/FormGroup";
import {
  Truck,
  MapPin,
  IndianRupee,
  Wrench,
  Calendar,
  User,
  FileText,
  Save,
  RotateCcw,
  Trash2,
} from "lucide-react";

const emptyForm = {
  deliveryDate: new Date().toISOString().split("T")[0],
  truckName: "",
  truckNumber: "",
  driverName: "",
  source: "",
  destination: "",
  material: "",
  quantity: "",
  quantityUnit: "Ton",
  deliveryCost: "",
  amountPaid: "",
  dueAmount: "",
  maintenanceCost: "",
  fuelCost: "",
  tollCost: "",
  status: "In Transit",
  maintenanceType: "",
  maintenanceDetails: "",
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

      if (!response.ok) {
        throw new Error(data.message || "Unable to load truck list.");
      }

      const options = Array.isArray(data)
        ? data
            .map((truck) => truck?.regNo?.trim())
            .filter(Boolean)
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

      if (!response.ok) {
        throw new Error(data.message || "Unable to load driver list.");
      }

      const options = Array.isArray(data)
        ? data
            .map((driver) => driver?.name?.trim())
            .filter(Boolean)
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

      if (!response.ok) {
        throw new Error(data.message || "Unable to load deliveries.");
      }

      setDeliveries(data);
    } catch (error) {
      console.error("Load deliveries error:", error);
      alert("Unable to load delivery records. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      // Automatically calculate due amount
      if (name === "deliveryCost" || name === "amountPaid") {
        const deliveryCost =
          name === "deliveryCost"
            ? Number(value)
            : Number(prev.deliveryCost || 0);

        const amountPaid =
          name === "amountPaid"
            ? Number(value)
            : Number(prev.amountPaid || 0);

        updatedData.dueAmount = Math.max(
          deliveryCost - amountPaid,
          0
        ).toString();
      }

      return updatedData;
    });
  };

  // Save delivery
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "/api/deliveries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
          "Unable to save delivery"
        );
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

  // Delete delivery
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this delivery record?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `/api/deliveries?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
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

  // Reset form
  const handleReset = () => {
    setFormData(emptyForm);
  };

  return (
    <div style={styles.container}>

      {/* PAGE HEADER */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Daily Truck Delivery
          </h1>

          <p style={styles.subtitle}>
            Record daily truck trips, deliveries,
            expenses, payments and maintenance details.
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

      {saved && (
        <div style={styles.successMessage}>
          Delivery record saved successfully.
        </div>
      )}


      {/* ================= FORM ================= */}

      <form onSubmit={handleSubmit}>

        {/* TRUCK INFORMATION */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.sectionIcon}>
              <Truck size={18} />
            </div>

            <div>

              <h2 style={styles.cardTitle}>
                Truck Information
              </h2>

              <p style={styles.cardSubtitle}>
                Select the truck and driver for today's delivery.
              </p>

            </div>

          </div>


          <div style={styles.formGrid}>

            {/* <FormGroup label="Truck Name" required>

              <select
                name="truckName"
                value={formData.truckName}
                onChange={handleChange}
                style={styles.input}
                required
              >

                <option value="">
                  Select Truck
                </option>

                <option value="Truck 01">
                  Truck 01
                </option>

                <option value="Truck 02">
                  Truck 02
                </option>

                <option value="Truck 03">
                  Truck 03
                </option>

                <option value="Truck 04">
                  Truck 04
                </option>

              </select>

            </FormGroup> */}


            <FormGroup label="Truck Registration Number" required>

              <select
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleChange}
                style={styles.input}
                required
              >

                <option value="">
                  Select Truck Registration Number
                </option>

                {truckOptions.map((truckNo) => (
                  <option key={truckNo} value={truckNo}>
                    {truckNo}
                  </option>
                ))}

              </select>

            </FormGroup>


            <FormGroup label="Driver Name" required>

              <div style={styles.inputWithIcon}>

                <User
                  size={16}
                  color="#64748b"
                />

                <select
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleChange}
                  style={styles.iconInput}
                  required
                >

                  <option value="">
                    Select Driver
                  </option>

                  {driverOptions.map((driverName) => (
                    <option key={driverName} value={driverName}>
                      {driverName}
                    </option>
                  ))}

                </select>

              </div>

            </FormGroup>


            <FormGroup label="Delivery Date" required>

              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleChange}
                style={styles.input}
                required
              />

            </FormGroup>


            <FormGroup label="Delivery Status">

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >

                <option value="Scheduled">
                  Scheduled
                </option>

                <option value="In Transit">
                  In Transit
                </option>

                <option value="Delivered">
                  Delivered
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>

              </select>

            </FormGroup>

          </div>

        </div>


        {/* DELIVERY ROUTE */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.sectionIcon}>
              <MapPin size={18} />
            </div>

            <div>

              <h2 style={styles.cardTitle}>
                Delivery Route
              </h2>

              <p style={styles.cardSubtitle}>
                Enter pickup and destination information.
              </p>

            </div>

          </div>


          <div style={styles.formGrid}>

            <FormGroup
              label="Source / Pickup Location"
              required
            >

              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g. Kolkata Warehouse"
                style={styles.input}
                required
              />

            </FormGroup>


            <FormGroup label="Destination" required>

              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Durgapur"
                style={styles.input}
                required
              />

            </FormGroup>


            <FormGroup label="Material">

              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g. Cement"
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

                  <option value="Ton">
                    Ton
                  </option>

                  <option value="Kg">
                    Kg
                  </option>

                  <option value="Piece">
                    Piece
                  </option>

                  <option value="Load">
                    Load
                  </option>

                </select>

              </div>

            </FormGroup>

          </div>

        </div>


        {/* FINANCIAL INFORMATION */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.sectionIcon}>
              <IndianRupee size={18} />
            </div>

            <div>

              <h2 style={styles.cardTitle}>
                Delivery & Financial Details
              </h2>

              <p style={styles.cardSubtitle}>
                Track delivery income and operating expenses.
              </p>

            </div>

          </div>


          <div style={styles.formGrid}>

            <FormGroup label="Delivery Cost">

              <div style={styles.inputWithIcon}>

                <IndianRupee
                  size={15}
                  color="#64748b"
                />

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


            <FormGroup label="Amount Paid">

              <div style={styles.inputWithIcon}>

                <IndianRupee
                  size={15}
                  color="#64748b"
                />

                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
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

                <span>
                  ₹
                  {Number(
                    formData.dueAmount || 0
                  ).toLocaleString("en-IN")}
                </span>

              </div>

            </FormGroup>


            <FormGroup label="Fuel Cost">

              <div style={styles.inputWithIcon}>

                <IndianRupee
                  size={15}
                  color="#64748b"
                />

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

                <IndianRupee
                  size={15}
                  color="#64748b"
                />

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

          </div>

        </div>


        {/* MAINTENANCE */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.sectionIcon}>
              <Wrench size={18} />
            </div>

            <div>

              <h2 style={styles.cardTitle}>
                Maintenance Details
              </h2>

              <p style={styles.cardSubtitle}>
                Record any maintenance or repair work performed today.
              </p>

            </div>

          </div>


          <div style={styles.formGrid}>

            <FormGroup label="Maintenance Cost">

              <div style={styles.inputWithIcon}>

                <IndianRupee
                  size={15}
                  color="#64748b"
                />

                <input
                  type="number"
                  name="maintenanceCost"
                  value={formData.maintenanceCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  style={styles.iconInput}
                />

              </div>

            </FormGroup>


            <FormGroup label="Maintenance Type">

              <select
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleChange}
                style={styles.input}
              >

                <option value="">
                  Select Type
                </option>

                <option value="Engine">
                  Engine
                </option>

                <option value="Tyre">
                  Tyre
                </option>

                <option value="Oil Change">
                  Oil Change
                </option>

                <option value="Brake">
                  Brake
                </option>

                <option value="Electrical">
                  Electrical
                </option>

                <option value="General Service">
                  General Service
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </FormGroup>


            <FormGroup
              label="Maintenance Description"
              fullWidth
            >

              <textarea
                name="maintenanceDetails"
                value={formData.maintenanceDetails}
                onChange={handleChange}
                placeholder="Describe the maintenance or repair work..."
                rows="4"
                style={styles.textarea}
              />

            </FormGroup>

          </div>

        </div>


        {/* NOTES */}

        <div style={styles.card}>

          <div style={styles.cardHeader}>

            <div style={styles.sectionIcon}>
              <FileText size={18} />
            </div>

            <div>

              <h2 style={styles.cardTitle}>
                Additional Notes
              </h2>

            </div>

          </div>


          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any additional information..."
            rows="4"
            style={styles.textarea}
          />

        </div>


        {/* FORM ACTIONS */}

        <div style={styles.actions}>

          <button
            type="button"
            onClick={handleReset}
            style={styles.resetBtn}
          >

            <RotateCcw size={16} />

            Reset

          </button>


          <button
            type="submit"
            style={styles.saveBtn}
          >

            <Save size={17} />

            Save Delivery Record

          </button>

        </div>

      </form>

      <div style={styles.recordsCard}>
        <div style={styles.recordsHeader}>
          <div>
            <h2 style={styles.recordsTitle}>Daily Delivery Records</h2>
            <p style={styles.recordsSubtitle}>
              View all delivery records added today.
            </p>
          </div>
          <div style={styles.recordCount}>{deliveries.length} Records</div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading delivery records...</div>
        ) : deliveries.length === 0 ? (
          <div style={styles.emptyState}>
            <Truck size={38} color="#94a3b8" />
            <h3>No Delivery Records</h3>
            <p>
              Add your first daily truck delivery using the form above.
            </p>
          </div>
        ) : (

          <div style={styles.tableWrapper}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Date
                  </th>

                  <th style={styles.th}>
                    Truck
                  </th>

                  <th style={styles.th}>
                    Driver
                  </th>

                  <th style={styles.th}>
                    Route
                  </th>

                  <th style={styles.th}>
                    Quantity
                  </th>

                  <th style={styles.th}>
                    Delivery Cost
                  </th>

                  <th style={styles.th}>
                    Paid
                  </th>

                  <th style={styles.th}>
                    Due
                  </th>

                  <th style={styles.th}>
                    Maintenance
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {deliveries.map((delivery) => (

                  <tr
                    key={delivery._id}
                    style={styles.tr}
                  >

                    <td style={styles.td}>

                      {new Date(
                        delivery.deliveryDate
                      ).toLocaleDateString("en-IN")}

                    </td>


                    <td style={styles.td}>

                      <div style={styles.truckCell}>

                        <strong>
                          {delivery.truckName}
                        </strong>

                        <small>
                          {delivery.truckNumber}
                        </small>

                      </div>

                    </td>


                    <td style={styles.td}>
                      {delivery.driverName}
                    </td>


                    <td style={styles.td}>

                      <div style={styles.routeCell}>

                        <span>
                          {delivery.source}
                        </span>

                        <span style={styles.routeArrow}>
                          →
                        </span>

                        <strong>
                          {delivery.destination}
                        </strong>

                      </div>

                    </td>


                    <td style={styles.td}>

                      {delivery.quantity
                        ? `${delivery.quantity} ${delivery.quantityUnit}`
                        : "-"}

                    </td>


                    <td style={styles.td}>

                      ₹
                      {Number(
                        delivery.deliveryCost || 0
                      ).toLocaleString("en-IN")}

                    </td>


                    <td style={styles.td}>

                      ₹
                      {Number(
                        delivery.amountPaid || 0
                      ).toLocaleString("en-IN")}

                    </td>


                    <td style={styles.td}>

                      <span
                        style={
                          Number(delivery.dueAmount) > 0
                            ? styles.dueBadge
                            : styles.paidBadge
                        }
                      >

                        ₹
                        {Number(
                          delivery.dueAmount || 0
                        ).toLocaleString("en-IN")}

                      </span>

                    </td>


                    <td style={styles.td}>

                      ₹
                      {Number(
                        delivery.maintenanceCost || 0
                      ).toLocaleString("en-IN")}

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
                        onClick={() =>
                          handleDelete(delivery._id)
                        }
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
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "16px",
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

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  label: {
    fontSize: "12px",
    color: "#334155",
    fontWeight: "600",
  },

  required: {
    color: "#dc2626",
    marginLeft: "3px",
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
    width: "100px",
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

  truckCell: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  truckCellSmall: {
    fontSize: "11px",
    color: "#64748b",
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