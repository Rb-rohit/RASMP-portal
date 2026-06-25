import { useState } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  ClipboardList, 
  Building2, 
  Shield, 
  Bell, 
  Sliders,
  Search,
  CheckCircle,
  ShieldCheck,
  Ban,
  RefreshCcw,
  Tags,
  FileBarChart,
  Plus,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel({
  currentUser,
  requirements,
  suppliers,
  users = [],
  categories = [],
  adminReport,
  notifications,
  businessRules,
  onApproveSupplier,
  onRejectSupplier,
  onUpdateUserVerification,
  onUpdateUserStatus,
  onAddCategory,
  onUpdateCategory,
  onGenerateReport,
  onClearNotifications
}) {
  const [activeTab, setActiveTab] = useState('dash');
  const [adminClass, setAdminClass] = useState(currentUser?.adminClass || 'Platform Administration');
  const [userSearchText, setUserSearchText] = useState('');
  const [userFilter, setUserFilter] = useState('All');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('Fraud risk flagged by admin.');

  const adminNotifications = notifications.filter(n => n.role === 'admin');
  const effectiveAdminClass = currentUser?.adminClass || adminClass;
  const canManagePlatform = effectiveAdminClass === 'Platform Administration';
  const canVerifyUsers = effectiveAdminClass === 'Platform Administration' || effectiveAdminClass === 'Verification Team';

  // Suppliers pending verification
  const pendingSuppliers = suppliers.filter(s => s.verified === 'Pending' || s.verified === 'Re-verify' || s.verified === 'Overdue');

  const getVerifiedBadgeStyle = (verifiedState) => {
    switch (verifiedState) {
      case 'Approved':
      case 'Verified': return 'bg-emerald-100 text-emerald-800';
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Re-verify': return 'bg-purple-100 text-purple-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Rejected':
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const supplierByUserId = suppliers.reduce((map, supplier) => {
    if (supplier.userId) map[supplier.userId] = supplier;
    return map;
  }, {});

  const platformUsers = users.length > 0
    ? users.map(user => ({
        ...user,
        supplierProfile: supplierByUserId[user.id],
        displayType: user.role === 'supplier' ? supplierByUserId[user.id]?.type || 'Supplier' : user.buyerType || user.role
      }))
    : suppliers.map(supplier => ({
        id: supplier.userId || supplier.id,
        name: supplier.name,
        role: 'supplier',
        accountStatus: supplier.verified === 'Rejected' ? 'Suspended' : 'Active',
        joinedDate: supplier.joinedDate,
        location: supplier.location,
        supplierProfile: supplier,
        displayType: supplier.type
      }));
  const pendingUserVerifications = platformUsers.filter(user => user.role !== 'admin' && !user.verified);

  const filteredUsersList = platformUsers.filter(user => {
    const term = userSearchText.toLowerCase();
    const supplier = user.supplierProfile;
    const matchesSearch = (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.location?.toLowerCase().includes(term) ||
      supplier?.gstin?.toLowerCase().includes(term)
    );
    
    if (userFilter === 'All') return matchesSearch;
    if (userFilter === 'Pending') return matchesSearch && (!user.verified || supplier?.verified === 'Pending' || supplier?.verified === 'Overdue');
    if (userFilter === 'Suspended') return matchesSearch && user.accountStatus === 'Suspended';
    if (userFilter === 'Supplier') return matchesSearch && user.role === 'supplier';
    if (userFilter === 'Customer') return matchesSearch && user.role === 'customer';
    return matchesSearch;
  });

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const result = await onAddCategory({
      name: categoryName,
      description: categoryDescription,
      status: 'Active'
    });

    if (result?.ok) {
      setCategoryName('');
      setCategoryDescription('');
    }
  };

  const categoryCounts = categories.map(category => ({
    ...category,
    requirementsCount: requirements.filter(req => req.category === category.name).length,
    suppliersCount: suppliers.filter(supplier => String(supplier.primaryCategories || '').includes(category.name)).length
  }));
  const totalRequirementsCount = requirements.length || 0;
  const categoryChartColors = ['bg-blue-600', 'bg-indigo-600', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
  const categoryDemography = categoryCounts
    .map((category, index) => ({
      ...category,
      percent: totalRequirementsCount > 0 ? Math.round((category.requirementsCount / totalRequirementsCount) * 100) : 0,
      color: categoryChartColors[index % categoryChartColors.length]
    }))
    .filter(category => category.requirementsCount > 0 || category.suppliersCount > 0)
    .sort((a, b) => b.requirementsCount - a.requirementsCount || b.suppliersCount - a.suppliersCount)
    .slice(0, 6);

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-slate-50 text-slate-800 overflow-hidden" id="admin-panel-root">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 flex-1 md:flex-none">
        
        {/* Logo and branding */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm block">RASMP Portal</span>
            <span className="text-xs text-indigo-600 font-medium tracking-wide uppercase">Admin Operations</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-3 py-1.5">Admin Classes</span>

          {['Platform Administration', 'Verification Team'].map(label => (
            <button
              key={label}
              onClick={() => !currentUser?.adminClass && setAdminClass(label)}
              disabled={Boolean(currentUser?.adminClass) && effectiveAdminClass !== label}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                effectiveAdminClass === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'
              }`}
            >
              {label === 'Platform Administration' ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{label}</span>
            </button>
          ))}

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">Overview</span>
          
          <button 
            onClick={() => setActiveTab('dash')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'dash' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">Verification Team</span>

          <button 
            onClick={() => setActiveTab('verify')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'verify' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4" />
              <span>Verification Queue</span>
            </div>
            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">{pendingSuppliers.length + pendingUserVerifications.length}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('users'); setUserFilter('All'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Users className="w-4 h-4" />
            <span>All Users</span>
          </button>

          {canManagePlatform && (
            <>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">Platform Administration</span>

          <button 
            onClick={() => setActiveTab('reqs')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'reqs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4" />
              <span>All Requirements</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'suppliers' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Building2 className="w-4 h-4" />
            <span>Suppliers Directory</span>
          </button>

          <button 
            onClick={() => setActiveTab('rules')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'rules' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Business Rules</span>
          </button>

          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'categories' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Tags className="w-4 h-4" />
            <span>Manage Categories</span>
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <FileBarChart className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
            </>
          )}

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">Platform Health</span>


          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'alerts' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notification</span>
            </div>
            {adminNotifications.length > 0 && (
              <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                {adminNotifications.length}
              </span>
            )}
          </button>
        </nav>

        {/* User profile foot */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
            RB
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-800 truncate">{currentUser?.name || 'Rohit Bodalkar'} </div>
            <div className="text-[10px] text-slate-500 font-medium">Head Administrator</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
        
        {/* HEADER */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-base font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
            {activeTab === 'dash' && 'Platform Audit Dashboard'}
            {activeTab === 'verify' && 'Company Verification Queues'}
            {activeTab === 'users' && 'Manage Connected Entities'}
            {activeTab === 'reqs' && 'Core Customer RFP Index'}
            {activeTab === 'suppliers' && 'Fulfillment Supplier Registry'}
            {activeTab === 'rules' && 'RASMP Business Rule Compliance'}
            {activeTab === 'categories' && 'Manage Marketplace Categories'}
            {activeTab === 'reports' && 'Generate Platform Report'}
            {activeTab === 'tech' && 'Database Schema & Server Status'}
            {activeTab === 'alerts' && 'Critical Infrastructure Warnings'}
          </h1>
          <button 
            onClick={() => setActiveTab('verify')}
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Fulfill Verifications ({pendingSuppliers.length + pendingUserVerifications.length})</span>
          </button>
        </header>

        {/* BODY */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dash' && (
              <motion.div 
                key="dash" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* HIGH LEVEL METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total System Members</span>
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{platformUsers.length}</div>
                    
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active RFPs</span>
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{requirements.filter(r => r.status !== 'Closed').length}</div>
                  
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verification Waiting</span>
                      <UserCheck className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{pendingSuppliers.length + pendingUserVerifications.length}</div>
                    <p className="text-[10px] text-red-500 font-semibold mt-1">{pendingSuppliers.filter(s => s.verified === 'Overdue').length} supplier warnings</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Matching Yield</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">82.4%</div>
                    <p className="text-[10px] text-indigo-600 font-semibold mt-1">High-trust precision matching</p>
                  </div>
                </div>

                {/* DOUBLE DIVISION GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT: PENDING VERIFICATION APPROVAL ACTION CARD */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Verification Waiting Loop</h3>
                      <button onClick={() => setActiveTab('verify')} className="text-[11px] font-bold text-indigo-600 hover:underline">View queue</button>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {pendingSuppliers.length === 0 ? (
                        <p className="p-8 text-center text-xs text-slate-400">All registered corporate entities in verified status badge.</p>
                      ) : (
                        pendingSuppliers.map(sup => (
                          <div key={sup.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-200">
                                {sup.initials}
                              </div>
                              <div>
                                <span className="font-semibold text-xs text-slate-800 block truncate max-w-[150px] sm:max-w-[200px]">{sup.name}</span>
                                <span className="text-[10px] text-slate-500 block">GST Validated · Badge: {sup.verified}</span>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <button 
                                onClick={() => onApproveSupplier(sup.id)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => onRejectSupplier(sup.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* RIGHT: PLATFORM TRADING SEGMENTS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      <span>Platform Trading Segments / RFP Category Demography</span>
                    </h3>
                    <div className="space-y-3.5">
                      {categoryDemography.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 font-semibold bg-slate-50 rounded-lg border border-slate-100">
                          No live category activity yet. New requirements and suppliers will update this chart automatically.
                        </div>
                      ) : (
                        categoryDemography.map(category => (
                          <div key={category.id}>
                            <div className="flex justify-between text-xs mb-1 gap-3">
                              <span className="font-medium text-slate-700 truncate">{category.name}</span>
                              <span className="font-semibold text-indigo-600 shrink-0">
                                {category.requirementsCount} RFPs · {category.suppliersCount} suppliers
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`${category.color} h-full rounded-full`} style={{ width: `${Math.max(category.percent, category.requirementsCount > 0 ? 8 : 2)}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: VERIFICATION QUEUE */}
            {activeTab === 'verify' && (
              <motion.div 
                key="verify" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-100 border-b border-slate-200">
                    <p className="text-[11px] text-slate-500 font-bold block leading-relaxed">
                      3-Step Verification Protocol: OTP Multi-factor Validation → National Commercial Document Upload Check → Head Admin Authorization Grant.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {pendingSuppliers.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 space-y-1">
                        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800">Verified status current!</h4>
                        <p className="text-xs">No corporate entities currently awaiting manual identity audits.</p>
                      </div>
                    ) : (
                      pendingSuppliers.map(sup => (
                        <div key={sup.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider inline-block ${getVerifiedBadgeStyle(sup.verified)}`}>
                              {sup.verified}
                            </span>
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{sup.name}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Headquarters Location: {sup.location} | Joined date: {sup.joinedDate}</p>
                            <p className="text-[11px] text-indigo-600 font-semibold">
                              Dossier: <span className="text-slate-600 font-medium italic">GStin certification ({sup.gstin}), Registered classifications ({sup.primaryCategories})</span>
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {(sup.documents || []).length === 0 ? (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded">
                                  No uploaded documents found
                                </span>
                              ) : (
                                sup.documents.map(doc => (
                                  <a
                                    key={`${sup.id}-${doc.documentType}`}
                                    href={doc.dataUrl}
                                    download={doc.fileName}
                                    className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold"
                                  >
                                    <Download className="w-3 h-3 text-indigo-600" />
                                    <span>{doc.label || doc.documentType}</span>
                                    <span className={`px-1 rounded ${doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : doc.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {doc.status || 'Pending'}
                                    </span>
                                  </a>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0 self-end md:self-center">
                            <button 
                              onClick={() => onApproveSupplier(sup.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                            >
                              Approve Badging
                            </button>
                            <button 
                              onClick={() => onRejectSupplier(sup.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Reject Identity
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: ALL PLATFORM MEMBERS */}
            {activeTab === 'users' && (
              <motion.div 
                key="users" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* SEARCH BAR & FILTERS */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between">
                  {/* Search query input */}
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={userSearchText}
                      onChange={e => setUserSearchText(e.target.value)}
                      placeholder="Search global register by name, location, GSTIN..."
                      className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2 pl-9 bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1.5">
                    {['All', 'Customer', 'Supplier', 'Pending', 'Suspended'].map(f => (
                      <button
                        key={f}
                        onClick={() => setUserFilter(f)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${
                          userFilter === f 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">Fraud suspension reason</span>
                    <p className="text-[11px] text-red-700/80 font-semibold mt-0.5">This note is saved when an admin suspends a customer or supplier.</p>
                  </div>
                  <input
                    type="text"
                    value={suspensionReason}
                    onChange={e => setSuspensionReason(e.target.value)}
                    className="w-full sm:w-96 text-xs font-semibold rounded-lg border border-red-200 p-2 bg-white focus:outline-none focus:border-red-500"
                    placeholder="Reason for suspension"
                  />
                </div>

                {/* MEMBERS DATA GRID TABLE */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company / Individual</th>
                          <th className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role / Classifications</th>
                          <th className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location base</th>
                          <th className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join date</th>
                          <th className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trust Badging</th>
                          <th className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Verification</th>
                          <th className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fraud Control</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {filteredUsersList.map(member => (
                          <tr key={member._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded bg-slate-100 text-[10px] font-bold border flex items-center justify-center shrink-0">{member.initials || 'CS'}</span>
                                <div>
                                  <span className="font-bold text-xs text-slate-800 block">{member.name}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{member.email || member.supplierProfile?.gstin || 'No email on file'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">
                              <span className="font-bold capitalize text-slate-800">{member.role}</span>
                              <span className="block text-[10px] text-slate-400">{member.supplierProfile?.primaryCategories || member.displayType || 'Platform account'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">{member.location || member.supplierProfile?.location || 'Not set'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">{member.joinedDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getVerifiedBadgeStyle(member.verified)}`}>
                                {member.role === 'supplier' ? member.supplierProfile?.verified || 'Pending' : member.accountStatus || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.role === 'admin' ? (
                                <span className="text-[10px] font-bold text-slate-400">System admin</span>
                              ) : member.verified ? (
                                <button
                                  onClick={() => onUpdateUserVerification(member.id, false)}
                                  disabled={!canVerifyUsers}
                                  className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded text-[10px] font-bold disabled:opacity-50"
                                >
                                  Mark Pending
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateUserVerification(member.id, true)}
                                  disabled={!canVerifyUsers}
                                  className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold disabled:opacity-50"
                                >
                                  Verify User
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.role === 'admin' ? (
                                <span className="text-[10px] font-bold text-slate-400">Protected</span>
                              ) : !canManagePlatform ? (
                                <span className="text-[10px] font-bold text-slate-400">Platform only</span>
                              ) : member.accountStatus === 'Suspended' ? (
                                <button
                                  onClick={() => onUpdateUserStatus(member.id, 'Active', '')}
                                  className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold"
                                >
                                  <RefreshCcw className="w-3 h-3" />
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateUserStatus(member.id, 'Suspended', suspensionReason)}
                                  className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded text-[10px] font-bold"
                                >
                                  <Ban className="w-3 h-3" />
                                  Suspend
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Master Requirements */}
            {activeTab === 'reqs' && (
              <motion.div 
                key="reqs" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="divide-y divide-slate-100">
                    {requirements.map(req => (
                      <div key={req._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{req.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{req.category} | Location: {req.location} | Target range: {req.budgetRange}</p>
                          <p className="text-[10px] text-indigo-500 font-semibold">Specs requested: <span className="text-slate-600 font-normal italic">{req.specifications}</span></p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase shrink-0 ${
                          req.status === 'Open' ? 'bg-blue-105 text-blue-700 bg-blue-50' :
                          req.status === 'Matched' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'In review' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: SUPPLIER DIRECTORY */}
            {activeTab === 'suppliers' && (
              <motion.div 
                key="suppliers" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map(sup => (
                    <div key={sup.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0 border">{sup.initials}</span>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">{sup.name}</h4>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">{sup.location}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getVerifiedBadgeStyle(sup.verified)}`}>
                          {sup.verified}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-medium">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary categories Enrolled</span>
                        {sup.primaryCategories || 'Manufacturing engineering'}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[11px]">
                        <span className="text-amber-600 font-bold">★ {sup.rating} platform rating</span>
                        <span className="text-slate-500 font-medium">{sup.experienceYears} Years Exp</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 6: BUSINESS RULES */}
            {activeTab === 'rules' && (
              <motion.div 
                key="rules" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="max-w-xl mx-auto space-y-4"
              >
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="divide-y divide-slate-100">
                    {businessRules.map(rule => (
                      <div key={rule.id} className="p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-850 text-xs sm:text-sm">{rule.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{rule.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 7: CATEGORY MANAGEMENT */}
            {activeTab === 'categories' && (
              <motion.div 
                key="categories" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <form onSubmit={handleCategorySubmit} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Tags className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Add Marketplace Category</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={categoryName}
                      onChange={e => setCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-indigo-600"
                      required
                    />
                    <input
                      type="text"
                      value={categoryDescription}
                      onChange={e => setCategoryDescription(e.target.value)}
                      placeholder="Category description"
                      className="md:col-span-2 text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold border-0 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                      Add Category
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryCounts.map(category => (
                    <div key={category.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{category.name}</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-1">{category.description || 'No description added.'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${category.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                          {category.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">RFPs</span>
                          <span className="font-bold text-slate-900">{category.requirementsCount}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Suppliers</span>
                          <span className="font-bold text-slate-900">{category.suppliersCount}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateCategory(category.id, { status: category.status === 'Active' ? 'Suspended' : 'Active' })}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                          category.status === 'Active'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {category.status === 'Active' ? 'Suspend Category' : 'Reactivate Category'}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 8: REPORTS */}
            {activeTab === 'reports' && (
              <motion.div 
                key="reports" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileBarChart className="w-4 h-4 text-indigo-600" />
                      <span>Platform Operations Report</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Generate a live summary of users, suppliers, requirements, quotations, categories, and suspensions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onGenerateReport}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold border-0 cursor-pointer"
                  >
                    Generate Report
                  </button>
                </div>

                {adminReport ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      ['Total users', adminReport.totalUsers],
                      ['Suspended users', adminReport.suspendedUsers],
                      ['Total suppliers', adminReport.totalSuppliers],
                      ['Pending suppliers', adminReport.pendingSuppliers],
                      ['Total requirements', adminReport.totalRequirements],
                      ['Open requirements', adminReport.openRequirements],
                      ['Total quotations', adminReport.totalQuotations],
                      ['Active categories', adminReport.activeCategories]
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                        <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
                      </div>
                    ))}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs sm:col-span-2 lg:col-span-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Generated at</span>
                      <div className="text-xs font-semibold text-slate-700 mt-1">{new Date(adminReport.generatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-500 font-semibold">
                    No report generated yet.
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 9: ALERTS & INTELLIGENT MATCHING ADVISORY */}
            {activeTab === 'alerts' && (
              <motion.div 
                key="alerts" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="max-w-2xl mx-auto space-y-6"
              >

                {/* NOTIFICATIONS CONTAINER */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security alarm log</span>
                    {adminNotifications.length > 0 && (
                      <button onClick={onClearNotifications} className="text-xs font-bold text-red-650 text-red-600 hover:underline">Clear Alerts</button>
                    )}
                  </div>

                  {adminNotifications.map(alert => (
                    <div key={alert.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          alert.type === 'alert' ? 'bg-red-500' :
                          alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">{alert.description}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">{alert.time}</span>
                        </div>
                      </div>

                      {alert.title.includes('verification') && (
                        <button 
                          onClick={() => setActiveTab('verify')}
                          className="bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-[10px] px-2 py-1 select-none flex-shrink-0 cursor-pointer rounded"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}
