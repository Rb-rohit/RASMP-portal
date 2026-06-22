
import { Outlet, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle 
} from 'lucide-react';

export default function AuthLayout() {
  const { currentUser } = useApp();

  // If already logged in, redirect to dashboard automatically
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden" id="auth-root-layout">
      
      {/* Ambient background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER LOGO */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-900/60 z-10 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-extrabold text-white tracking-widest text-sm block">RASMP EXCHANGE</span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase">Identity Verification & Access Sentry</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-mono border border-slate-900 bg-slate-900/40 px-2 py-0.5 rounded">
          SSL ENCRYPTED SECURE
        </span>
      </header>

      {/* MIDDLE CONTAINER: GRID STYLE */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
        
        {/* LEFT COMPASS: VALUE VALUE PROPOSITION */}
        <div className="w-full lg:w-1/2 space-y-6 text-left shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/40 text-indigo-300 rounded-full text-[11px] font-bold border border-indigo-900/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Commercial Bid Auction Optimization</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight tracking-tight text-white">
            Industrial Procurement <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Trusted, Verified, Instant.
            </span>
          </h2>

          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            The Regional Auto-Sourcing Matching Portal (RASMP) ensures extreme compliance, rapid quotation validation, and direct OEM matches. Access requires authorized accounts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-lg">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block text-white">3-Step Compliance</span>
                <span className="text-[10px] text-slate-400">GST, Certs & SMS MFA checks</span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-600/10 text-blue-400 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block text-white">Target Matching</span>
                <span className="text-[10px] text-slate-400">&gt; 95% Heuristics accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTABLE AUTH ROUTES */}
        <div className="w-full lg:w-[460px] relative">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl w-full p-6 shadow-2xl relative backdrop-blur-lg">
            <Outlet />
          </div>
        </div>

      </div>

      {/* FOOTER STATS */}
      <footer className="p-6 border-t border-slate-900/60 z-10 bg-slate-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div>
          <span>RASMP Security Protocol TLS 1.3 · SHA-256 integrity check successful</span>
        </div>
        <div className="flex gap-4">
          <span>Active Nodes: IN-1</span>
          <span>SLA matching rate: 95.4%</span>
        </div>
      </footer>

    </div>
  );
}
