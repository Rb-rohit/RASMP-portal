import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { handleLoginSuccess } = useApp();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both registered email and security password.');
      return;
    }

    // Check localStorage for registered accounts
    const registeredUsers = JSON.parse(localStorage.getItem('rasmp_users') || '[]');
    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

    if (matchedUser && loginPassword === (matchedUser.password || 'password')) {
      setSuccessMessage(`Access Granted. Authenticating session...`);
      setTimeout(() => {
        handleLoginSuccess(matchedUser, () => {
          navigate('/dashboard');
        });
        setSuccessMessage('');
      }, 1000);
    } else {
      setErrorMessage('Access Denied: Invalid cryptographic match or credentials.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      <div className="space-y-1.5 text-center">
        <h3 className="text-lg font-display font-medium text-white">Welcome back to RASMP</h3>
        <p className="text-xs text-slate-400">Lock into your secure identity portal profile</p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-950 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Security Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input 
              type="email" 
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="corporate@company.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-600 font-semibold"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Crypto Password</label>
            <span className="text-[10px] font-semibold text-slate-500">use: password</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input 
              type="password" 
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-650"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white font-bold p-3 rounded-xl border-0 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-650/40 text-xs"
        >
          <span>Unlock Client Area</span>
          <ArrowRight className="w-4 h-4 text-indigo-300" />
        </button>
      </form>

      <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
        <span className="text-slate-500">New exchange applicant?</span>
        <Link 
          to="/register"
          className="text-indigo-400 font-bold hover:underline"
        >
          Register Corp
        </Link>
      </div>

    </motion.div>
  );
}
