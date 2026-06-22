import { useState } from 'react';
import { 
  LayoutDashboard, 
  Search,  
  CheckCircle, 
  FileText, 
  Bell, 
  Building2, 
  Star, 
  Sparkles, 
  Send,
  Activity,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getListKey = (prefix, item, index) => String(item?.id || item?._id || `${prefix}-${index}`);

export default function SupplierPanel({
  currentUser,
  requirements,
  suppliers,
  quotations,
  notifications,
  onSubmitBid,
  onClearNotifications,
  onUpdateProfile
}) {
  const [activeTab, setActiveTab] = useState('dash');
  const [filterCategory, setFilterCategory] = useState('All');

  // Bid submission state modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidDelivery, setBidDelivery] = useState('');
  const [bidSpecs, setBidSpecs] = useState('');
  const [catalogFile, setCatalogFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [quotationPdfFile, setQuotationPdfFile] = useState(null);

  const activeSupplier = (
    currentUser?.role === 'supplier'
      ? suppliers.find(s => s.userId === currentUser.id || s.id === currentUser.id)
      : null
  ) || suppliers.find(s => s.id === 'sup-2') || suppliers[0];
  const supplierStatus = activeSupplier?.verified || 'Pending';
  const supplierApproved = supplierStatus === 'Approved' || supplierStatus === 'Verified' || currentUser?.role === 'admin';

  const [companyName, setCompanyName] = useState(activeSupplier?.name || 'Fastparts Global');
  const [supplierType, setSupplierType] = useState(activeSupplier?.type || 'Manufacturer');
  const [gstin, setGstin] = useState(activeSupplier?.gstin || '33AABCF5678H1Z8');
  const [location, setLocation] = useState(activeSupplier?.location || 'Chennai, Tamil Nadu');
  const [primaryCategories, setPrimaryCategories] = useState(activeSupplier?.primaryCategories || 'Industrial & manufacturing');
  const [certifications, setCertifications] = useState(activeSupplier?.certifications || 'ISO 9001');
  const [profileSuccess, setProfileSuccess] = useState('');

  const supplierNotifications = notifications.filter(n => n.role === 'supplier');

  const normalize = (value = '') => String(value).toLowerCase().trim();
  const includesAny = (source, target) => {
    const cleanSource = normalize(source);
    const cleanTarget = normalize(target);
    return Boolean(cleanSource && cleanTarget && (cleanSource.includes(cleanTarget) || cleanTarget.includes(cleanSource)));
  };
  const cityToken = (value = '') => normalize(value).split(',')[0].trim();
  const getMatchScore = (req, supplier) => {
    let score = 0;
    if (includesAny(supplier?.primaryCategories, req.category)) score += 35;
    if (includesAny(supplier?.primaryCategories, req.industry || req.category)) score += 25;
    if (cityToken(req.location) && cityToken(supplier?.location) && cityToken(req.location) === cityToken(supplier?.location)) score += 20;
    if (req.preferredSupplierType && includesAny(supplier?.type, req.preferredSupplierType)) score += 20;
    if (!req.preferredSupplierType) score += 10;
    return Math.min(score, 100);
  };

  const matchedLeads = requirements
    .filter(req => req.status !== 'Closed' && req.status !== 'Supplier selected')
    .map(req => ({ ...req, supplierMatchScore: getMatchScore(req, activeSupplier) }))
    .filter(req => req.supplierMatchScore >= 45 || req.matchedSupplierIds?.includes(activeSupplier?.id))
    .sort((a, b) => b.supplierMatchScore - a.supplierMatchScore);

  const filteredLeads = matchedLeads.filter(lead => {
    if (filterCategory === 'All') return true;
    return lead.category === filterCategory;
  });

  const myQuotations = quotations.filter(q => q.supplierId === activeSupplier?.id);
  const awardedOrders = myQuotations.filter(q => q.status === 'Awarded');

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!supplierApproved) {
      setProfileSuccess(`Profile changes are locked while verification is ${supplierStatus}.`);
      setTimeout(() => setProfileSuccess(''), 2500);
      return;
    }

    onUpdateProfile({
      id: activeSupplier?.id,
      name: companyName,
      type: supplierType,
      gstin,
      location,
      primaryCategories,
      certifications
    });
    setProfileSuccess('Corporate dossier updated & saved successfully!');
    setTimeout(() => setProfileSuccess(''), 2500);
  };

  const fileToAttachment = (file, attachmentType, label) => new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve({
      attachmentType,
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

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!supplierApproved) {
      alert(`Supplier functions are locked while verification is ${supplierStatus}.`);
      return;
    }

    if (!selectedLead) return;
    if (!bidPrice || !bidDelivery) {
      alert('Please state pricing proposal and delivery timeline estimates.');
      return;
    }
    if (!quotationPdfFile) {
      alert('Please attach the quotation PDF before submitting.');
      return;
    }

    let attachments = [];
    try {
      attachments = (await Promise.all([
        fileToAttachment(catalogFile, 'catalog', 'Catalog'),
        fileToAttachment(brochureFile, 'brochure', 'Brochure'),
        fileToAttachment(imageFile, 'image', 'Product image'),
        fileToAttachment(quotationPdfFile, 'quotationPdf', 'Quotation PDF')
      ])).filter(Boolean);
    } catch (error) {
      alert(error.message);
      return;
    }

    onSubmitBid(
      selectedLead.id,
      selectedLead.title,
      '₹' + bidPrice.replace(/[^0-9.]/g, ''),
      bidDelivery + ' days',
      bidSpecs || 'As per baseline specifications requested.',
      attachments
    );

    // reset forms
    setSelectedLead(null);
    setBidPrice('');
    setBidDelivery('');
    setBidSpecs('');
    setCatalogFile(null);
    setBrochureFile(null);
    setImageFile(null);
    setQuotationPdfFile(null);
    alert('Bidding quotation securely sent to matching customer queue!');
    setActiveTab('quotes');
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-slate-50 text-slate-800 overflow-hidden" id="supplier-panel-root">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 flex-1 md:flex-none">
        
        {/* Logo and branding */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm block">RASMP Portal</span>
            <span className="text-xs text-emerald-600 font-medium tracking-wide uppercase">Supplier Hub</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-3 py-1.5">Marketplace</span>
          
          <button 
            onClick={() => setActiveTab('dash')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'dash' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">Bidding Board</span>

          <button 
            onClick={() => { setActiveTab('leads'); setFilterCategory('All'); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'leads' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4" />
              <span>Matched Leads</span>
            </div>
            <span className="bg-slate-100 text-slate-705 font-bold px-1.5 py-0.5 rounded-full text-[10px]">{matchedLeads.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('quotes')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'quotes' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>Quotations Sent</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">{myQuotations.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Awarded Orders</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block pt-4 pb-1.5 px-3">Dossier</span>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button 
            onClick={() => setActiveTab('notifs')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors ${activeTab === 'notifs' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            {supplierNotifications.length > 0 && (
              <span className="bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                {supplierNotifications.length}
              </span>
            )}
          </button>
        </nav>

        {/* Supplier Profile foot */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
            FP
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-800 truncate">{companyName}</div>
            <div className="text-[10px] text-slate-500 font-medium">Verified Supplier badge</div>
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
        
        {/* HEADER BAR */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <h1 className="text-base font-bold text-slate-800 capitalize tracking-tight">
            {activeTab === 'dash' && 'Overview Performance Indicators'}
            {activeTab === 'leads' && 'Explore Category Opportunities'}
            {activeTab === 'quotes' && 'Sent Commercial RFPs'}
            {activeTab === 'orders' && 'Awarded Contracts Log'}
            {activeTab === 'profile' && 'Corporate Bid Profile'}
            {activeTab === 'notifs' && 'Supplier Safety Alerts'}
          </h1>
          <button 
            onClick={() => setActiveTab('leads')}
            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Opportunities</span>
          </button>
        </header>

        {/* CONTAINER */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {!supplierApproved && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Verification {supplierStatus}</p>
                <p className="text-xs font-semibold mt-1">Admin must approve your business license and identity proof before supplier functions are available.</p>
              </div>
              <span className="bg-white border border-amber-200 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider self-start sm:self-center">
                {supplierStatus}
              </span>
            </div>
          )}

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
                {/* SUPPLIER MERICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Leads matched</span>
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{matchedLeads.length}</div>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Live opportunities</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quotations Active</span>
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{myQuotations.length}</div>
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">⚡ Under customer review</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Awarded Orders</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{awardedOrders.length}</div>
                    <p className="text-[10px] text-slate-500 mt-1">Contracts won on Platform</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corporate Rating</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">4.7 / 5.0</div>
                    <p className="text-[10px] text-indigo-600 font-semibold mt-1">Verified compliance stats</p>
                  </div>
                </div>

                {/* DOUBLE PANEL SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT: MATCh OPPORTUNITIES */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recommended Match Opportunities</h3>
                      <button onClick={() => setActiveTab('leads')} className="text-[11px] font-bold text-emerald-600 hover:underline">View Leads</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {matchedLeads.slice(0, 3).map((lead, index) => (
                        <div key={getListKey('matched-lead', lead, index)} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-bold text-slate-800 block truncate">{lead.title}</span>
                            <span className="text-[10px] text-slate-500 block">{lead.category} · Budget target: {lead.budgetRange}</span>
                          </div>
                          <button 
                            onClick={() => supplierApproved && setSelectedLead(lead)}
                            disabled={!supplierApproved}
                            className={`font-bold text-[10px] px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
                              supplierApproved
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 cursor-pointer'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            }`}
                          >
                            Quote Hub
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: SUBMITTED BID QUOTES */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">My Active Bids</h3>
                      <button onClick={() => setActiveTab('quotes')} className="text-[11px] font-bold text-emerald-600 hover:underline">Manage Bids</button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {myQuotations.length === 0 ? (
                        <p className="p-6 text-center text-xs text-slate-500">You haven't submitted any quotations yet. Check matched leads!</p>
                      ) : (
                        myQuotations.slice(0, 3).map((quote, index) => (
                          <div key={getListKey('active-quote', quote, index)} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-bold text-slate-800 block truncate">{quote.requirementTitle}</span>
                              <span className="text-[10px] text-slate-500 block">Pricing submitted: {quote.price}</span>
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase shrink-0 ${
                              quote.status === 'Awarded' ? 'bg-emerald-100 text-emerald-800' :
                              quote.status === 'Reviewing' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {quote.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* BAR GRAPH CATEGORY RATIOS */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>My Platform Fulfillment Compliance Ratio</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Precision Industrial Components</span>
                        <span className="font-bold text-emerald-700">95% Rating</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Heavy Manufacturing Warehousing</span>
                        <span className="font-bold text-emerald-700">82% Rating</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Raw Alloy procurement</span>
                        <span className="font-bold text-amber-700">68% Rating</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: MATCHED LEADS */}
            {activeTab === 'leads' && (
              <motion.div 
                key="leads" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* FILTER CATEGORIES */}
                <div className="flex gap-2 pb-2 overflow-x-auto border-0">
                  {['All', 'IT / Technology', 'Industrial & manufacturing', 'Logistics', 'Agriculture', 'Real estate & construction'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all border whitespace-nowrap ${
                        filterCategory === cat 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* OPPORTUNITES LISTING */}
                <div className="space-y-3">
                  {filteredLeads.filter(l => l.status !== 'Closed').length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                      <p className="text-slate-500 text-sm">No matched opportunities found.</p>
                    </div>
                  ) : (
                    filteredLeads.filter(l => l.status !== 'Closed').map((lead, index) => (
                      <div key={getListKey('filtered-lead', lead, index)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">{lead.category}</span>
                          <h4 className="font-bold text-slate-800 text-sm truncate">{lead.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">Quantities: {lead.quantity} | Delivery Location: {lead.location}</p>
                          <p className="text-[11px] text-indigo-505 text-indigo-600 font-semibold gap-1 inline-flex items-center">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Specs: </span>
                            <span className="text-slate-600 font-normal italic">{lead.specifications}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center shrink-0 w-full md:w-auto justify-between border-t border-slate-100 md:border-0 pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-xs font-bold text-slate-900 block">{lead.budgetRange}</span>
                            <span className="text-[10px] text-slate-500 block">Required by {lead.requiredBy}</span>
                          </div>

                          <button 
                            type="button"
                            onClick={() => supplierApproved && setSelectedLead(lead)}
                            disabled={!supplierApproved}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs border-0 ${
                              supplierApproved
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Quote bid</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: QUOTATIONS SENT */}
            {activeTab === 'quotes' && (
              <motion.div 
                key="quotes" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Live Quotations Dossier</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {myQuotations.length === 0 ? (
                      <p className="p-8 text-center text-xs text-slate-500">You haven't uploaded bids for public proposals yet.</p>
                    ) : (
                      myQuotations.map((quote, index) => (
                        <div key={getListKey('quotation', quote, index)} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Submitted Proposal</span>
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{quote.requirementTitle}</h4>
                            <p className="text-[11px] text-indigo-505 text-indigo-600 font-semibold">
                              My Pricing model: <span className="text-slate-600 italic font-medium">{quote.price}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Guaranteed lead delivery: {quote.deliveryTime}</p>
                            <p className="text-[11px] text-slate-500 mt-1 italic">"{quote.specifications}"</p>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              quote.status === 'Awarded' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                              quote.status === 'Reviewing' ? 'bg-amber-100 text-amber-800' :
                              quote.status === 'New' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-500 bg-slate-50/50'
                            }`}>
                              {quote.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: AWARDED ORDERS */}
            {activeTab === 'orders' && (
              <motion.div 
                key="orders" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Secured platform commissions</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {awardedOrders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                        <p>No awarded contracts yet.</p>
                        <p className="text-[11px] text-slate-400 font-medium">Bidding proactively increases match probabilities by 47%.</p>
                      </div>
                    ) : (
                      awardedOrders.map((order, index) => (
                        <div key={getListKey('awarded-order', order, index)} className="p-5 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-905 text-slate-900 text-xs sm:text-sm">{order.requirementTitle}</h4>
                            <p className="text-[11px] text-slate-505 text-slate-500 font-medium">Award Price: {order.price} | Fulfillment Period: {order.deliveryTime}</p>
                            <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Verified corporate order awarded in good standing</p>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Order Secured
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: MY PROFILE */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Corporate Supplier Profile (MFA Encrypted)</span>
                    </h3>
                  </div>

                  {profileSuccess && (
                     <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                       <CheckCircle className="w-4 h-4 text-emerald-600" />
                       <span>{profileSuccess}</span>
                     </div>
                  )}

                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Corporate Name</label>
                        <input 
                          type="text" 
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-emerald-600 mt-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-505 text-slate-500">Corporate Type</label>
                        <select 
                          value={supplierType}
                          onChange={e => setSupplierType(e.target.value)}
                          className="w-full text-xs font-bold rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-emerald-600 mt-1"
                        >
                          <option>Manufacturer</option>
                          <option>Dealer / Distributor</option>
                          <option>Broker</option>
                          <option>Service provider</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">GST Registration Number</label>
                        <input 
                          type="text" 
                          value={gstin}
                          onChange={e => setGstin(e.target.value)}
                          placeholder="e.g. 33AABCF5678H1Z8"
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-emerald-600 mt-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Primary Headquarters</label>
                        <input 
                          type="text" 
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="e.g. Pune, Maharashtra"
                          className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 bg-white focus:outline-none focus:border-emerald-600 mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fulfillment Categories Enrolled</label>
                      <input 
                        type="text" 
                        value={primaryCategories}
                        onChange={e => setPrimaryCategories(e.target.value)}
                        placeholder="e.g. Industrial components, Electronics, Raw alloy"
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-emerald-600 mt-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Accreditations & Certifications</label>
                      <input 
                        type="text" 
                        value={certifications}
                        onChange={e => setCertifications(e.target.value)}
                        placeholder="e.g. ISO 9001:2015, IATF 16949 certified"
                        className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-emerald-600 mt-1"
                      />
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <button 
                        type="submit" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs border-0"
                      >
                        Save Profiles
                      </button>
                    </div>
                  </form>
                </div>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-505 text-slate-500">Marketplace alarms log</span>
                  {supplierNotifications.length > 0 && (
                    <button 
                      onClick={onClearNotifications} 
                      className="text-xs font-bold text-red-650 text-red-600 hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Clear Notifications
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {supplierNotifications.length === 0 ? (
                    <p className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-400">No active alerts for Fastparts Global.</p>
                  ) : (
                    supplierNotifications.map((notif, index) => (
                      <div key={getListKey('supplier-notification', notif, index)} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3 shadow-xs">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notif.type === 'success' ? 'bg-emerald-500' :
                          notif.type === 'warning' ? 'bg-amber-500' :
                          notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{notif.title}</h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">{notif.description}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* BID SUBMISSION POPUP MODEL ELEMENT */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">Direct Quotation Hub</span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 truncate max-w-[320px]">{selectedLead.title}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Commercial Proposal Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={bidPrice}
                    onChange={e => setBidPrice(e.target.value)}
                    placeholder="320000"
                    className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 pl-7 focus:outline-none focus:border-emerald-600 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Guaranteed Delivery Period (days) *</label>
                <input 
                  type="number" 
                  value={bidDelivery}
                  onChange={e => setBidDelivery(e.target.value)}
                  placeholder="14"
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-emerald-600 mt-1"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Proposal Details or Custom Specs Compliance</label>
                <textarea 
                  value={bidSpecs}
                  onChange={e => setBidSpecs(e.target.value)}
                  rows={2}
                  placeholder="Detail materials, precision grade (e.g. Grade 8.8 high-tensile bolts with premium anti-rust treatment)..."
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:border-emerald-600 resize-none mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Catalog</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => setCatalogFile(e.target.files?.[0] || null)}
                    className="w-full text-[10px] rounded-lg border border-slate-200 p-2 bg-white file:mr-2 file:rounded file:border-0 file:bg-emerald-600 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Brochure</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => setBrochureFile(e.target.files?.[0] || null)}
                    className="w-full text-[10px] rounded-lg border border-slate-200 p-2 bg-white file:mr-2 file:rounded file:border-0 file:bg-emerald-600 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product image</label>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-[10px] rounded-lg border border-slate-200 p-2 bg-white file:mr-2 file:rounded file:border-0 file:bg-emerald-600 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quotation PDF *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setQuotationPdfFile(e.target.files?.[0] || null)}
                    className="w-full text-[10px] rounded-lg border border-slate-200 p-2 bg-white file:mr-2 file:rounded file:border-0 file:bg-emerald-600 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedLead(null)}
                  className="bg-slate-100 text-slate-705 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!supplierApproved}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors border-0 ${
                    supplierApproved
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Upload Sealed Quote
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
