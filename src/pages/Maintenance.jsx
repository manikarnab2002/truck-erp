import React, { useState, useEffect, useMemo, useRef } from "react";
import FormGroup from "../components/FormGroup";
import { exportCsv } from "../utils/exportCsv";
import { readApiResponse } from "../utils/apiResponse";
import {
  Wrench,
  Truck,
  IndianRupee,
  Calendar,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  FileSpreadsheet,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  DollarSign,
  Layers,
  History,
} from "lucide-react";

const initialFormState = {
  paymentDate: new Date().toISOString().split("T")[0],
  truckRegNo: "",
  maintenanceCost: "",
  maintenanceType: "",
  notes: "",
};

const commonMaintenanceTypes = [
  "Engine Oil & Filter Change",
  "Brake Pad Replacement",
  "Tire Replacement & Alignment",
  "Clutch Assembly Repair",
  "Battery Replacement",
  "Suspension & Leaf Spring Repair",
  "Electrical & Wiring Work",
  "Gearbox / Transmission Service",
  "Coolant & Radiator Service",
  "Greasing & General Inspection",
  "Body Work & Painting",
  "Air Filter & Fuel Filter Change",
  "AC & Cabin Repair",
  "Differential Oil Change",
];

export default function Maintenance() {
  const [formData, setFormData] = useState(initialFormState);
  const [records, setRecords] = useState([]);
  const [truckOptions, setTruckOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [truckFilter, setTruckFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");

  const formRef = useRef(null);

  useEffect(() => {
    loadRecords();
    loadTruckOptions();
  }, []);

  const loadTruckOptions = async () => {
    try {
      const response = await fetch("/api/trucks");
      const data = await readApiResponse(response);
      if (response.ok && Array.isArray(data)) {
        const list = data
          .map((t) => (t.regNo || t.truckNo || t.registrationNumber || t.name)?.trim())
          .filter(Boolean);
        setTruckOptions([...new Set(list)]);
      }
    } catch (error) {
      console.error("Failed to load truck options:", error);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/maintenance");
      const data = await readApiResponse(response);
      if (!response.ok) {
        throw new Error(data.message || "Failed to load maintenance records.");
      }
      const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setRecords(list);
    } catch (error) {
      console.error("Load maintenance records error:", error);
      showFeedback("error", "Unable to load maintenance records from server.");
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanTruckNo = formData.truckRegNo.trim();
    const cleanType = formData.maintenanceType.trim();
    const costNumber = Number(formData.maintenanceCost);

    if (!cleanTruckNo) {
      showFeedback("error", "Please provide a valid Truck Registration Number.");
      return;
    }

    if (!cleanType) {
      showFeedback("error", "Please specify the Maintenance Type.");
      return;
    }

    if (!Number.isFinite(costNumber) || costNumber <= 0) {
      showFeedback("error", "Please enter a valid Maintenance Cost greater than 0.");
      return;
    }

    setSubmitting(true);

    try {
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `/api/maintenance?id=${encodeURIComponent(editingId)}`
        : "/api/maintenance";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        paymentDate: formData.paymentDate || new Date().toISOString().split("T")[0],
        truckRegNo: cleanTruckNo,
        maintenanceCost: costNumber,
        maintenanceType: cleanType,
        notes: (formData.notes || "").trim(),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await readApiResponse(response);

      if (!response.ok) {
        showFeedback("error", result.message || "Failed to save maintenance record.");
        return;
      }

      if (isEditing) {
        setRecords((prev) =>
          prev.map((item) =>
            (item._id || item.id) === editingId
              ? { ...item, ...payload, updatedAt: new Date() }
              : item
          )
        );
        showFeedback("success", "Maintenance record updated successfully!");
        setEditingId(null);
      } else {
        const newRecord = result.data || {
          ...payload,
          id: `MNT-${Date.now()}`,
          _id: result.id || `MNT-${Date.now()}`,
          createdAt: new Date(),
        };
        setRecords((prev) => [newRecord, ...prev]);
        showFeedback("success", "Maintenance record added successfully!");
      }

      setFormData({
        ...initialFormState,
        paymentDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Save maintenance error:", error);
      showFeedback("error", "Failed to connect to server. Please check MongoDB connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record._id || record.id);
    setFormData({
      paymentDate: record.paymentDate
        ? new Date(record.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      truckRegNo: record.truckRegNo || record.truckNo || "",
      maintenanceCost: record.maintenanceCost ?? record.cost ?? "",
      maintenanceType: record.maintenanceType ?? record.serviceType ?? "",
      notes: record.notes || "",
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    try {
      const response = await fetch(`/api/maintenance?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const result = await readApiResponse(response);

      if (!response.ok) {
        showFeedback("error", result.message || "Failed to delete record.");
        return;
      }

      setRecords((prev) => prev.filter((r) => (r._id || r.id) !== id));
      showFeedback("success", "Record deleted successfully.");

      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Delete maintenance record error:", error);
      showFeedback("error", "Failed to delete record.");
    }
  };

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = [
      "Payment Date",
      "Truck Reg No",
      "Maintenance Type",
      "Cost (INR)",
      "Notes",
      "Created At",
    ];

    const rows = filteredRecords.map((r) => [
      r.paymentDate || "-",
      r.truckRegNo || r.truckNo || "-",
      r.maintenanceType || r.serviceType || "-",
      Number(r.maintenanceCost || r.cost || 0),
      r.notes || "-",
      r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "-",
    ]);

    const dateStr = new Date().toISOString().split("T")[0];
    exportCsv(`Maintenance_Records_${dateStr}.csv`, headers, rows);
  };

  // Filter & Sort Logic
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const truck = (record.truckRegNo || record.truckNo || "").toLowerCase();
        const type = (record.maintenanceType || record.serviceType || "").toLowerCase();
        const notes = (record.notes || "").toLowerCase();
        const date = (record.paymentDate || "").toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch =
          !search ||
          truck.includes(search) ||
          type.includes(search) ||
          notes.includes(search) ||
          date.includes(search);

        const matchesTruck =
          truckFilter === "All" ||
          (record.truckRegNo || record.truckNo || "") === truckFilter;

        return matchesSearch && matchesTruck;
      })
      .sort((a, b) => {
        const costA = Number(a.maintenanceCost ?? a.cost ?? 0);
        const costB = Number(b.maintenanceCost ?? b.cost ?? 0);
        const dateA = new Date(a.paymentDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.paymentDate || b.createdAt || 0).getTime();

        if (sortBy === "date-desc") return dateB - dateA;
        if (sortBy === "date-asc") return dateA - dateB;
        if (sortBy === "cost-desc") return costB - costA;
        if (sortBy === "cost-asc") return costA - costB;
        return 0;
      });
  }, [records, searchTerm, truckFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const totalCost = records.reduce(
      (sum, r) => sum + Number(r.maintenanceCost ?? r.cost ?? 0),
      0
    );
    const count = records.length;

    const currentYearMonth = new Date().toISOString().slice(0, 7);
    const thisMonthCost = records
      .filter((r) => (r.paymentDate || "").startsWith(currentYearMonth))
      .reduce((sum, r) => sum + Number(r.maintenanceCost ?? r.cost ?? 0), 0);

    const avgCost = count > 0 ? Math.round(totalCost / count) : 0;

    return { totalCost, count, thisMonthCost, avgCost };
  }, [records]);

  const filteredTotalCost = useMemo(() => {
    return filteredRecords.reduce(
      (sum, r) => sum + Number(r.maintenanceCost ?? r.cost ?? 0),
      0
    );
  }, [filteredRecords]);

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitleRow}>
            <div style={styles.titleIconBadge}>
              <Wrench size={22} color="#0284c7" />
            </div>
            <div>
              <h1 style={styles.title}>Vehicle Maintenance</h1>
              <p style={styles.subtitle}>
                Add repair and maintenance expenses, track costs, and inspect service history per truck.
              </p>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.dateBadge}>
            <Calendar size={15} color="#475569" />
            <span>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <span style={styles.statLabel}>Total Maintenance Cost</span>
            <div style={{ ...styles.iconPill, backgroundColor: "#fee2e2", color: "#dc2626" }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: "#dc2626" }}>
            ₹ {stats.totalCost.toLocaleString("en-IN")}
          </div>
          <span style={styles.statSubText}>Lifetime logged repairs</span>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <span style={styles.statLabel}>Total Service Records</span>
            <div style={{ ...styles.iconPill, backgroundColor: "#e0f2fe", color: "#0369a1" }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: "#0f172a" }}>
            {stats.count}
          </div>
          <span style={styles.statSubText}>Completed work entries</span>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <span style={styles.statLabel}>This Month's Expense</span>
            <div style={{ ...styles.iconPill, backgroundColor: "#fef3c7", color: "#d97706" }}>
              <History size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: "#d97706" }}>
            ₹ {stats.thisMonthCost.toLocaleString("en-IN")}
          </div>
          <span style={styles.statSubText}>Current billing cycle</span>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <span style={styles.statLabel}>Average Cost / Job</span>
            <div style={{ ...styles.iconPill, backgroundColor: "#f1f5f9", color: "#475569" }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ ...styles.statValue, color: "#334155" }}>
            ₹ {stats.avgCost.toLocaleString("en-IN")}
          </div>
          <span style={styles.statSubText}>Mean expense per event</span>
        </div>
      </div>

      {/* FEEDBACK TOAST / BANNER */}
      {feedback && (
        <div
          style={{
            ...styles.feedbackBanner,
            backgroundColor: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
            borderColor: feedback.type === "success" ? "#a7f3d0" : "#fecaca",
            color: feedback.type === "success" ? "#065f46" : "#991b1b",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} color="#10b981" />
          ) : (
            <AlertCircle size={18} color="#ef4444" />
          )}
          <span style={{ flex: 1, fontSize: "13px", fontWeight: "600" }}>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MAINTENANCE INPUT FORM */}
      <div ref={formRef} style={styles.formCard}>
        <div style={styles.formCardHeader}>
          <div style={styles.formHeaderLeft}>
            <div style={styles.formIconContainer}>
              {editingId ? <Edit2 size={18} color="#0284c7" /> : <PlusCircle size={18} color="#0284c7" />}
            </div>
            <div>
              <h2 style={styles.formTitle}>
                {editingId ? "Edit Maintenance Record" : "Add Maintenance Record"}
              </h2>
              <p style={styles.formSubtitle}>
                {editingId
                  ? "Update the details of the selected maintenance record."
                  : "Input payment date, vehicle number, cost, and maintenance type to log an expense."}
              </p>
            </div>
          </div>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={styles.cancelEditBtn}>
              <X size={14} />
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.formBody}>
          <div style={styles.formGrid}>
            {/* 1. PAYMENT DATE */}
            <FormGroup label="Payment Date" required>
              <div style={styles.inputWithIcon}>
                <Calendar size={15} color="#64748b" style={styles.iconInside} />
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  style={styles.inputPaddingLeft}
                  required
                />
              </div>
            </FormGroup>

            {/* 2. TRUCK REG NO */}
            <FormGroup label="Truck Reg No" required>
              <div style={styles.inputWithIcon}>
                <Truck size={15} color="#64748b" style={styles.iconInside} />
                <input
                  type="text"
                  name="truckRegNo"
                  list="truck-options-list"
                  placeholder="e.g. WB-19-AX-4021"
                  value={formData.truckRegNo}
                  onChange={handleChange}
                  style={styles.inputPaddingLeft}
                  required
                />
              </div>
              {truckOptions.length > 0 && (
                <datalist id="truck-options-list">
                  {truckOptions.map((opt, i) => (
                    <option key={i} value={opt} />
                  ))}
                </datalist>
              )}
            </FormGroup>

            {/* 3. MAINTENANCE COST */}
            <FormGroup label="Maintenance Cost (₹)" required>
              <div style={styles.inputWithIcon}>
                <IndianRupee size={15} color="#64748b" style={styles.iconInside} />
                <input
                  type="number"
                  name="maintenanceCost"
                  placeholder="e.g. 4500"
                  min="1"
                  step="any"
                  value={formData.maintenanceCost}
                  onChange={handleChange}
                  style={styles.inputPaddingLeft}
                  required
                />
              </div>
            </FormGroup>

            {/* 4. MAINTENANCE TYPE (INPUT FIELD) */}
            <FormGroup label="Maintenance Type" required>
              <div style={styles.inputWithIcon}>
                <Wrench size={15} color="#64748b" style={styles.iconInside} />
                <input
                  type="text"
                  name="maintenanceType"
                  list="maintenance-suggestions"
                  placeholder="e.g. Engine Oil, Brake Pad, Tire Change..."
                  value={formData.maintenanceType}
                  onChange={handleChange}
                  style={styles.inputPaddingLeft}
                  required
                />
              </div>
              <datalist id="maintenance-suggestions">
                {commonMaintenanceTypes.map((type, index) => (
                  <option key={index} value={type} />
                ))}
              </datalist>
            </FormGroup>
          </div>

          {/* NOTES / REMARKS (OPTIONAL) */}
          <div style={{ marginTop: "14px" }}>
            <FormGroup label="Notes / Workshop / Remarks (Optional)">
              <input
                type="text"
                name="notes"
                placeholder="e.g. Bill #8492 from National Garage, replaced left front brake pads"
                value={formData.notes}
                onChange={handleChange}
                style={styles.input}
              />
            </FormGroup>
          </div>

          {/* FORM ACTIONS */}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                if (editingId) {
                  handleCancelEdit();
                } else {
                  setFormData({
                    ...initialFormState,
                    paymentDate: new Date().toISOString().split("T")[0],
                  });
                }
              }}
              style={styles.resetBtn}
              disabled={submitting}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              style={editingId ? styles.updateBtn : styles.submitBtn}
              disabled={submitting}
            >
              <Save size={15} />
              <span>
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update Maintenance"
                  : "Add Maintenance"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* UNDER THE FORM: MAINTENANCE RECORDS LIST / TABLE */}
      <div style={styles.tableCard}>
        {/* TABLE TOOLBAR */}
        <div style={styles.tableToolbar}>
          <div>
            <h2 style={styles.tableTitle}>Maintenance Records List</h2>
            <p style={styles.tableSubtitle}>
              Showing {filteredRecords.length} of {records.length} total entries.
            </p>
          </div>

          <div style={styles.toolbarActions}>
            {/* Search Box */}
            <div style={styles.searchBox}>
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search truck, type, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Truck Filter */}
            <div style={styles.filterGroup}>
              <Filter size={15} color="#64748b" />
              <select
                value={truckFilter}
                onChange={(e) => setTruckFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Trucks</option>
                {truckOptions.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={styles.filterGroup}>
              <ArrowUpDown size={15} color="#64748b" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.select}
              >
                <option value="date-desc">Date: Newest First</option>
                <option value="date-asc">Date: Oldest First</option>
                <option value="cost-desc">Cost: High to Low</option>
                <option value="cost-asc">Cost: Low to High</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              style={styles.exportBtn}
              title="Export to CSV"
            >
              <FileSpreadsheet size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* TABLE CONTENT */}
        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.loadingSpinner}></div>
            <p style={{ marginTop: "12px", color: "#64748b", fontSize: "14px" }}>
              Loading maintenance records...
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconPill}>
              <Wrench size={36} color="#94a3b8" />
            </div>
            <h3 style={styles.emptyStateTitle}>No Maintenance Records Found</h3>
            <p style={styles.emptyStateText}>
              {searchTerm || truckFilter !== "All"
                ? "No entries match your search criteria. Try resetting filters."
                : "Add your first maintenance record using the form above."}
            </p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Payment Date</th>
                  <th style={styles.th}>Truck Reg No</th>
                  <th style={styles.th}>Maintenance Type</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Cost</th>
                  <th style={styles.th}>Notes / Remarks</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const recordId = item._id || item.id;
                  const isCurrentEditing = editingId === recordId;

                  return (
                    <tr
                      key={recordId}
                      style={{
                        ...styles.tr,
                        backgroundColor: isCurrentEditing ? "#f0f9ff" : "transparent",
                      }}
                    >
                      {/* Payment Date */}
                      <td style={styles.td}>
                        <div style={styles.dateCell}>
                          <Calendar size={13} color="#64748b" />
                          <span>
                            {item.paymentDate
                              ? new Date(item.paymentDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      </td>

                      {/* Truck Reg No */}
                      <td style={styles.td}>
                        <span style={styles.truckBadge}>
                          <Truck size={13} color="#0369a1" />
                          <strong>{item.truckRegNo || item.truckNo || "-"}</strong>
                        </span>
                      </td>

                      {/* Maintenance Type */}
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>
                          <Wrench size={12} color="#0f766e" />
                          <span>{item.maintenanceType || item.serviceType || "Maintenance"}</span>
                        </span>
                      </td>

                      {/* Maintenance Cost */}
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <span style={styles.costText}>
                          ₹ {Number(item.maintenanceCost ?? item.cost ?? 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Notes / Remarks */}
                      <td style={{ ...styles.td, color: item.notes ? "#334155" : "#94a3b8" }}>
                        {item.notes || "-"}
                      </td>

                      {/* Actions */}
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <div style={styles.actionButtonGroup}>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            style={styles.editActionBtn}
                            title="Edit Record"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(recordId)}
                            style={styles.deleteActionBtn}
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* TABLE SUMMARY FOOTER */}
              <tfoot>
                <tr style={styles.tfootRow}>
                  <td colSpan={3} style={styles.tfootLabel}>
                    Total ({filteredRecords.length} records):
                  </td>
                  <td style={{ ...styles.tfootValue, textAlign: "right" }}>
                    ₹ {filteredTotalCost.toLocaleString("en-IN")}
                  </td>
                  <td colSpan={2} style={styles.tfootSub}>
                    {truckFilter !== "All" ? `Filtered by ${truckFilter}` : "All Vehicles"}
                  </td>
                </tr>
              </tfoot>
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
    gap: "24px",
    paddingBottom: "40px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleIconBadge: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    backgroundColor: "#e0f2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "3px",
    margin: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  dateBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  iconPill: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    marginTop: "4px",
  },
  statSubText: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  feedbackBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid",
    animation: "fadeIn 0.2s ease-in-out",
  },
  formCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  formCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
    flexWrap: "wrap",
    gap: "10px",
  },
  formHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  formIconContainer: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    backgroundColor: "#f0f9ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  formSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
    margin: 0,
  },
  cancelEditBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  formBody: {
    display: "flex",
    flexDirection: "column",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  inputWithIcon: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  iconInside: {
    position: "absolute",
    left: "12px",
    pointerEvents: "none",
  },
  inputPaddingLeft: {
    width: "100%",
    padding: "10px 12px 10px 36px",
    borderRadius: "7px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "7px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 18px",
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    color: "#475569",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 22px",
    backgroundColor: "#0284c7",
    border: "none",
    borderRadius: "7px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(2, 132, 199, 0.25)",
  },
  updateBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 22px",
    backgroundColor: "#059669",
    border: "none",
    borderRadius: "7px",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(5, 150, 105, 0.25)",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  tableToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  tableTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  tableSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
    margin: 0,
  },
  toolbarActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    minWidth: "220px",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    fontSize: "13px",
    color: "#1e293b",
    width: "100%",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "2px 6px 2px 10px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
  },
  select: {
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    padding: "6px 4px",
    cursor: "pointer",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#0f172a",
    cursor: "pointer",
  },
  tableResponsive: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "13px",
  },
  th: {
    padding: "12px 14px",
    borderBottom: "2px solid #e2e8f0",
    color: "#475569",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    backgroundColor: "#f8fafc",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.15s ease",
  },
  td: {
    padding: "14px",
    color: "#334155",
    verticalAlign: "middle",
  },
  dateCell: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "500",
  },
  truckBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "6px",
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    color: "#0369a1",
    fontSize: "12px",
    fontWeight: "600",
  },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "6px",
    backgroundColor: "#f0fdfa",
    border: "1px solid #99f6e4",
    color: "#0f766e",
    fontSize: "12px",
    fontWeight: "600",
  },
  costText: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0f172a",
  },
  actionButtonGroup: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  editActionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    color: "#0284c7",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  deleteActionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    border: "1px solid #fecaca",
    backgroundColor: "#ffffff",
    color: "#dc2626",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  tfootRow: {
    backgroundColor: "#f8fafc",
    borderTop: "2px solid #e2e8f0",
  },
  tfootLabel: {
    padding: "14px",
    fontWeight: "700",
    color: "#1e293b",
  },
  tfootValue: {
    padding: "14px",
    fontWeight: "800",
    fontSize: "15px",
    color: "#dc2626",
  },
  tfootSub: {
    padding: "14px",
    color: "#64748b",
    fontSize: "12px",
    fontStyle: "italic",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 16px",
    textAlign: "center",
  },
  emptyIconPill: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
  },
  emptyStateTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#334155",
    margin: "0 0 6px 0",
  },
  emptyStateText: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    maxWidth: "360px",
  },
  loadingSpinner: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTopColor: "#0284c7",
    animation: "spin 0.8s linear infinite",
  },
};