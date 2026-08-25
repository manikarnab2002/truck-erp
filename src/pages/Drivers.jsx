import React, { useEffect, useState } from "react";
import AddDriverModal from "../components/AddDriverModal";

import {
  Plus,
  Search,
  Filter,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Truck,
} from "lucide-react";

export default function Drivers() {

  // ==========================================
  // STATE
  // ==========================================

  const [drivers, setDrivers] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);


  // ==========================================
  // LOAD DRIVERS WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    loadDrivers();

  }, []);


  // ==========================================
  // GET DRIVERS FROM MONGODB
  // ==========================================

  const loadDrivers = async () => {

    try {

      setLoading(true);

      const response = await fetch("http://localhost:5000/api/drivers")

      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to load drivers."
        );

      }


      setDrivers(data);

    } catch (error) {

      console.error(
        "Load drivers error:",
        error
      );

      alert(
        "Unable to load drivers. Please check your backend and MongoDB connection."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // ADD DRIVER
  // Called from AddDriverModal
  // ==========================================

  const handleAddDriver =
    async (newDriver) => {

      try {

        const response = await fetch(
          "http://localhost:5000/api/drivers",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(newDriver),
          }
        );


        const result =
          await response.json();


        if (!response.ok) {

          alert(
            result.message ||
            "Failed to add driver."
          );

          return false;

        }


        // Add newly created driver
        // at the beginning of table

        setDrivers((prev) => [

          result.data,

          ...prev,

        ]);


        return true;


      } catch (error) {

        console.error(
          "Add driver error:",
          error
        );

        alert(
          "Unable to connect to the server."
        );

        return false;

      }

    };


  // ==========================================
  // DELETE DRIVER
  // ==========================================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this driver?"
        );


      if (!confirmDelete) {

        return;

      }


      try {

        setDeletingId(id);


        const response =
          await fetch(
            `http://localhost:5000/api/drivers?id=${encodeURIComponent(id)}`,
            {
              method: "DELETE",
            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          alert(
            result.message ||
            "Failed to delete driver."
          );

          return;

        }


        // Remove driver from React state

        setDrivers((prev) =>
          prev.filter(
            (driver) =>
              driver.id !== id
          )
        );


      } catch (error) {

        console.error(
          "Delete driver error:",
          error
        );

        alert(
          "Unable to delete driver."
        );

      } finally {

        setDeletingId(null);

      }

    };


  // ==========================================
  // SEARCH + STATUS FILTER
  // ==========================================

  const filteredDrivers =
    drivers.filter((driver) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      const matchesSearch =

        (driver.id || "")
          .toLowerCase()
          .includes(search)

        ||

        (driver.name || "")
          .toLowerCase()
          .includes(search)

        ||

        (driver.licenseNo || "")
          .toLowerCase()
          .includes(search)

        ||

        (driver.assignedTruck || "")
          .toLowerCase()
          .includes(search)

        ||

        (driver.phone || "")
          .toLowerCase()
          .includes(search);


      const matchesStatus =
        statusFilter === "All" ||
        driver.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // ==========================================
  // STATUS BADGE
  // ==========================================

  const getStatusBadge =
    (status) => {

      switch (status) {

        case "On Duty":

          return {
            bg: "#dcfce7",
            text: "#15803d",
            icon:
              <ShieldCheck size={12} />,
          };


        case "Available":

          return {
            bg: "#dbeafe",
            text: "#1e40af",
            icon:
              <Truck size={12} />,
          };


        case "On Leave":

          return {
            bg: "#fef3c7",
            text: "#b45309",
            icon: null,
          };


        case "Expired License":

          return {
            bg: "#fee2e2",
            text: "#b91c1c",
            icon:
              <AlertTriangle size={12} />,
          };


        default:

          return {
            bg: "#f1f5f9",
            text: "#475569",
            icon: null,
          };

      }

    };


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div style={styles.container}>

      {/* ======================================
          HEADER
      ====================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Driver Directory
          </h1>

          <p style={styles.subtitle}>
            Manage driver profiles, heavy
            vehicle licenses, and truck
            assignments.
          </p>

        </div>


        <button
          style={styles.primaryBtn}
          onClick={() =>
            setIsModalOpen(true)
          }
        >

          <Plus size={16} />

          <span>
            Add New Driver
          </span>

        </button>

      </div>


      {/* ======================================
          ADD DRIVER MODAL
      ====================================== */}

      <AddDriverModal

        isOpen={isModalOpen}

        onClose={() =>
          setIsModalOpen(false)
        }

        onAddDriver={
          handleAddDriver
        }

      />


      {/* ======================================
          SEARCH + FILTER
      ====================================== */}

      <div style={styles.filterCard}>

        <div style={styles.searchBox}>

          <Search
            size={16}
            color="#64748b"
          />

          <input
            type="text"
            placeholder="Search driver, phone, license or truck..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            style={styles.searchInput}
          />

        </div>


        <div style={styles.filterGroup}>

          <Filter
            size={15}
            color="#64748b"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={styles.select}
          >

            <option value="All">
              All Status
            </option>

            <option value="Available">
              Available
            </option>

            <option value="On Duty">
              On Duty
            </option>

            <option value="On Leave">
              On Leave
            </option>

            <option value="Expired License">
              Expired License
            </option>

          </select>

        </div>

      </div>


      {/* ======================================
          TABLE
      ====================================== */}

      <div style={styles.tableCard}>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                Driver ID
              </th>

              <th style={styles.th}>
                Full Name
              </th>

              <th style={styles.th}>
                Contact Number
              </th>

              <th style={styles.th}>
                License No
              </th>

              <th style={styles.th}>
                License Expiry
              </th>

              <th style={styles.th}>
                Assigned Truck
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

            {/* LOADING */}

            {loading ? (

              <tr>

                <td
                  colSpan="8"
                  style={
                    styles.emptyTd
                  }
                >

                  Loading drivers...

                </td>

              </tr>

            ) : filteredDrivers.length > 0 ? (

              /* DRIVER ROWS */

              filteredDrivers.map(
                (driver) => {

                  const statusBadge =
                    getStatusBadge(
                      driver.status
                    );


                  return (

                    <tr
                      key={
                        driver.id ||
                        driver._id
                      }
                      style={styles.tr}
                    >

                      {/* DRIVER ID */}

                      <td style={styles.td}>

                        <strong>
                          {driver.id}
                        </strong>

                      </td>


                      {/* NAME */}

                      <td style={styles.td}>

                        <strong
                          style={
                            styles.driverName
                          }
                        >
                          {driver.name}
                        </strong>

                      </td>


                      {/* PHONE */}

                      <td style={styles.td}>

                        <span
                          style={
                            styles.phoneWrapper
                          }
                        >

                          <Phone
                            size={12}
                            color="#64748b"
                          />

                          {driver.phone ||
                            "-"}

                        </span>

                      </td>


                      {/* LICENSE */}

                      <td style={styles.td}>

                        {driver.licenseNo ||
                          "-"}

                      </td>


                      {/* LICENSE EXPIRY */}

                      <td style={styles.td}>

                        {driver.licenseExpiry
                          ? new Date(
                              driver.licenseExpiry
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}

                      </td>


                      {/* ASSIGNED TRUCK */}

                      <td style={styles.td}>

                        <span
                          style={
                            styles.truckWrapper
                          }
                        >

                          <Truck
                            size={13}
                            color="#64748b"
                          />

                          {driver.assignedTruck ||
                            "Unassigned"}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td style={styles.td}>

                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor:
                              statusBadge.bg,
                            color:
                              statusBadge.text,
                          }}
                        >

                          {statusBadge.icon}

                          {driver.status ||
                            "Available"}

                        </span>

                      </td>


                      {/* DELETE */}

                      <td style={styles.td}>

                        <button
                          type="button"
                          style={{
                            ...styles.actionBtn,

                            color:
                              deletingId ===
                              driver.id
                                ? "#94a3b8"
                                : "#ef4444",

                            fontWeight: "600",

                            cursor:
                              deletingId ===
                              driver.id
                                ? "not-allowed"
                                : "pointer",
                          }}
                          onClick={() =>
                            handleDelete(
                              driver.id
                            )
                          }
                          disabled={
                            deletingId ===
                            driver.id
                          }
                        >

                          {deletingId ===
                          driver.id
                            ? "Deleting..."
                            : "Delete"}

                        </button>

                      </td>

                    </tr>

                  );

                }
              )

            ) : (

              /* NO RECORD */

              <tr>

                <td
                  colSpan="8"
                  style={
                    styles.emptyTd
                  }
                >

                  No matching driver
                  records found.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================
          RECORD COUNT
      ====================================== */}

      {!loading && (

        <div style={styles.recordInfo}>

          Showing{" "}

          <strong>
            {filteredDrivers.length}
          </strong>{" "}

          of{" "}

          <strong>
            {drivers.length}
          </strong>{" "}

          drivers

        </div>

      )}

    </div>

  );
}


/* ==================================================
   STYLES
================================================== */

const styles = {

  container: {

    display: "flex",

    flexDirection: "column",

    gap: "20px",

  },


  header: {

    display: "flex",

    justifyContent:
      "space-between",

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

    marginTop: "4px",

  },


  primaryBtn: {

    display: "flex",

    alignItems: "center",

    gap: "8px",

    backgroundColor: "#1e293b",

    color: "#ffffff",

    padding: "10px 16px",

    borderRadius: "6px",

    border: "none",

    fontWeight: "600",

    fontSize: "13px",

    cursor: "pointer",

    whiteSpace: "nowrap",

  },


  filterCard: {

    backgroundColor: "#ffffff",

    border:
      "1px solid #e2e8f0",

    borderRadius: "8px",

    padding: "12px 16px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    gap: "16px",

  },


  searchBox: {

    display: "flex",

    alignItems: "center",

    gap: "8px",

    backgroundColor:
      "#f8fafc",

    border:
      "1px solid #e2e8f0",

    borderRadius: "6px",

    padding: "8px 12px",

    flex: 1,

  },


  searchInput: {

    border: "none",

    outline: "none",

    backgroundColor:
      "transparent",

    width: "100%",

    fontSize: "13px",

  },


  filterGroup: {

    display: "flex",

    alignItems: "center",

    gap: "8px",

  },


  select: {

    padding: "8px 12px",

    borderRadius: "6px",

    border:
      "1px solid #e2e8f0",

    backgroundColor:
      "#ffffff",

    fontSize: "13px",

    color: "#334155",

    outline: "none",

  },


  tableCard: {

    backgroundColor: "#ffffff",

    border:
      "1px solid #e2e8f0",

    borderRadius: "8px",

    padding: "16px",

    overflowX: "auto",

  },


  table: {

    width: "100%",

    minWidth: "900px",

    borderCollapse:
      "collapse",

    textAlign: "left",

    fontSize: "13px",

  },


  th: {

    padding:
      "10px 12px",

    borderBottom:
      "1px solid #e2e8f0",

    backgroundColor:
      "#f8fafc",

    color: "#64748b",

    fontWeight: "600",

    whiteSpace: "nowrap",

  },


  tr: {

    borderBottom:
      "1px solid #f1f5f9",

  },


  td: {

    padding: "12px",

    color: "#334155",

    verticalAlign:
      "middle",

  },


  driverName: {

    color: "#0f172a",

  },


  phoneWrapper: {

    display: "inline-flex",

    alignItems: "center",

    gap: "6px",

  },


  truckWrapper: {

    display: "inline-flex",

    alignItems: "center",

    gap: "6px",

  },


  badge: {

    display: "inline-flex",

    alignItems: "center",

    gap: "5px",

    padding:
      "4px 8px",

    borderRadius: "5px",

    fontSize: "11px",

    fontWeight: "600",

    whiteSpace: "nowrap",

  },


  actionBtn: {

    background: "none",

    border: "none",

    cursor: "pointer",

    padding: "4px",

    borderRadius: "4px",

  },


  emptyTd: {

    padding: "30px",

    textAlign: "center",

    color: "#64748b",

  },


  recordInfo: {

    fontSize: "12px",

    color: "#64748b",

    textAlign: "right",

  },

};