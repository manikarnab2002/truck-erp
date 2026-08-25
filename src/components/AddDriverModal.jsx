import React, { useState } from 'react';
import { X, User, Phone, ShieldCheck, Calendar, Truck } from 'lucide-react';

export default function AddDriverModal({ isOpen, onClose, onAddDriver }) {
  const initialFormState = {
    name: '',
    phone: '',
    licenseNo: '',
    licenseExpiry: '',
    experience: '3 Yrs',
    assignedTruck: 'Unassigned',
    status: 'Available',
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.licenseNo) {
      alert('Please fill in required fields (Full Name and License Number).');
      return;
    }

    const newDriver = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      ...formData,
    };

    onAddDriver(newDriver);
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <User size={20} color="#1e293b" />
            <h2 style={styles.title}>Register New Driver</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name *</label>
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

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.iconInputWrapper}>
                <Phone size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Driving License No *</label>
              <div style={styles.iconInputWrapper}>
                <ShieldCheck size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="text"
                  name="licenseNo"
                  placeholder="e.g. WB-0420180012"
                  value={formData.licenseNo}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Save Driver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    width: '520px',
    maxWidth: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  form: {
    padding: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldFull: {
    gridColumn: 'span 2',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '8px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  iconInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '10px',
    pointerEvents: 'none',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#1e293b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};