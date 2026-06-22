import { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ArrowRight,
  CheckCircle,
  FileText,
  ArrowLeft,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

export default function AuthScreen({ onLoginSuccess }) {
  // authMode can be: 'login' | 'register' | 'otp'
  const [authMode, setAuthMode] = useState('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
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
  const [businessLicense, setBusinessLicense] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);
  
  // OTP Verification state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [registeredUserTemp, setRegisteredUserTemp] = useState(null);
  const [otpTimer, setOtpTimer] = useState(60);
  const [smsNotificationMsg, setSmsNotificationMsg] = useState('');
  
  // General feedback messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-focus OTP fields
  useEffect(() => {
    let interval;
    if (authMode === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, otpTimer]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please provide both registered email and security password.');
      return;
    }

    try {
      const session = await api.login({ email: loginEmail, password: loginPassword });
      setSuccessMessage(`Access Granted. Authenticating session...`);
      setTimeout(() => {
        onLoginSuccess(session);
        setSuccessMessage('');
      }, 1000);
    } catch (error) {
      setErrorMessage(error.message || 'Access Denied: Invalid cryptographic match or credentials.');
    }
  };

  const generateRandomOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const fileToDocument = (file, documentType, label) => new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve({
      documentType,
      label,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      dataUrl: reader.result,
      uploadedAt: new Date().toISOString()
    });
    reader.onerror = () => reject(new Error(`Unable to read ${label}.`));
    reader.readAsDataURL(file);
  });

  const startRegistrationFlow = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setErrorMessage('Required: Identity headers, secure email, and contact phone.');
      return;
    }

    if (regRole === 'supplier' && (!businessLicense || !identityProof)) {
      setErrorMessage('Supplier onboarding requires both business license and identity proof uploads.');
      return;
    }

    try {
      const { exists } = await api.checkEmail(regEmail);
      if (exists) {
        setErrorMessage('Registration Conflict: This credentials set is already active in database.');
        return;
      }
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }

    let supplierDocuments = [];
    if (regRole === 'supplier') {
      try {
        supplierDocuments = (await Promise.all([
          fileToDocument(businessLicense, 'businessLicense', 'Business license'),
          fileToDocument(identityProof, 'identityProof', 'Identity proof')
        ])).filter(Boolean);
      } catch (error) {
        setErrorMessage(error.message);
        return;
      }
    }

    // Gather user data
    const tempUser = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regRole,
      verified: true, // will be verified after OTP input
      joinedDate: new Date().toISOString().split('T')[0],
      initials: regName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'US',
      // If supplier, we add company details
      companyName: regRole === 'supplier' ? companyName || regName + ' Corp' : undefined,
      gstin: regRole === 'supplier' ? gstin || '27AABCF' + Math.floor(1000 + Math.random()*9000) + 'G1Z1' : undefined,
      location: regRole === 'supplier' ? location || 'Nagpur, MH' : 'Anywhere',
      primaryCategories: regRole === 'supplier' ? primaryCategories || 'Industrial parts' : undefined,
      supplierDocuments: regRole === 'supplier' ? supplierDocuments : undefined
    };

    setRegisteredUserTemp(tempUser);
    
    // Generate simulated OTP
    const otp = generateRandomOtp();
    setOtpTimer(60);
    setOtpInput('');
    setAuthMode('otp');

    // Trigger instant Simulation Toast Notification
    const simMsg = `🔑 SMS SIMULATION [RASMP Auth-Sentry]: Your verification code is ${otp}. Do not disclose this pin.`;
    setSmsNotificationMsg(simMsg);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpInput === generatedOtp || otpInput === '123456') { // Allow standard fast login fallback for convenience
      const updatedUser = { ...registeredUserTemp, verified: true };
      
      setSuccessMessage('Multi-factor Authentication approved! Secure token minted.');

      try {
        const session = await api.register(updatedUser);
        setSmsNotificationMsg('');
        setTimeout(() => {
          onLoginSuccess(session);
          setSuccessMessage('');
        }, 800);
      } catch (error) {
        setSuccessMessage('');
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage('Security code mismatch. Please review verification pin.');
    }
  };

  const triggerResendOtp = () => {
    const otp = generateRandomOtp();
    setOtpTimer(60);
    setOtpInput('');
    const simMsg = `🔑 SMS SIMULATION [RASMP Auth-Sentry]: NEW verification code is ${otp}. Expires in 1 minute.`;
    setSmsNotificationMsg(simMsg);
    setSuccessMessage('Fresh SMS MFA challenge generated!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden" id="auth-root-screen">
      
      {/* Aesthetic ambient lighting decoration grids */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER LOGO */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-900/60 z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            {/* <Building2 className="w-4 h-4" /> */}
          </div>
          <div>
            <span className="font-display font-extrabold text-white tracking-widest text-sm block">RASMP</span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase">Identity Verification </span>
          </div>
        </div>
        
      </header>

      {/* MIDDLE - THREE COLUMN LAYOUT */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 z-10">

        {/* RIGHT COLUMN: CORE FORM BLOCK */}
        <div className="w-full lg:w-[460px] relative">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl w-full p-6 shadow-2xl relative backdrop-blur-lg">
            
            <AnimatePresence mode="wait">
              
              {/* VIEW 1: LOGIN */}
              {authMode === 'login' && (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5 text-center">
                    <h3 className="text-lg font-display font-medium text-white">LogIn</h3>
                    <p className="text-xs text-slate-400">Welcome to RASMP</p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
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
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="email" 
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-600 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Password</label>
                        <span className="text-[11px] font-semibold text-slate-500 hover:text-indigo-400 cursor-pointer">Enter Password</span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="password" 
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="password"
                          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 pl-9 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-650"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-indigo-600 text-white font-bold p-3 rounded-xl border-0 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-650/40 text-xs"
                    >
                      <span>Log In</span>
                      <ArrowRight className="w-4 h-4 text-indigo-200" />
                    </button>
                  </form>

                  <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
                    <span className="text-slate-500">New exchange applicant?</span>
                    <button 
                      onClick={() => setAuthMode('register')}
                      className="text-indigo-400 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Register 
                    </button>
                  </div>

                </motion.div>
              )}

              {/* VIEW 2: REGISTER */}
              {authMode === 'register' && (
                <motion.div 
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-1.5 pb-1 select-none">
                    <button 
                      onClick={() => setAuthMode('login')} 
                      className="p-1 rounded text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-800 border-0 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-base font-display font-medium text-white">Create RASMP Account</h3>
                      <p className="text-[10px] text-slate-400">Initiate compliance verified onboarding</p>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={startRegistrationFlow} className="space-y-3.5 text-xs">
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-500" />
                          <input 
                            type="text" 
                            value={regName}
                            onChange={e => setRegName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 pl-8 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-700 font-semibold"
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
                            placeholder="Mobile Number"
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
                          placeholder="Email"
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
                            placeholder="password"
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-605 font-bold"
                        >
                          <option value="customer">Buyer / Customer</option>
                          <option value="supplier">Seller / Supplier</option>
                        </select>
                      </div>
                    </div>

                    {/* DYNAMIC SUPPLIER INFRASTURE QUESTIONS */}
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
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Location</label>
                            <input 
                              type="text" 
                              value={location}
                              onChange={e => setLocation(e.target.value)}
                              placeholder="Nagpur, Maharastra"
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Business license *</label>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={e => setBusinessLicense(e.target.files?.[0] || null)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] focus:outline-none focus:border-indigo-500 text-white file:mr-2 file:rounded file:border-0 file:bg-indigo-600 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
                              required={regRole === 'supplier'}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 font-bold uppercase">Identity proof *</label>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={e => setIdentityProof(e.target.files?.[0] || null)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[10px] focus:outline-none focus:border-indigo-500 text-white file:mr-2 file:rounded file:border-0 file:bg-indigo-600 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
                              required={regRole === 'supplier'}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-lg border-0 transition-colors flex items-center justify-center gap-1 cursor-pointer text-xs"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-4 h-4 text-indigo-200" />
                    </button>
                  </form>

                  <div className="border-t border-slate-800/80 pt-3 text-center text-xs text-slate-500">
                    Already registered?{' '}
                    <button 
                      onClick={() => setAuthMode('login')} 
                      className="text-indigo-400 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Log In
                    </button>
                  </div>
                </motion.div>
              )}

              {/* VIEW 3: OTP VERIFY */}
              {authMode === 'otp' && (
                <motion.div 
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-950/40 border border-indigo-900/20 text-indigo-400 flex items-center justify-center mx-auto text-xl">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-display font-medium text-white">MFA Phone Authentication Challenge</h3>
                      <p className="text-xs text-slate-400">Sent verification code pin to {regPhone}</p>
                    </div>
                  </div>

                  <form onSubmit={verifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 text-center block">6-Digit SMS Security Code</label>
                      <input 
                        type="text" 
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g,'').substring(0, 6))}
                        placeholder="748293"
                        className="w-full tracking-widest text-center text-lg font-bold font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-600 text-white placeholder-slate-700"
                        maxLength={6}
                        required
                        autoFocus
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-lg border-0 transition-colors flex items-center justify-center gap-1 cursor-pointer text-xs uppercase"
                    >
                      <span>Authorize Profile</span>
                    </button>
                  </form>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <span>Didn't get SMS verification?</span>
                    {otpTimer > 0 ? (
                      <span className="text-slate-400 font-medium">Resend PIN in {otpTimer}s</span>
                    ) : (
                      <button 
                        onClick={triggerResendOtp}
                        className="text-indigo-400 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  {/* SIMULATED BYPASS LINK TIP */}
                  <div className="bg-slate-950/50 p-2 text-[10px] text-slate-500 rounded border border-slate-850 leading-relaxed text-center font-semibold">
                    💡 FAST FORWARD TIP: Enter the simulated SMS code above or enter code <span className="text-emerald-400 font-mono font-bold">123456</span> to pass instantly!
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>

      </div>

      {/* FLOAT BACKEND NOTIFICATION SIMULATOR DIALOG */}
      {smsNotificationMsg && (
        <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md bg-indigo-950 border-2 border-indigo-500 rounded-xl p-4 shadow-2xl z-50 text-left space-y-2 animate-bounce">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-xs font-mono font-black text-indigo-300 uppercase tracking-widest">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>SMS Sentry Network Simulator</span>
            </div>
            <button 
              onClick={() => setSmsNotificationMsg('')}
              className="text-indigo-400 hover:text-white font-bold p-0 px-1 border-0 bg-transparent text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-mono font-bold text-white bg-slate-950 p-2.5 rounded border border-indigo-900 leading-relaxed break-words">
            {smsNotificationMsg}
          </p>
        </div>
      )}

      {/* FOOTER STATS */}
      <footer className="p-6 border-t border-slate-900/60 z-10 bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div>
          <span>RASMP</span>
        </div>
      </footer>

    </div>
  );
}
