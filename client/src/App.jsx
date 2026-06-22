import { useState, useEffect } from 'react';
import { 
  initialRequirements, 
  initialSuppliers, 
  initialQuotations, 
  initialNotifications, 
  businessRules as initialBusinessRules 
} from './data/initialData';
import CustomerPanel from './components/CustomerPanel';
import SupplierPanel from './components/SupplierPanel';
import AdminPanel from './components/AdminPanel';
import AuthScreen from './components/AuthScreen';
import { api, clearSession, setSession } from './api';
import { 
  User, 
  Shield, 
  Building2, 
  Layers, 
  LogOut, 
  Lock, 
  CheckCircle
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('customer');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('#login');
  const [isLoggedOutAnim, setIsLoggedOutAnim] = useState(false);

  // Core synchronized global states
  const [requirements, setRequirements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [businessRules, setBusinessRules] = useState(initialBusinessRules);

  // Load from local storage or set initial data
  useEffect(() => {
    const loadApp = async () => {
      try {
        const savedUser = localStorage.getItem('rasmp_user');
        const savedToken = localStorage.getItem('rasmp_token');
        const response = savedUser && savedToken ? await api.session() : await api.bootstrap();

        applyServerData(response.currentData);

        if (response.user || savedUser) {
          const parsed = response.user || JSON.parse(savedUser);
          setCurrentUser(parsed);
          setActiveRole(parsed.role);

          if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '#register') {
            window.location.hash = '#dashboard';
            setCurrentRoute('#dashboard');
          } else {
            setCurrentRoute(window.location.hash);
          }
        } else {
          if (window.location.hash === '#register') {
            setCurrentRoute('#register');
          } else {
            window.location.hash = '#login';
            setCurrentRoute('#login');
          }
        }
      } catch (error) {
        console.error(error);
        clearSession();
        setRequirements(initialRequirements);
        setSuppliers(initialSuppliers);
        setQuotations(initialQuotations);
        setNotifications(initialNotifications);
        setBusinessRules(initialBusinessRules);
        window.location.hash = '#login';
        setCurrentRoute('#login');
      }
    };

    loadApp();

    const handleHashChange = () => {
      const currentHash = window.location.hash || '#login';
      setCurrentRoute(currentHash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const applyServerData = (data) => {
    setRequirements(data?.requirements || initialRequirements);
    setSuppliers(data?.suppliers || initialSuppliers);
    setQuotations(data?.quotations || initialQuotations);
    setNotifications(data?.notifications || initialNotifications);
    setBusinessRules(data?.businessRules || initialBusinessRules);
  };

  // Auth Handlers
  const handleLoginSuccess = (session) => {
    const user = session.user || session;
    setSession({ user, token: session.token });
    if (session.currentData) applyServerData(session.currentData);
    setCurrentUser(user);
    setActiveRole(user.role);
    window.location.hash = '#dashboard';
    setCurrentRoute('#dashboard');
  };

  const handleLogout = () => {
    setIsLoggedOutAnim(true);
    setTimeout(() => {
      clearSession();
      setCurrentUser(null);
      window.location.hash = '#login';
      setCurrentRoute('#login');
      setIsLoggedOutAnim(false);
    }, 400);
  };

  const handleAddRequirement = async (newReq) => {
    try {
      const response = await api.addRequirement(newReq);
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteRequirement = async (id) => {
    try {
      const response = await api.deleteRequirement(id);
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmitBid = async (requirementId, requirementTitle, price, deliveryTime, specs, attachments = []) => {
    try {
      const response = await api.submitBid({
        requirementId,
        requirementTitle,
        price,
        deliveryTime,
        specifications: specs,
        attachments
      });
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSelectQuotation = async (quoteId) => {
    try {
      const response = await api.selectQuotation(quoteId);
      applyServerData(response.currentData);
      alert('Contract successfully awarded! Bid has transitioned status to "Awarded", and Requirement is officially Closed.');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleShortlistQuotation = async (quoteId) => {
    try {
      const response = await api.shortlistQuotation(quoteId);
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApproveSupplier = async (id) => {
    try {
      const response = await api.updateSupplierVerification(id, 'Approved');
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRejectSupplier = async (id) => {
    try {
      const response = await api.updateSupplierVerification(id, 'Rejected');
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('rasmp_user', JSON.stringify(updatedUser));
  };

  const handleUpdateCustomerProfile = async (profileUpdates) => {
    if (!currentUser || currentUser.role !== 'customer') {
      return { ok: false, message: 'Customer profile updates are only available inside a customer session.' };
    }

    try {
      const response = await api.updateCustomerProfile(profileUpdates);
      updateCurrentUser(response.user);
      applyServerData(response.currentData);
      return { ok: true, message: 'Customer profile and contact details saved.' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const handleChangeCustomerPassword = async ({ currentPassword, newPassword }) => {
    if (!currentUser || currentUser.role !== 'customer') {
      return { ok: false, message: 'Password changes are only available inside a customer session.' };
    }

    try {
      const response = await api.changeCustomerPassword({ currentPassword, newPassword });
      updateCurrentUser(response.user);
      return { ok: true, message: 'Password changed successfully.' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const handleUpdateProfile = async (updatedProfile) => {
    try {
      const response = await api.updateSupplierProfile(updatedProfile);
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const response = await api.clearNotifications(activeRole);
      applyServerData(response.currentData);
    } catch (error) {
      alert(error.message);
    }
  };

  // Routing and Gatekeeper Rule check:
  const isAuthRoute = currentRoute === '#login' || currentRoute === '#register';

  // Render Gatekeeper screen if not authenticated
  if (!currentUser || isAuthRoute) {
    return (
      <AuthScreen onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-slate-900 font-sans transition-opacity duration-300 ${isLoggedOutAnim ? 'opacity-0' : 'opacity-100'}`} id="rasmp-application-root">
      
      {/* SECURE SESSION STATUS RAIL HEADER */}
      <div className="bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs font-semibold select-none z-10 sticky top-0 shrink-0">
        
        {/* Brand visual watermark */}
        <div className="flex items-center gap-2.5 px-6 py-3.5 shrink-0 justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            {/* <Layers className="w-4 h-4 text-indigo-400" /> */}
            <span className="text-white font-black tracking-widest text-xs uppercase font-display">RASMP</span>
          </div>

          {/* Mobile signout fallback */}
          <button 
            onClick={handleLogout}
            className="md:hidden flex items-center gap-1 bg-red-950/40 text-red-400 p-1.5 rounded border border-red-900/20 hover:bg-red-900 hover:text-white cursor-pointer transition-colors"
            title="Terminate active exchange session"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ACTIVE SECURED IDENTITY BADGE */}
        <div className="bg-slate-900/50 border-y md:border-y-0 md:border-x border-slate-800/85 px-4 py-2 flex items-center justify-center gap-3 w-full md:w-auto text-center shrink">
          <div className="w-7 h-7 rounded-sm bg-indigo-900 text-indigo-200 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-850/50">
            {currentUser.initials}
          </div>
          <div className="text-left truncate max-w-[200px] sm:max-w-none">
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1 leading-none">
              <span className="truncate">{currentUser.name}</span>
              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
            </div>
            <div className="text-[10px] text-slate-400/80 font-medium font-mono tracking-wider mt-0.5">
              Role: <span className="text-indigo-400 font-bold uppercase">{currentUser.role} Account</span>
            </div>
          </div>
        </div>

        {/* Portal Switching tabs & Logout controls */}
        <div className="flex w-full md:w-auto items-center overflow-x-auto justify-between md:justify-end divide-x divide-slate-800 shrink-0 select-none">
          
          {/* If Administrator is logged in, grant full-audit tabs override! Excellent for evaluations */}
          {currentUser.role === 'admin' ? (
            <div className="flex divide-x divide-slate-800">
              {/* <button 
                onClick={() => { setActiveRole('customer'); window.location.hash = '#dashboard'; }}
                className={`flex items-center justify-center gap-1.5 px-4 py-4 text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer outline-none border-0 ${
                  activeRole === 'customer' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 animate-pulse" />
                <span>Customer Area</span>
              </button>

              <button 
                onClick={() => { setActiveRole('supplier'); window.location.hash = '#dashboard'; }}
                className={`flex items-center justify-center gap-1.5 px-4 py-4 text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer outline-none border-0 ${
                  activeRole === 'supplier' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Supplier Area</span>
              </button> */}

              <button 
                onClick={() => { setActiveRole('admin'); window.location.hash = '#dashboard'; }}
                className={`flex items-center justify-center gap-1.5 px-4 py-4 text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer outline-none border-0 ${
                  activeRole === 'admin' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Operations</span>
              </button>
            </div>
          ) : (
            // Customer/Supplier are lock-gated strictly to their respective active role panel
            <div className="px-4 py-3 flex items-center gap-2 text-slate-300 font-bold font-mono tracking-wide text-xs">
              {/* <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> */}
              <span></span>
            </div>
          )}

          {/* High Fidelity Sign Out lock screen wrapper */}
          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-5 py-4 text-xs font-bold tracking-wide text-red-400 hover:text-white hover:bg-red-950/40 cursor-pointer outline-none transition-all uppercase border-0"
            title="Terminate secure cryptographic session"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* CORE FRAME ENVELOPES: LIVE PORTAL SWITCHER */}
      <div className="flex-1 flex overflow-hidden">
        {activeRole === 'customer' && (
          <CustomerPanel 
            currentUser={currentUser}
            requirements={requirements}
            suppliers={suppliers}
            quotations={quotations}
            notifications={notifications}
            onAddRequirement={handleAddRequirement}
            onSelectQuotation={handleSelectQuotation}
            onShortlistQuotation={handleShortlistQuotation}
            onClearNotifications={handleClearNotifications}
            onDeleteRequirement={handleDeleteRequirement}
            onUpdateCustomerProfile={handleUpdateCustomerProfile}
            onChangeCustomerPassword={handleChangeCustomerPassword}
          />
        )}

        {activeRole === 'supplier' && (
          <SupplierPanel 
            currentUser={currentUser}
            requirements={requirements}
            suppliers={suppliers}
            quotations={quotations}
            notifications={notifications}
            onSubmitBid={handleSubmitBid}
            onClearNotifications={handleClearNotifications}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeRole === 'admin' && (
          <AdminPanel 
            requirements={requirements}
            suppliers={suppliers}
            quotations={quotations}
            notifications={notifications}
            businessRules={businessRules}
            onApproveSupplier={handleApproveSupplier}
            onRejectSupplier={handleRejectSupplier}
            onClearNotifications={handleClearNotifications}
            onTriggerAdvisory={handleApproveSupplier}
          />
        )}
      </div>

    </div>
  );
}
