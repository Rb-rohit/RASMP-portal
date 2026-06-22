import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  ShieldAlert 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const navigate = useNavigate();

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('customer'); // 'customer' | 'supplier'

  // Company dossier (visible when regRole === 'supplier')
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [location, setLocation] = useState('');
  const [primaryCategories, setPrimaryCategories] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const startRegistrationFlow = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setErrorMessage('Required: Identity headers, secure email, and contact phone.');
      return;
    }

    // Email duplication check
    const registeredUsers = JSON.parse(localStorage.getItem('rasmp_users') || '[]');
    const emailExists = registeredUsers.some(u => u.email.toLowerCase() === regEmail.toLowerCase()) || 
                          ['priyaallin@example.com', 'fastpartscorporate@example.com', 'chiefadmin@example.com'].includes(regEmail.toLowerCase());

    if (emailExists) {
      setErrorMessage('Registration Conflict: This credentials set is already active in database.');
      return;
    }

    // Gather user data
    const tempUser = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regRole,
      verified: false, // will be verified after OTP input
      joinedDate: new Date().toISOString().split('T')[0],
      initials: regName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'US',
      // If supplier, we add company details
      companyName: regRole === 'supplier' ? companyName || regName + ' Corp' : undefined,
      gstin: regRole === 'supplier' ? gstin || '27AABCF' + Math.floor(1000 + Math.random()*9000) + 'G1Z1' : undefined,
      location: regRole === 'supplier' ? location || 'Mumbai, MH' : 'Anywhere',
      primaryCategories: regRole === 'supplier' ? primaryCategories || 'Industrial parts' : undefined
    };

    // Generate random OTP
    const otp = generateRandomOtp();

    // Store in SessionStorage for route isolation persistence
    sessionStorage.setItem('rasmp_temp_register_user', JSON.stringify(tempUser));
    sessionStorage.setItem('rasmp_temp_register_otp', otp);

    // Save and dispatch instant SMS Simulation Notification event
    const simMsg = `🔑 SMS SIMULATION [RASMP Auth-Sentry]: Your verification code is ${otp}. Use standard code 123456 to pass instantly as well.`;
    sessionStorage.setItem('rasmp_sms_sim_msg', simMsg);

    // Navigate to OTP route
    navigate('/otp');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-1.5 pb-1 select-none">
        <button 
          onClick={() => navigate('/login')} 
          className="p-1 rounded text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-800 border-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-base font-display font-medium text-white">Create RASMP Dossier</h3>
          <p className="text-[10px] text-slate-400">Initiate compliance verified onboarding</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-450 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={startRegistrationFlow} className="space-y-3.5 text-xs text-slate-200">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="Suresh Mehta"
                className="w-full bg-slate-950/80 border border-slate-880 border-slate-800 rounded-lg p-2.5 pl-8 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-700 font-semibold"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Mobile No</label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="tel" 
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 pl-8 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-750 font-semibold"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Email (Username ID)</label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="email" 
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              placeholder="suresh.mehta@corporation.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 pl-8 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-700 font-semibold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-500" />
              <input 
                type="password" 
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="Securepassword"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 pl-8 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Platform Role</label>
            <select 
              value={regRole}
              onChange={e => setRegRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-600 font-bold"
            >
              <option value="customer">Buyer / Customer</option>
              <option value="supplier">Seller / Supplier</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC SUPPLIER INDUSTRIAL RECORD DOSSIER */}
        {regRole === 'supplier' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-950/50 p-3 rounded-lg border border-slate-850 space-y-2.5 pt-3"
          >
            <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1 select-none">
              <FileText className="w-3 h-3" />
              <span>Supplier Corporate Records dossier</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Company name</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Frictionless Industries"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">National GSTIN ID</label>
                <input 
                  type="text" 
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                  placeholder="27AABCF1342M1Z0"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Base Headquarters</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Hyderabad, Telangana"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase">Main Category</label>
                <input 
                  type="text" 
                  value={primaryCategories}
                  onChange={e => setPrimaryCategories(e.target.value)}
                  placeholder="Industrial & manufacturing"
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white font-semibold"
                />
              </div>
            </div>
          </motion.div>
        )}

        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-lg border-0 transition-colors flex items-center justify-center gap-1 cursor-pointer text-xs"
        >
          <span>MINT SMS MFA CHALLENGE</span>
          <ArrowRight className="w-4 h-4 text-indigo-300" />
        </button>
      </form>

      <div className="border-t border-slate-800/80 pt-3 text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link 
          to="/login"
          className="text-indigo-400 font-bold hover:underline"
        >
          Authenticate Now
        </Link>
      </div>
    </motion.div>
  );
}
