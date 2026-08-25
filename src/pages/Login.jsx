import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ShieldCheck, RefreshCw, LogIn } from 'lucide-react';

const VALID_USER_ID = 'saikat@gmail.com';
const VALID_PASSWORD = 'Saikat@2002#';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPTS_KEY = 'truckErpLoginAttempts';
const SESSION_KEY = 'truckErpSession';

const createCaptchaCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(createCaptchaCode);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(() =>
    Number(sessionStorage.getItem(LOGIN_ATTEMPTS_KEY) || 0)
  );
  const navigate = useNavigate();

  // Generate a random 6-character alphanumeric CAPTCHA
  const generateCaptcha = () => {
    setCaptchaCode(createCaptchaCode());
    setCaptchaInput('');
    setErrorMessage('');
  };

  const registerFailedAttempt = () => {
    const attempts = failedAttempts + 1;
    sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, String(attempts));
    setFailedAttempts(attempts);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      setErrorMessage('Too many failed attempts. Login is temporarily blocked.');
      return;
    }

    if (!userId.trim()) {
      setErrorMessage('Please enter your User ID.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (captchaInput !== captchaCode) {
      setErrorMessage('Invalid CAPTCHA code. Please try again.');
      registerFailedAttempt();
      generateCaptcha();
      return;
    }

    if (
      userId.trim().toLowerCase() !== VALID_USER_ID ||
      password !== VALID_PASSWORD
    ) {
      registerFailedAttempt();
      setErrorMessage('Invalid User ID or password.');
      generateCaptcha();
      return;
    }

    sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId: VALID_USER_ID })
    );
    navigate('/dashboard');
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.glassCard}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>TruckERP</div>
          <h2 style={styles.title}>System Login</h2>
          <p style={styles.subtitle}>Enter credentials to access administrative dashboard</p>
        </div>

        {errorMessage && <div style={styles.errorAlert}>{errorMessage}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>User ID / Username</label>
            <div style={styles.inputWrapper}>
              <User size={16} color="#94a3b8" style={styles.icon} />
              <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} color="#94a3b8" style={styles.icon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Verification CAPTCHA</label>
            <div style={styles.captchaRow}>
              <div style={styles.captchaDisplay}>
                <span style={styles.captchaText}>{captchaCode}</span>
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                style={styles.refreshBtn}
                title="Refresh CAPTCHA"
              >
                <RefreshCw size={16} color="#64748b" />
              </button>
            </div>
            <div style={{ ...styles.inputWrapper, marginTop: '8px' }}>
              <ShieldCheck size={16} color="#94a3b8" style={styles.icon} />
              <input
                type="text"
                placeholder="Type CAPTCHA code"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" style={styles.transparentBtn}>
            <LogIn size={16} />
            <span>Sign In to Dashboard</span>
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  glassCard: {
    width: '380px',
    maxWidth: '90%',
    padding: '32px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#38bdf8',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    fontSize: '13px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  captchaRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  captchaDisplay: {
    flex: 1,
    height: '38px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    border: '1px dashed rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
  },
  captchaText: {
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '4px',
    color: '#38bdf8',
    fontFamily: 'monospace',
    textDecoration: 'line-through',
  },
  refreshBtn: {
    height: '38px',
    width: '38px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  transparentBtn: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};