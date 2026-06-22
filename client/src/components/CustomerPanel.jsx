import { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Plus, 
  Users, 
  FileText, 
  Bell, 
  User, 
  Server, 
  Wrench, 
  Truck, 
  Sprout, 
  Building2, 
  Cpu, 
  MapPin, 
  Star, 
  Sparkles, 
  Send,
  Trash2,
  Check,
  Mail,
  Phone,
  KeyRound,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomerPanel({
  currentUser,
  requirements,
  suppliers,
  quotations,
  notifications,
  onAddRequirement,
  onSelectQuotation,
  onShortlistQuotation,
  onClearNotifications,
  onDeleteRequirement,
  onUpdateCustomerProfile,
  onChangeCustomerPassword
}) {
  const [activeTab, setActiveTab] = useState('dash');
  const [filterStatus, setFilterStatus] = useState('All');

  // Input states for New Requirement
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT / Technology');
  const [industry, setIndustry] = useState('');
  const [preferredSupplierType, setPreferredSupplierType] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [requiredBy, setRequiredBy] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [location, setLocation] = useState('');
  const [specifications, setSpecifications] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [buyerType, setBuyerType] = useState(currentUser?.buyerType || 'Individual Buyer');
  const [organization, setOrganization] = useState(currentUser?.organization || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [contactLocation, setContactLocation] = useState(currentUser?.location || 'Pune, Maharashtra');
  const [contactAddress, setContactAddress] = useState(currentUser?.address || '');
  const [preferredContact, setPreferredContact] = useState(currentUser?.preferredContact || 'Email');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const customerNotifications = notifications.filter(n => n.role === 'customer');

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'IT / Technology': return <Server className="w-4 h-4" />;
      case 'Industrial & manufacturing': return <Wrench className="w-4 h-4" />;
      case 'Logistics': return <Truck className="w-4 h-4" />;
      case 'Agriculture': return <Sprout className="w-4 h-4" />;
      case 'Real estate & construction': return <Building2 className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'IT / Technology': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 dark:border-blue-800/30';
      case 'Industrial & manufacturing': return 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-100 dark:border-amber-800/30';
      case 'Logistics': return 'bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300 border-teal-100 dark:border-teal-800/30';
      case 'Agriculture': return 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-100 dark:border-green-800/30';
      case 'Real estate & construction': return 'bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-100 dark:border-purple-800/30';
      default: return 'bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-100';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !subcategory || !quantity) {
      alert('Please fill out the title, subcategory and quantity constraints.');
      return;
    }
    
    onAddRequirement({
      title,
      category,
      industry: industry || category,
      preferredSupplierType,
      subcategory,
      quantity,
      budgetRange: budgetRange || 'Negotiable',
      requiredBy: requiredBy || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority,
      location: location || 'Anywhere',
      specifications: specifications || 'None specified.',
      status: 'Open'
    });

    setSuccessMessage('Requirement posted and direct matching algorithm executed!');
    setTitle('');
    setIndustry('');
    setPreferredSupplierType('');
    setSubcategory('');
    setQuantity('');
    setBudgetRange('');
    setRequiredBy('');
    setPriority('Normal');
    setLocation('');
    setSpecifications('');

    setTimeout(() => {
      setSuccessMessage('');
      setActiveTab('reqs');
    }, 2000);
  };

  const executeAutoMatchPreset = () => {
    setTitle('Cloud Storage 500TB for Dev Hub');
    setCategory('IT / Technology');
    setIndustry('Cloud infrastructure');
    setPreferredSupplierType('Service provider');
    setSubcategory('Cloud hosting');
    setQuantity('500 TB backup space');
    setBudgetRange('₹8,00,000 - ₹12,00,000');
    setPriority('Critical');
    setLocation('Pan-India (ISO 27001 compliant)');
    setSpecifications('Required high speed AWS/Azure equivalent object storage with direct integration APIs, SLA guaranteed.');
  };

  const activeReqsCount = requirements.filter(r => r.status !== 'Closed').length;
  const closedReqsCount = requirements.filter(r => r.status === 'Closed').length;
  const pendingQuotesCount = quotations.filter(q => q.status === 'New' || q.status === 'Reviewing' || q.status === 'Shortlisted').length;

  const normalize = (value = '') => String(value).toLowerCase().trim();
  const includesAny = (source, target) => {
    const cleanSource = normalize(source);
    const cleanTarget = normalize(target);
    return Boolean(cleanSource && cleanTarget && (cleanSource.includes(cleanTarget) || cleanTarget.includes(cleanSource)));
  };
  const cityToken = (value = '') => normalize(value).split(',')[0].trim();
  const getSupplierMatchScore = (req, supplier) => {
    let score = 0;
    if (includesAny(supplier.primaryCategories, req.category)) score += 35;
    if (includesAny(supplier.primaryCategories, req.industry || req.category)) score += 25;
    if (cityToken(req.location) && cityToken(supplier.location) && cityToken(req.location) === cityToken(supplier.location)) score += 20;
    if (req.preferredSupplierType && includesAny(supplier.type, req.preferredSupplierType)) score += 20;
    if (!req.preferredSupplierType) score += 10;
    if (supplier.verified === 'Approved' || supplier.verified === 'Verified') score += 10;
    return Math.min(score, 100);
  };
  const latestOpenRequirement = requirements.find(req => req.status !== 'Supplier selected' && req.status !== 'Closed') || requirements[0];
  const matchedSuppliers = suppliers
    .filter(sup => sup.verified === 'Approved' || sup.verified === 'Verified')
    .map(sup => ({
      ...sup,
      liveMatchPercent: latestOpenRequirement ? getSupplierMatchScore(latestOpenRequirement, sup) : sup.matchPercent
    }))
    .filter(sup => sup.liveMatchPercent >= 45 || latestOpenRequirement?.matchedSupplierIds?.includes(sup.id))
    .sort((a, b) => b.liveMatchPercent - a.liveMatchPercent);

  const filteredRequirements = requirements.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileName.trim() || !contactEmail.trim()) {
      setProfileError('Name and email are required.');
      return;
    }

    const result = await onUpdateCustomerProfile({
      name: profileName,
      buyerType,
      organization,
      email: contactEmail,
      phone: contactPhone,
      location: contactLocation,
      address: contactAddress,
      preferredContact
    });

    if (result?.ok) {
      setProfileSuccess(result.message);
      setTimeout(() => setProfileSuccess(''), 2500);
    } else {
      setProfileError(result?.message || 'Profile could not be saved.');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const result = await onChangeCustomerPassword({ currentPassword, newPassword });
    if (result?.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(result.message);
      setTimeout(() => setPasswordSuccess(''), 2500);
    } else {
      setPasswordError(result?.message || 'Password could not be changed.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-slate-50 text-slate-800 overflow-hidden" id="customer-panel-root">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 flex-1 md:flex-none">
        
        {/* Logo and branding */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm block">RASMP Portal</span>
            <span className="text-xs text-blue-600 font-medium tracking-wide uppercase">Customer Hub</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-3 py-1.5">Overview</span>
          
          <button 
            onClick={() => setActiveTab('dash')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'dash' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">My Requirements</span>

          <button 
            onClick={() => { setActiveTab('reqs'); setFilterStatus('All'); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'reqs' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4" />
              <span>All Requirements</span>
            </div>
            <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">{requirements.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('post')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'post' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Post Requirement</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">Intelligent Matching</span>

          <button 
            onClick={() => setActiveTab('matches')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'matches' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Supplier Matches</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
              {suppliers.filter(s => s.verified === 'Approved' || s.verified === 'Verified').length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('quotes')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'quotes' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Quotations</span>
            </div>
            <span className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">{quotations.length}</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">System Settings</span>

          <button 
            onClick={() => setActiveTab('notifs')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'notifs' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {customerNotifications.length > 0 && (
              <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                {customerNotifications.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Profile Management</span>
          </button>
        </nav>

        {/* User Foot */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {currentUser?.initials || 'US'}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-800 truncate">{currentUser?.name || 'Customer'}</div>
            <div className="text-[10px] text-slate-500 font-medium truncate">{buyerType} ({contactLocation || 'Location pending'})</div>
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
        
        {/* HEADER BAR */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-base font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
            {activeTab === 'dash' && 'Overview Dashboard'}
            {activeTab === 'reqs' && 'My Active Requirements'}
            {activeTab === 'post' && 'Post High-Fidelity Requirement'}
            {activeTab === 'matches' && 'Verified Match Coverage Algorithm'}
            {activeTab === 'quotes' && 'Received Bids & Invoices'}
            {activeTab === 'notifs' && 'Security Auditing Alerts'}
            {activeTab === 'profile' && 'Profile Management'}
          </h1>
          <button 
            onClick={() => setActiveTab('post')}
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Requirement</span>
          </button>
        </header>

        {/* CONTENT ENVELOPE */}
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
                {/* METRICS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Requests</span>
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{activeReqsCount}</div>
                    <p className="text-[10px] text-emerald-600 font-medium mt-1">✓ Live on auction floor</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Quotations</span>
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{quotations.length}</div>
                    <p className="text-[10px] text-amber-600 font-medium mt-1">⚡ {pendingQuotesCount} awaiting decision</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Requirements Closed</span>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{closedReqsCount}</div>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Contracts successfully finalized</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Supplier Rating</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">4.7</div>
                    <p className="text-[10px] text-indigo-600 font-medium mt-1">★ Highly verified ecosystem</p>
                  </div>
                </div>

                {/* DOUBLE COLUMN PANELS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT PANEL: CURRENT REQUIREMENTS */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Live Requirements</h3>
                      <button onClick={() => setActiveTab('reqs')} className="text-[11px] font-bold text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {requirements.slice(0, 4).map(req => (
                        <div key={req._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getCategoryTheme(req.category)}`}>
                              {getCategoryIcon(req.category)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-xs text-slate-800 block truncate">{req.title}</span>
                              <span className="text-[10px] text-slate-500 block">{req.category} · Due {req.requiredBy}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase shrink-0 ${
                            req.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'Matched' ? 'bg-green-100 text-green-700' :
                            req.status === 'In review' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT PANEL: RECENT INCOMING BIDS */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recent Sealed Quotations</h3>
                      <button onClick={() => setActiveTab('quotes')} className="text-[11px] font-bold text-blue-600 hover:underline">View Bids</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {quotations.length === 0 ? (
                        <p className="p-6 text-center text-xs text-slate-500">No active incoming quotations at this time.</p>
                      ) : (
                        quotations.slice(0, 4).map(quote => (
                          <div key={quote._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded bg-slate-100 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                                {quote.supplierInitials}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-xs text-slate-800 block truncate">{quote.supplierName}</span>
                                <span className="text-[10px] text-slate-500 block truncate">{quote.requirementTitle}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-slate-900 block">{quote.price}</span>
                              <span className="text-[9px] text-emerald-600 font-bold uppercase">{quote.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* MATCH COVERAGE BAR CHART SECTION */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Proprietary Smart Match Coverage Metrics</span>
                  </h3>
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-700">IT / Cloud Infrastructure</span>
                        <span className="font-bold text-blue-700">95% Match Yield</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-700">Industrial & Manufacturing Fasteners</span>
                        <span className="font-bold text-blue-700">78% Match Yield</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-700">Logistics Routing & Dry-Ice Storage</span>
                        <span className="font-bold text-blue-700">85% Match Yield</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-medium text-slate-700">Agriculture Produce (Organic Hub)</span>
                        <span className="font-bold text-amber-700">61% Match Yield (Adding Suppliers...)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '61%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: ALL REQUIREMENTS */}
            {activeTab === 'reqs' && (
              <motion.div 
                key="reqs" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* FILTER CHIPS */}
                <div className="flex gap-2 pb-2 overflow-x-auto border-0">
                  {['All', 'Open', 'Matched', 'In review', 'Closed'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilterStatus(tab)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${
                        filterStatus === tab 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {tab === 'All' ? `All Requests (${requirements.length})` : tab}
                    </button>
                  ))}
                </div>

                {/* LISTING */}
                <div className="space-y-3">
                  {filteredRequirements.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                      <p className="text-slate-500 text-sm">No requirements found matching the status filter.</p>
                      <button 
                        onClick={() => setFilterStatus('All')} 
                        className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredRequirements.map(req => (
                      <div key={req._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${getCategoryTheme(req.category)}`}>
                            {getCategoryIcon(req.category)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{req.title}</h4>
                            <div className="text-[11px] text-slate-500 font-medium space-x-2">
                              <span>{req.category} ( {req.subcategory} )</span>
                              <span>•</span>
                              <span>Target: {req.quantity}</span>
                              <span>•</span>
                              <span>Delivery: {req.location}</span>
                            </div>
                            <div className="text-[11px] text-indigo-500 font-medium">
                              Specifications: <span className="text-slate-600 italic font-normal">{req.specifications}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges / Price / Actions */}
                        <div className="flex items-center gap-4 w-full md:w-auto self-end md:self-center justify-between border-t border-slate-100 md:border-0 pt-3.5 md:pt-0 shrink-0">
                          <div className="text-left md:text-right">
                            <span className="text-xs font-bold text-slate-900 block">{req.budgetRange}</span>
                            <span className="text-[10px] text-slate-500 block">Due {req.requiredBy}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                              req.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                              req.status === 'Matched' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'In review' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-400'
                            }`}>
                              {req.status}
                            </span>
                            
                            <button 
                              onClick={() => onDeleteRequirement(req._id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors"
                              title="Delete requirement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: POST REQUIREMENT */}
            {activeTab === 'post' && (
              <motion.div 
                key="post" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      <span>Post Commercial Request For Proposal (RFP)</span>
                    </h3>
                    <button 
                      type="button"
                      onClick={executeAutoMatchPreset}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-lg border-0 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Fill Simulator Specs</span>
                    </button>
                  </div>

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Requirement Title *</label>
                      <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Cloud Storage Infrastructure for Q1 2026 Dev Hub"
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Industry Category</label>
                        <select 
                          value={category} 
                          onChange={e => setCategory(e.target.value)}
                          className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-blue-600 mt-1"
                        >
                          <option>IT / Technology</option>
                          <option>Industrial & manufacturing</option>
                          <option>Logistics</option>
                          <option>Agriculture</option>
                          <option>Real estate & construction</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Subcategory *</label>
                        <input 
                          type="text" 
                          value={subcategory} 
                          onChange={e => setSubcategory(e.target.value)}
                          placeholder="e.g. Cloud backup/hosting"
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Industry</label>
                        <input
                          type="text"
                          value={industry}
                          onChange={e => setIndustry(e.target.value)}
                          placeholder="e.g. Cloud infrastructure, Fasteners, Fresh produce"
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Preferred Supplier Type</label>
                        <select
                          value={preferredSupplierType}
                          onChange={e => setPreferredSupplierType(e.target.value)}
                          className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-blue-600 mt-1"
                        >
                          <option value="">Any approved supplier</option>
                          <option>Manufacturer</option>
                          <option>Dealer</option>
                          <option>Dealer / Distributor</option>
                          <option>Service provider</option>
                          <option>Broker</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quantity / Volume Constraints *</label>
                        <input 
                          type="text" 
                          value={quantity} 
                          onChange={e => setQuantity(e.target.value)}
                          placeholder="e.g. 500 TB space, 50,000 bolts"
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Maximum Budget Range (₹)</label>
                        <input 
                          type="text" 
                          value={budgetRange} 
                          onChange={e => setBudgetRange(e.target.value)}
                          placeholder="e.g. ₹8,00,000 - ₹12,00,000"
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Delivery Deadline Required</label>
                        <input 
                          type="date" 
                          value={requiredBy} 
                          onChange={e => setRequiredBy(e.target.value)}
                          className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Priority Level</label>
                        <select 
                          value={priority} 
                          onChange={e => setPriority(e.target.value)}
                          className="w-full text-xs font-medium rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-blue-600 mt-1"
                        >
                          <option value="Normal">Normal Priority</option>
                          <option value="High">High Security Priority</option>
                          <option value="Critical">Immediate SLA Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Delivery Location / Regional Hub</label>
                      <input 
                        type="text" 
                        value={location} 
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Pune Assembly Hub, MH"
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Engineering Specifications & Compliance Standards</label>
                      <textarea 
                        value={specifications} 
                        onChange={e => setSpecifications(e.target.value)}
                        rows={3}
                        placeholder="Detail S3 API bindings, ISO 9001 certifications required, custom tooling specs, security controls or certifications required..."
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 resize-none mt-1"
                      />
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('dash')} 
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold font-sans transition-colors border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors border-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish & Execute Match</span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SUPPLIER MATCHES */}
            {activeTab === 'matches' && (
              <motion.div 
                key="matches" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {latestOpenRequirement && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Auto-match basis</span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{latestOpenRequirement.title}</h3>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Matching parameters: {latestOpenRequirement.category} | {latestOpenRequirement.location || 'Any location'} | {latestOpenRequirement.industry || latestOpenRequirement.category} | {latestOpenRequirement.preferredSupplierType || 'Any supplier type'}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedSuppliers.map(sup => (
                    <div 
                      key={sup.id} 
                      className={`bg-white rounded-xl border p-5 space-y-4 shadow-xs relative hover:border-slate-300 transition-all ${
                        sup.liveMatchPercent >= 90 ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200'
                      }`}
                    >
                      {sup.liveMatchPercent >= 90 && (
                        <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide">
                          Top Match
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-105 bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-100">
                          {sup.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs">{sup.name}</h4>
                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{sup.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Ratings KPI block */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-lg text-center">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Delivery</span>
                          <span className="font-bold text-slate-700 text-xs">{sup.rating}★</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Quality</span>
                          <span className="font-bold text-slate-700 text-xs">{sup.qualityRating || 4.5}★</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Tier</span>
                          <span className="font-bold text-slate-700 text-xs">{sup.priceLevel}</span>
                        </div>
                      </div>

                      {/* Core Algorithm Match Gauge */}
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-slate-500 font-medium">Matching Engine Score:</span>
                        <span className={`font-bold ${sup.liveMatchPercent >= 90 ? 'text-emerald-600' : 'text-blue-600'}`}>{sup.liveMatchPercent}%</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(sup.tags || []).map(tag => (
                          <span key={tag} className="bg-blue-50 text-blue-700 font-semibold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                        <span className="bg-slate-100 text-slate-600 font-semibold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                          {sup.experienceYears} Years Exp
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 5: QUOTATIONS */}
            {activeTab === 'quotes' && (
              <motion.div 
                key="quotes" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {requirements.filter(req => req.status !== 'Closed').map(req => {
                  const reqQuotes = quotations.filter(q => q.requirementId === req.id);
                  return (
                    <div key={req.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{req.category}</span>
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">{req.title}</h3>
                          {req.selectedSupplierName && (
                            <p className="text-[10px] font-bold text-emerald-700 mt-1">Supplier selected: {req.selectedSupplierName}</p>
                          )}
                        </div>
                        <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border border-blue-100">
                          Budget Target: {req.budgetRange}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100 border-0">
                        {reqQuotes.length === 0 ? (
                          <p className="p-6 text-center text-xs text-slate-400">Waiting for verified suppliers to upload bids. Matching alert is active.</p>
                        ) : (
                          <>
                            <div className="p-4 bg-white overflow-x-auto">
                              <table className="w-full min-w-[560px] text-left text-xs">
                                <thead>
                                  <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                                    <th className="py-2 pr-3">Supplier</th>
                                    <th className="py-2 pr-3">Price</th>
                                    <th className="py-2 pr-3">Delivery</th>
                                    <th className="py-2 pr-3">Match</th>
                                    <th className="py-2 pr-3">Status</th>
                                    <th className="py-2 pr-3">Files</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {reqQuotes.map(quote => (
                                    <tr key={`${quote.id}-compare`}>
                                      <td className="py-2 pr-3 font-bold text-slate-800">{quote.supplierName}</td>
                                      <td className="py-2 pr-3 font-semibold text-slate-700">{quote.price}</td>
                                      <td className="py-2 pr-3 text-slate-600">{quote.deliveryTime}</td>
                                      <td className="py-2 pr-3 font-bold text-blue-700">{quote.matchScore || 0}%</td>
                                      <td className="py-2 pr-3 font-bold text-emerald-700">{quote.status}</td>
                                      <td className="py-2 pr-3 text-slate-500">{(quote.attachments || []).length}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {reqQuotes.map(quote => (
                              <div key={quote.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-105 bg-slate-50 font-bold border border-slate-100 flex items-center justify-center shrink-0 text-xs">
                                  {quote.supplierInitials}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-800 text-xs">{quote.supplierName}</h4>
                                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Delivery Promised: {quote.deliveryTime}</p>
                                  <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                                    Proposal: <span className="text-slate-600 font-medium italic">{quote.specifications}</span>
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {(quote.attachments || []).map(file => (
                                      <a
                                        key={`${quote.id}-${file.attachmentType}`}
                                        href={file.dataUrl}
                                        download={file.fileName}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded px-2 py-1 text-[10px] font-bold"
                                      >
                                        {file.label || file.attachmentType}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 self-end md:self-center shrink-0 w-full md:w-auto justify-between border-t border-slate-100 md:border-0 pt-3.5 md:pt-0">
                                <div className="text-left md:text-right">
                                  <span className="text-sm font-bold text-slate-900 block">{quote.price}</span>
                                  <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">{quote.status}</span>
                                  <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider block">Match {quote.matchScore || 0}%</span>
                                </div>

                                {quote.status === 'Awarded' ? (
                                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 border-0">
                                    <Check className="w-3.5 h-3.5" /> Ordered
                                  </span>
                                ) : (
                                  <div className="flex gap-2">
                                    {quote.status !== 'Shortlisted' && (
                                      <button
                                        onClick={() => onShortlistQuotation(quote.id)}
                                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Shortlist
                                      </button>
                                    )}
                                    <button
                                      onClick={() => onSelectQuotation(quote.id)}
                                      className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border-0"
                                    >
                                      Select Supplier
                                    </button>
                                  </div>
                                )}
                              </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* TAB 6: NOTIFICATIONS */}
            {activeTab === 'notifs' && (
              <motion.div 
                key="notifs" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="max-w-2xl mx-auto space-y-4"
              >
                <div className="flex justify-between items-center pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Security & matching alarms</h3>
                  {customerNotifications.length > 0 && (
                    <button 
                      onClick={onClearNotifications} 
                      className="text-xs font-bold text-red-650 text-red-600 hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Clear Notifications
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {customerNotifications.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                      <p className="text-slate-500 text-sm">No new notifications in Customer log.</p>
                    </div>
                  ) : (
                    customerNotifications.map(notif => (
                      <div key={notif._id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 animate-ping ${
                          notif.type === 'success' ? 'bg-emerald-500' :
                          notif.type === 'warning' ? 'bg-amber-500' :
                          notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-xs">{notif.title}</h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">{notif.description}</p>
                          <span className="text-[9px] text-slate-400 font-medium block mt-1">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 7: PROFILE MANAGEMENT */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                        {currentUser?.initials || 'US'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{currentUser?.name || 'Customer'}</h3>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span>{contactPhone || 'Phone not added'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{contactLocation || 'Location not added'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>Preferred: {preferredContact}</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSave} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Update Profile</span>
                      </h3>
                    </div>

                    {profileSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{profileSuccess}</span>
                      </div>
                    )}

                    {profileError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                        {profileError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                        <input 
                          type="text"
                          value={profileName}
                          onChange={e => setProfileName(e.target.value)}
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Buyer Type</label>
                        <select
                          value={buyerType}
                          onChange={e => setBuyerType(e.target.value)}
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-blue-600 mt-1"
                        >
                          <option>Individual Buyer</option>
                          <option>Enterprise Customer</option>
                          <option>Procurement Team</option>
                          <option>Government Buyer</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Organization / Department</label>
                      <input 
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="e.g. Pune Dev Hub Procurement"
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>Manage Contact Details</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</label>
                          <input 
                            type="email"
                            value={contactEmail}
                            onChange={e => setContactEmail(e.target.value)}
                            className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mobile Number</label>
                          <input 
                            type="tel"
                            value={contactPhone}
                            onChange={e => setContactPhone(e.target.value)}
                            placeholder="+91 9876543210"
                            className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</label>
                          <input 
                            type="text"
                            value={contactLocation}
                            onChange={e => setContactLocation(e.target.value)}
                            placeholder="Pune, Maharashtra"
                            className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Preferred Contact</label>
                          <select
                            value={preferredContact}
                            onChange={e => setPreferredContact(e.target.value)}
                            className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-blue-600 mt-1"
                          >
                            <option>Email</option>
                            <option>Phone</option>
                            <option>WhatsApp</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Address</label>
                        <textarea
                          value={contactAddress}
                          onChange={e => setContactAddress(e.target.value)}
                          rows={3}
                          placeholder="Billing or delivery coordination address"
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 resize-none mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <button 
                        type="submit"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors border-0 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile</span>
                      </button>
                    </div>
                  </form>
                </div>

                <form onSubmit={handlePasswordSave} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs max-w-2xl">
                  <div className="border-b border-slate-100 pb-3 mb-5">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      <span>Change Password</span>
                    </h3>
                  </div>

                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                      {passwordError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-blue-600 mt-1"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-100 pt-4 mt-5">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors border-0 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}
