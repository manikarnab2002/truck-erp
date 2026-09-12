import React, { useState, useEffect } from "react";
import FormGroup from "../components/FormGroup";
import { exportCsv } from "../utils/exportCsv";
import { readApiResponse } from "../utils/apiResponse";
import {
  UserCheck,
  IndianRupee,
  Calendar,
  Trash2,
  Save,
  RotateCcw,
  Users,
  FileSpreadsheet,
  Truck,
} from "lucide-react";

const initialFormState = {
  date: new Date().toISOString().split("T")[0],
  truckRegNo: "",
  staffType: "Driver",
  paymentType: "Salary",
  amount: "",
  notes: "",
};

export default function StaffPayment() {
  const [formData, setFormData] = useState(initialFormState);
  const [payments, setPayments] = useState([]);
  const [truckOptions, setTruckOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPayments();
    loadTrucks();
  }, []);

  const loadTrucks = async () => {
    try {
      const response = await fetch("/api/trucks");
      const data = await readApiResponse(response);
      if (response.ok && Array.isArray(data)) {
        setTruckOptions(data.map((t) => (t.regNo || t.truckNo || t.registrationNumber || t.name)?.trim()).filter(Boolean));
      }
    } catch (error) {
      console.error("Failed to load trucks:", error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await fetch("/api/staff-payments");
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Failed to load payments.");
      setPayments(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load staff payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.truckRegNo.trim() || Number(formData.amount) <= 0) {
      alert("Please provide a valid truck registration number and amount.");
      return;
    }

    try {
      const response = await fetch("/api/staff-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await readApiResponse(response);
      if (!response.ok) {
        alert(result.message || "Unable to save staff payment.");
        return;
      }

      setPayments((prev) => [result.data || result, ...prev]);
      setSaved(true);
      setFormData(initialFormState);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;

    try {
      const response = await fetch(`/api/staff-payments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(result.message || "Unable to delete record.");

      setPayments((prev) => prev.filter((item) => (item._id || item.paymentId) !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Unable to delete record.");
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Payment ID",
      "Date",
      "Truck Reg No",
      "Staff Type",
      "Payment Type",
      "Amount",
      "Notes",
    ];
    const rows = payments.map((p) => [
      p.paymentId || "-",
      p.date || "-",
      p.truckRegNo || "-",
      p.staffType || "-",
      p.paymentType || "-",
      p.amount || 0,
      p.notes || "-",
    ]);
    exportCsv(`Staff_Payments_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
  };

  const totalDriverPaid = payments
    .filter((p) => p.staffType === "Driver")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalHelperPaid = payments
    .filter((p) => p.staffType === "Helper")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Staff Payments</h1>
          <p style={styles.subtitle}>Record driver & helper payments, allowances, and vehicle allocations.</p>
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

      {/* STATS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Driver Total Paid</span>
          <span style={styles.statValue}>₹ {totalDriverPaid.toLocaleString("en-IN")}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Helper Total Paid</span>
          <span style={{ ...styles.statValue, color: "#2563eb" }}>
            ₹ {totalHelperPaid.toLocaleString("en-IN")}
          </span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Staff Expense</span>
          <span style={{ ...styles.statValue, color: "#dc2626" }}>
            ₹ {(totalDriverPaid + totalHelperPaid).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {saved && <div style={styles.successMessage}>Payment entry saved successfully.</div>}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.sectionIcon}>
              <UserCheck size={18} />
            </div>
            <div>
              <h2 style={styles.cardTitle}>Add Staff Payment</h2>
              <p style={styles.cardSubtitle}>Enter date, truck registration number, payment type, and amount.</p>
            </div>
          </div>

          <div style={styles.formGridTwo}>
            <FormGroup label="Payment Date" required>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </FormGroup>

            <FormGroup label="Truck Reg No" required>
              <input
                type="text"
                name="truckRegNo"
                list="truck-options"
                value={formData.truckRegNo}
                onChange={handleChange}
                placeholder="e.g. WB 19 A 1234"
                style={styles.input}
                required
              />
              {truckOptions.length > 0 && (
                <datalist id="truck-options">
                  {truckOptions.map((regNo, i) => (
                    <option key={i} value={regNo} />
                  ))}
                </datalist>
              )}
            </FormGroup>
          </div>

          <div style={{ ...styles.formGridThree, marginTop: "16px" }}>
            <FormGroup label="Staff Type" required>
              <select
                name="staffType"
                value={formData.staffType}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Driver">Driver</option>
                <option value="Helper">Helper</option>
              </select>
            </FormGroup>

            <FormGroup label="Payment Type" required>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Salary">Monthly Salary</option>
                <option value="Trip Allowance">Trip Allowance / Batta</option>
                <option value="Advance">Salary Advance</option>
                <option value="Bonus">Bonus / Incentive</option>
                <option value="Food Expense">Food / Daily Expense</option>
                <option value="Other">Other</option>
              </select>
            </FormGroup>

            <FormGroup label="Amount (₹)" required>
              <div style={styles.inputWithIcon}>
                <IndianRupee size={15} color="#64748b" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="1"
                  style={styles.iconInput}
                  required
                />
              </div>
            </FormGroup>
          </div>

          <div style={{ marginTop: "16px" }}>
            <FormGroup label="Notes / Remarks">
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Kolkata-Durgapur trip allowance or ref details"
                style={styles.input}
              />
            </FormGroup>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => setFormData(initialFormState)}
              style={styles.resetBtn}
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button type="submit" style={styles.saveBtn}>
              <Save size={16} />
              Save Payment
            </button>
          </div>
        </div>
      </form>

      {/* TABLE */}
      <div style={styles.recordsCard}>
        <div style={styles.recordsHeader}>
          <div>
            <h2 style={styles.recordsTitle}>Staff Payment Records</h2>
            <p style={styles.recordsSubtitle}>View all recorded payments grouped by vehicle and role.</p>
          </div>
          <div style={styles.recordsActions}>
            <button type="button" style={styles.exportBtn} onClick={handleExportCsv}>
              <FileSpreadsheet size={15} />
              Export CSV
            </button>
            <div style={styles.recordCount}>{payments.length} Records</div>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading staff records...</div>
        ) : payments.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={38} color="#94a3b8" />
            <h3>No Payment Records Found</h3>
            <p>Add your first payment record using the form above.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Truck Reg No</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Payment Type</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id || p.paymentId} style={styles.tr}>
                    <td style={styles.td}>
                      {p.date ? new Date(p.date).toLocaleDateString("en-IN") : "-"}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.truckBadge}>
                        <Truck size={13} style={{ marginRight: "5px" }} />
                        <strong>{p.truckRegNo || "-"}</strong>
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: p.staffType === "Driver" ? "#dbeafe" : "#fef3c7",
                          color: p.staffType === "Driver" ? "#1e40af" : "#92400e",
                        }}
                      >
                        {p.staffType}
                      </span>
                    </td>
                    <td style={styles.td}>{p.paymentType}</td>
                    <td style={{ ...styles.td, fontWeight: "700", color: "#0f172a" }}>
                      ₹ {Number(p.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ ...styles.td, color: "#64748b" }}>{p.notes || "-"}</td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id || p.paymentId)}
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
    marginTop: "4px",
  },
  dateBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
  },
  statValue: {
    fontSize: "20px",
    color: "#0f172a",
    fontWeight: "700",
  },
  successMessage: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "12px",
    borderRadius: "7px",
    fontSize: "13px",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
    padding: "20px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionIcon: {
    width: "36px",
    height: "36px",
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
    margin: "2px 0 0",
  },
  formGridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
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
    fontSize: "13px",
    backgroundColor: "#ffffff",
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
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
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
    gap: "6px",
    padding: "9px 18px",
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
    padding: "20px",
  },
  recordsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
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
    marginTop: "2px",
  },
  recordsActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 12px",
    border: "none",
    backgroundColor: "#047857",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  recordCount: {
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "11px",
    fontWeight: "700",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "13px",
  },
  th: {
    padding: "10px 12px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "700",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "12px",
    color: "#334155",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
  },
  truckBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    padding: "3px 8px",
    borderRadius: "5px",
    border: "1px solid #e2e8f0",
    fontSize: "12px",
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
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: "6px",
  },
};