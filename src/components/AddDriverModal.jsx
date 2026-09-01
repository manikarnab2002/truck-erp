import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  ShieldCheck,
  Calendar,
  Truck,
} from "lucide-react";

export default function AddDriverModal({
  isOpen,
  onClose,
  onAddDriver,
  truckOptions = [],
}) {
  const initialFormState = {
    name: "",
    phone: "",
    assignedTruck: "Unassigned",
    status: "Available",
  };

  const [formData, setFormData] =
    useState(initialFormState);

  const [isSaving, setIsSaving] =
    useState(false);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.phone.trim()
    ) {
      alert(
        "Please fill in Full Name and Phone Number."
      );

      return;
    }

    try {
      setIsSaving(true);

      /*
       * IMPORTANT:
       * Do NOT create driver ID here.
       *
       * The backend will create:
       * DRV-xxxxxxxx
       */

      const success =
        await onAddDriver(formData);

      /*
       * Only reset/close if backend
       * successfully saved the driver.
       */

      if (success) {
        setFormData(initialFormState);
        onClose();
      }

    } catch (error) {

      console.error(
        "Add driver error:",
        error
      );

      alert(
        "Unable to save driver."
      );

    } finally {

      setIsSaving(false);

    }
  };

  const handleClose = () => {

    if (isSaving) {
      return;
    }

    setFormData(initialFormState);

    onClose();
  };

  return (
    <div style={styles.overlay}>

      <div style={styles.modal}>

        {/* HEADER */}

        <div style={styles.header}>

          <div style={styles.headerTitle}>

            <User
              size={20}
              color="#1e293b"
            />

            <h2 style={styles.title}>
              Register New Driver
            </h2>

          </div>

          <button
            type="button"
            style={styles.closeBtn}
            onClick={handleClose}
            disabled={isSaving}
          >

            <X
              size={18}
              color="#64748b"
            />

          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          <div style={styles.formGrid}>

            {/* NAME */}

            <div style={styles.field}>

              <label style={styles.label}>
                Full Name *
              </label>

              <input
                type="text"
                name="name"
                placeholder="Driver Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />

            </div>


            {/* PHONE */}

            <div style={styles.field}>

              <label style={styles.label}>
                Phone Number
              </label>

              <div
                style={
                  styles.iconInputWrapper
                }
              >

                <Phone
                  size={16}
                  color="#64748b"
                  style={styles.inputIcon}
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    paddingLeft: "32px",
                  }}
                />

              </div>

            </div>


            

            


            {/* ASSIGNED TRUCK */}

            <div style={styles.field}>

              <label style={styles.label}>
                Assigned Truck Registration No.
              </label>

              <div
                style={
                  styles.iconInputWrapper
                }
              >

                <Truck
                  size={16}
                  color="#64748b"
                  style={styles.inputIcon}
                />

                <select
                  name="assignedTruck"
                  value={formData.assignedTruck}
                  onChange={handleChange}
                  style={{
                    ...styles.select,
                    paddingLeft: "32px",
                  }}
                >

                  <option value="Unassigned">
                    Unassigned
                  </option>

                  {truckOptions.map((truckNo) => (
                    <option key={truckNo} value={truckNo}>
                      {truckNo}
                    </option>
                  ))}

                </select>

              </div>

            </div>


            {/* STATUS */}

            <div style={styles.field}>

              <label style={styles.label}>
                Driver Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >

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


          {/* FOOTER */}

          <div style={styles.footer}>

            <button
              type="button"
              style={styles.cancelBtn}
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: isSaving ? 0.7 : 1,
              }}
              disabled={isSaving}
            >

              {isSaving
                ? "Saving..."
                : "Save Driver"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


const styles = {

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor:
      "rgba(15, 23, 42, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    width: "520px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom:
      "1px solid #e2e8f0",
  },

  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  title: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },

  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },

  form: {
    padding: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "14px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
  },

  input: {
    padding: "8px 12px",
    fontSize: "13px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  select: {
    padding: "8px 12px",
    fontSize: "13px",
    border:
      "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    color: "#334155",
  },

  iconInputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "10px",
    pointerEvents: "none",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop:
      "1px solid #f1f5f9",
  },

  cancelBtn: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  submitBtn: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#1e293b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

};