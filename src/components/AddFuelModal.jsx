import React, { useState } from 'react';
import { X, Fuel, DollarSign, Calendar, Gauge, User, MapPin } from 'lucide-react';

export default function AddFuelModal({ isOpen, onClose, onAddFuelLog }) {
  const initialFormState = {
    truckNo: '',
    driver: '',
    liters: '',
    totalCost: '',
    odometer: '',
    mileage: '4.0 km/L',
    date: '',
    station: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.truckNo || !formData.liters || !formData.totalCost) {
      alert('Please fill in required fields (Truck Registration, Liters, and Total Cost).');
      return;
    }

    const newLog = {
      id: `FL-${Math.floor(900 + Math.random() * 100)}`,
      ...formData,
      liters: `${formData.liters} L`,
      totalCost: `₹${Number(formData.totalCost).toLocaleString('en-IN')}`,
      odometer: formData.odometer ? `${Number(formData.odometer).toLocaleString()} km` : 'N/A',
      date: formData.date || new Date().toISOString().split('T')[0],
      station: formData.station || 'Local Station',
      driver: formData.driver || 'Unassigned',
    };

    onAddFuelLog(newLog);
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Fuel size={20} color="#1e293b" />
            <h2 style={styles.title}>Record Fuel Entry</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Truck Registration No *</label>
              <input
                type="text"
                name="truckNo"
                placeholder="e.g. WB-19-AX-4021"
                value={formData.truckNo}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Driver Name</label>
              <div style={styles.iconInputWrapper}>
                <User size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="text"
                  name="driver"
                  placeholder="Driver Name"
                  value={formData.driver}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Fuel Quantity (Liters) *</label>
              <div style={styles.iconInputWrapper}>
                <Fuel size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="number"
                  name="liters"
                  placeholder="e.g. 150"
                  value={formData.liters}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Total Amount Paid (₹) *</label>
              <div style={styles.iconInputWrapper}>
                <DollarSign size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="number"
                  name="totalCost"
                  placeholder="e.g. 13500"
                  value={formData.totalCost}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Current Odometer (km)</label>
              <div style={styles.iconInputWrapper}>
                <Gauge size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="number"
                  name="odometer"
                  placeholder="e.g. 142500"
                  value={formData.odometer}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Refill Date</label>
              <div style={styles.iconInputWrapper}>
                <Calendar size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                />
              </div>
            </div>

            <div style={styles.fieldFull}>
              <label style={styles.label}>Filling Station / Pump Location</label>
              <div style={styles.iconInputWrapper}>
                <MapPin size={16} color="#64748b" style={styles.inputIcon} />
                <input
                  type="text"
                  name="station"
                  placeholder="e.g. HP Petrol Pump, NH-16"
                  value={formData.station}
                  onChange={handleChange}
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
              Save Fuel Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#ffffff', borderRadius: '10px', width: '520px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontSize: '17px', fontWeight: '700', color: '#0f172a' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  form: { padding: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldFull: { gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#475569' },
  input: { padding: '8px 12px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  iconInputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '10px', pointerEvents: 'none' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  cancelBtn: { padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  submitBtn: { padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#ffffff', backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};