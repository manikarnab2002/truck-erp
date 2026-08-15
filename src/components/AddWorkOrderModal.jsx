import React, { useState } from 'react';
import { X, Wrench, Calendar, DollarSign, User, AlertTriangle } from 'lucide-react';

export default function AddWorkOrderModal({ isOpen, onClose, onAddWorkOrder, fleetList = [] }) {
  const initialFormState = {
    truckNo: '',
    serviceType: '',
    mechanic: '',
    priority: 'Medium',
    cost: '',
    startDate: '',
    status: 'Queued',
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.truckNo || !formData.serviceType) {
      alert('Please fill in required fields (Truck Number and Service Type).');
      return;
    }

    const newOrder = {
      id: `WO-${Math.floor(8000 + Math.random() * 1000)}`,
      ...formData,
      cost: formData.cost ? `₹${Number(formData.cost).toLocaleString('en-IN')}` : '₹0',
      mechanic: formData.mechanic || 'Unassigned',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
    };

    onAddWorkOrder(newOrder);
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Wrench size={20} color="#1e293b" />
            <h2 style={styles.title}>Create Work Order</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Truck Registration Number *</label>
              {fleetList.length > 0 ? (
                <select
                  name="truckNo"
                  value={formData.truckNo}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select Truck</option>
                  {fleetList.map((truck) => (
                    <option key={truck.id} value={truck.regNo}>
                      {truck.regNo} ({truck.model})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="truckNo"
                  placeholder="e.g. WB-19-AX-4021"
                  value={formData.truckNo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Service / Repair Type *</label>
              <input
                type="text"
                name="serviceType"
                placeholder="e.g. Engine Overhaul, Brake Repair"
                value={formData.serviceType}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Assigned Mechanic</label>
              <div style={styles.iconInputWrapper}>
                <User size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="text"
                  name="mechanic"
                  placeholder="Mechanic Name"
                  value={formData.mechanic}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Priority Level</label>
              <div style={styles.iconInputWrapper}>
                <AlertTriangle size={16} color="#64748b" style={styles.inputIcon} />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{ ...styles.select, paddingLeft: '32px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Estimated Cost (₹)</label>
              <div style={styles.iconInputWrapper}>
                <DollarSign size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="number"
                  name="cost"
                  placeholder="e.g. 15000"
                  value={formData.cost}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Start Date</label>
              <div style={styles.iconInputWrapper}>
                <Calendar size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.fieldFull}>
              <label style={styles.label}>Initial Service Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Queued">Queued (Awaiting workshop slot)</option>
                <option value="In Progress">In Progress (Work started)</option>
                <option value="Pending Parts">Pending Parts (Waiting for spares)</option>
                <option value="Completed">Completed (Work finished)</option>
              </select>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Save Work Order
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