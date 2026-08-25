import React from "react";

export default function FormGroup({ label, required, children, fullWidth = false }) {
  return (
    <div style={{ ...styles.formGroup, ...(fullWidth ? styles.fullWidth : {}) }}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      {children}
    </div>
  );
}

const styles = {
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  label: {
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
  },
  required: {
    color: "#dc2626",
    marginLeft: "3px",
  },
};
