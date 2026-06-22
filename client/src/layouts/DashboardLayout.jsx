import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Shield, 
  Building2, 
  Layers, 
  LogOut, 
  Lock, 
  CheckCircle
} from 'lucide-react';

export default function DashboardLayout() {
  const { 
    currentUser, 
    activeRole, 
    setActiveRole, 
    isLoggedOutAnim, 
    handleLogout 
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if session node is not authorized
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Effect to automatically sync path when active role is changed
  useEffect(() => {
    if (currentUser) {
      if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
        navigate(`/dashboard/${activeRole}`, { replace: true });
      }
    }
  }, [activeRole, currentUser, location.pathname, navigate]);

  const onLogoutPressed = () => {
    handleLogout(() => {
      navigate('/login');
    });
  };

  return (
    <div 
      className={`flex flex-col min-h-screen bg-slate-900 font-sans transition-opacity duration-300 ${
        isLoggedOutAnim ? 'opacity-0' : 'opacity-100'
      }`} 
      id="rasmp-application-root"
    >
      {/* SECURE SESSION STATUS RAIL HEADER */}
      <div className="bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs font-semibold select-none z-10 sticky top-0 shrink-0">
        
        {/* Brand visual watermark */}
        <div className="flex items-center gap-2.5 px-6 py-3.5 shrink-0 justify-between w-full md:w-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-black tracking-widest text-xs uppercase font-display">RASMP</span>
          </div>

          {/* Mobile signout fallback */}
          <button 
            onClick={onLogoutPressed}
            className="md:hidden flex items-center gap-1 bg-red-950/40 text-red-400 p-1.5 rounded border border-red-900/20 hover:bg-red-900 hover:text-white cursor-pointer transition-colors"
            title="Terminate active exchange session"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ACTIVE SECURED IDENTITY BADGE */}
        <div className="bg-slate-900/50 border-y md:border-y-0 md:border-x border-slate-800/85 px-4 py-2 flex items-center justify-center gap-3 w-full md:w-auto text-center shrink">
          <div className="w-7 h-7 rounded-sm bg-indigo-900 text-indigo-200 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-850/50/30">
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
          
          {/* If Administrator is logged in, grant full-audit tabs override! */}
          {currentUser.role === 'admin' ? (
            <div className="flex divide-x divide-slate-800">
              <button 
                onClick={() => { setActiveRole('customer'); navigate('/dashboard/customer'); }}
                className={`flex items-center justify-center gap-1.5 px-4 py-4 text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer outline-none border-0 ${
                  activeRole === 'customer' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Area</span>
              </button>

              <button 
                onClick={() => { setActiveRole('supplier'); navigate('/dashboard/supplier'); }}
                className={`flex items-center justify-center gap-1.5 px-4 py-4 text-[11px] font-bold tracking-wide transition-all uppercase cursor-pointer outline-none border-0 ${
                  activeRole === 'supplier' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Supplier Area</span>
              </button>

              <button 
                onClick={() => { setActiveRole('admin'); navigate('/dashboard/admin'); }}
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
              <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Gated session node: 1 minute challenge approved </span>
            </div>
          )}

          {/* High Fidelity Sign Out lock screen wrapper */}
          <button 
            onClick={onLogoutPressed}
            className="hidden md:flex items-center gap-2 px-5 py-4 text-xs font-bold tracking-wide text-red-400 hover:text-white hover:bg-red-950/40 cursor-pointer outline-none transition-all uppercase border-0"
            title="Terminate secure cryptographic session"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Terminate session</span>
          </button>
        </div>
      </div>

      {/* CORE OUTLET: NESTED IN DASHBOARDS */}
      <div className="flex-1 flex overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
