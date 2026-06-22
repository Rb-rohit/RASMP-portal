import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  KeyRound, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function OtpPage() {
  const navigate = useNavigate();
  const { handleLoginSuccess, suppliers } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);

  const [tempUser, setTempUser] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [smsNotificationMsg, setSmsNotificationMsg] = useState('');

  useEffect(() => {
    // Read code and user from sessionStorage
    const savedUserRaw = sessionStorage.getItem('rasmp_temp_register_user');
    const savedUserOtp = sessionStorage.getItem('rasmp_temp_register_otp');
    const savedSmsMsg = sessionStorage.getItem('rasmp_sms_sim_msg');

    if (!savedUserRaw || !savedUserOtp) {
      // Missing state, back to login
      navigate('/login');
      return;
    }

    setTempUser(JSON.parse(savedUserRaw));
    setGeneratedOtp(savedUserOtp);
    setSmsNotificationMsg(savedSmsMsg || '');
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const verifyOtp = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpInput === generatedOtp || otpInput === '123456') {
      const verifiedUser = { ...tempUser, verified: true };
      
      // Save user to simulated user database
      const registeredUsers = JSON.parse(localStorage.getItem('rasmp_users') || '[]');
      registeredUsers.push(verifiedUser);
      localStorage.setItem('rasmp_users', JSON.stringify(registeredUsers));

      // If they registered as Supplier, append them so they appear in directories!
      if (verifiedUser.role === 'supplier') {
        const suppliersList = JSON.parse(localStorage.getItem('rasmp_suppliers') || '[]');
        const newSupplierId = 'sup-' + (suppliersList.length + 7);
        const newSup = {
          id: newSupplierId,
          name: verifiedUser.companyName,
          initials: verifiedUser.initials,
          location: verifiedUser.location,
          rating: 4.5,
          qualityRating: 4.6,
          priceLevel: '₹₹',
          matchPercent: 88,
          tags: ['OEM Partner', 'New Enrolled'],
          experienceYears: 1,
          deliveryDays: 14,
          type: 'Manufacturer',
          verified: 'Pending', // Awaiting admin Auditing/Approval
          joinedDate: verifiedUser.joinedDate,
          gstin: verifiedUser.gstin,
          primaryCategories: verifiedUser.primaryCategories,
          certifications: 'ISO 9001 registration submitted'
        };

        const activeSuppliers = JSON.parse(localStorage.getItem('rasmp_suppliers') || 'null');
        const listToAppend = activeSuppliers ? activeSuppliers : suppliers;
        listToAppend.push(newSup);
        localStorage.setItem('rasmp_suppliers', JSON.stringify(listToAppend));
        
        // Also save this generated ID onto the user session record
        verifiedUser.id = newSupplierId;
      }

      setSuccessMessage('Multi-factor Authentication approved! Secure token minted.');
      
      // Complete Login and route to dashboard
      setTimeout(() => {
        handleLoginSuccess(verifiedUser, () => {
          // Clear temporary registers
          sessionStorage.removeItem('rasmp_temp_register_user');
          sessionStorage.removeItem('rasmp_temp_register_otp');
          sessionStorage.removeItem('rasmp_sms_sim_msg');
          
          navigate('/dashboard');
        });
        setSuccessMessage('');
      }, 1200);
    } else {
      setErrorMessage('Security code mismatch. Please review verification pin.');
    }
  };

  const triggerResendOtp = () => {
    const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(freshCode);
    setOtpTimer(60);
    setOtpInput('');
    sessionStorage.setItem('rasmp_temp_register_otp', freshCode);

    const simMsg = `🔑 SMS SIMULATION [RASMP Auth-Sentry]: NEW verification code is ${freshCode}. Expires in 1 minute.`;
    setSmsNotificationMsg(simMsg);
    sessionStorage.setItem('rasmp_sms_sim_msg', simMsg);

    setSuccessMessage('Fresh SMS MFA challenge generated!');
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-1.5 pb-1 select-none">
        <button 
          onClick={() => navigate('/register')} 
          className="p-1 rounded text-slate-400 hover:text-white bg-slate-800/30 hover:bg-slate-800 border-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-base font-display font-medium text-white">MFA Challenge</h3>
          <p className="text-[10px] text-slate-400">Regional Auto-Sourcing Access portal</p>
        </div>
      </div>

      <div className="space-y-1.5 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-950/40 border border-indigo-900/20 text-indigo-400 flex items-center justify-center mx-auto text-xl">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-300">Sent verification code pin to {tempUser?.phone || 'your phone link'}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

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

      <div className="bg-slate-950/50 p-2 text-[10px] text-slate-500 rounded border border-slate-850 leading-relaxed text-center font-semibold">
        💡 FAST FORWARD TIP: Enter the simulated SMS code or use code <span className="text-emerald-400 font-mono font-bold">123456</span> to pass instantly!
      </div>

      {/* FLOAT SMS NOTIFICATION SIMULATOR DIALOG */}
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
    </motion.div>
  );
}
