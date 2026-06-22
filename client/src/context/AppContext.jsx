import { createContext, useContext, useState, useEffect } from 'react';
import { 
  initialRequirements, 
  initialSuppliers, 
  initialQuotations, 
  initialNotifications, 
  businessRules 
} from '../data/initialData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRole, setActiveRole] = useState('customer');
  const [isLoggedOutAnim, setIsLoggedOutAnim] = useState(false);

  // Synced dataset state
  const [requirements, setRequirements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load from local storage or set initial data
  useEffect(() => {
    const savedReqs = localStorage.getItem('rasmp_requirements');
    const savedSups = localStorage.getItem('rasmp_suppliers');
    const savedQuotes = localStorage.getItem('rasmp_quotations');
    const savedNotifs = localStorage.getItem('rasmp_notifications');
    const savedUser = localStorage.getItem('rasmp_user');

    if (savedReqs) setRequirements(JSON.parse(savedReqs));
    else {
      setRequirements(initialRequirements);
      localStorage.setItem('rasmp_requirements', JSON.stringify(initialRequirements));
    }

    if (savedSups) setSuppliers(JSON.parse(savedSups));
    else {
      setSuppliers(initialSuppliers);
      localStorage.setItem('rasmp_suppliers', JSON.stringify(initialSuppliers));
    }

    if (savedQuotes) setQuotations(JSON.parse(savedQuotes));
    else {
      setQuotations(initialQuotations);
      localStorage.setItem('rasmp_quotations', JSON.stringify(initialQuotations));
    }

    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    else {
      setNotifications(initialNotifications);
      localStorage.setItem('rasmp_notifications', JSON.stringify(initialNotifications));
    }

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUser(parsed);
      setActiveRole(parsed.role);
    }
  }, []);

  const saveState = (reqs, sups, quotes, notifs) => {
    setRequirements(reqs);
    setSuppliers(sups);
    setQuotations(quotes);
    setNotifications(notifs);

    localStorage.setItem('rasmp_requirements', JSON.stringify(reqs));
    localStorage.setItem('rasmp_suppliers', JSON.stringify(sups));
    localStorage.setItem('rasmp_quotations', JSON.stringify(quotes));
    localStorage.setItem('rasmp_notifications', JSON.stringify(notifs));
  };

  const handleLoginSuccess = (user, callback) => {
    localStorage.setItem('rasmp_user', JSON.stringify(user));
    setCurrentUser(user);
    setActiveRole(user.role);
    if (callback) callback();
  };

  const handleLogout = (callback) => {
    setIsLoggedOutAnim(true);
    setTimeout(() => {
      localStorage.removeItem('rasmp_user');
      setCurrentUser(null);
      setIsLoggedOutAnim(false);
      if (callback) callback();
    }, 400);
  };

  // State handlers: Customer posts a new requirement
  const handleAddRequirement = (newReq) => {
    const rawId = 'req-' + (requirements.length + 1);
    const added = {
      ...newReq,
      id: rawId,
      createdAt: new Date().toISOString().split('T')[0],
      quotationsCount: 0,
      matchPercentage: Math.floor(Math.random() * 25) + 70
    };

    const updatedReqs = [added, ...requirements];
    const customerName = currentUser ? currentUser.name : 'Priya Sharma';

    const updatedNotifs = [
      {
        id: 'notif-' + (notifications.length + 1),
        title: 'Requirement Matches Generated!',
        description: `New request "${newReq.title}" processed. Matched with NexaSys Solutions at 95% threshold value.`,
        time: 'Just now',
        type: 'success',
        read: false,
        role: 'customer'
      },
      {
        id: 'notif-' + (notifications.length + 2),
        title: 'New live requirement matched!',
        description: `New request matching category uploaded: "${newReq.title}". Submit proposal bids.`,
        time: 'Just now',
        type: 'info',
        read: false,
        role: 'supplier'
      },
      {
        id: 'notif-' + (notifications.length + 3),
        title: 'New requirement audit review',
        description: `Customer ${customerName} uploaded a requirement RFP of size ${newReq.quantity}.`,
        time: 'Just now',
        type: 'neutral',
        read: false,
        role: 'admin'
      },
      ...notifications
    ];

    saveState(updatedReqs, suppliers, quotations, updatedNotifs);
  };

  // Delete requirement
  const handleDeleteRequirement = (id) => {
    const updatedReqs = requirements.filter(r => r.id !== id);
    const updatedQuotes = quotations.filter(q => q.requirementId !== id);
    saveState(updatedReqs, suppliers, updatedQuotes, notifications);
  };

  // Supplier bid submission
  const handleSubmitBid = (requirementId, requirementTitle, price, deliveryTime, specs) => {
    const quoteId = 'q-' + (quotations.length + 1);
    const activeSupplierId = currentUser && currentUser.role === 'supplier' ? (currentUser.id || 'sup-custom') : 'sup-2';
    const activeSupplierName = currentUser && currentUser.role === 'supplier' ? (currentUser.companyName || currentUser.name) : 'Fastparts Global';
    const activeSupplierInitials = currentUser && currentUser.role === 'supplier' ? currentUser.initials : 'FP';

    const newQuote = {
      id: quoteId,
      requirementId,
      requirementTitle,
      supplierId: activeSupplierId,
      supplierName: activeSupplierName,
      supplierInitials: activeSupplierInitials,
      price,
      deliveryTime,
      specifications: specs,
      status: 'New',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    const updatedQuotes = [newQuote, ...quotations];

    const updatedReqs = requirements.map(req => {
      if (req.id === requirementId) {
        return {
          ...req,
          quotationsCount: req.quotationsCount + 1,
          status: req.status === 'Open' ? 'In review' : req.status
        };
      }
      return req;
    });

    const updatedNotifs = [
      {
        id: 'notif-' + (notifications.length + 1),
        title: 'Quotation Received from ' + activeSupplierName + '!',
        description: `${activeSupplierName} offered a proposal of ${price} with ${deliveryTime} delivery.`,
        time: 'Just now',
        type: 'info',
        read: false,
        role: 'customer'
      },
      ...notifications
    ];

    saveState(updatedReqs, suppliers, updatedQuotes, updatedNotifs);
  };

  // Customer accepts quote
  const handleSelectQuotation = (quoteId) => {
    let reqIdToClose = '';
    const updatedQuotes = quotations.map(q => {
      if (q.id === quoteId) {
        reqIdToClose = q.requirementId;
        return { ...q, status: 'Awarded' };
      } else if (q.requirementId === reqIdToClose) {
        return { ...q, status: 'Not selected' };
      }
      return q;
    });

    const updatedReqs = requirements.map(req => {
      if (req.id === reqIdToClose) {
        return { ...req, status: 'Closed' };
      }
      return req;
    });

    const targetQuote = quotations.find(q => q.id === quoteId);
    const updatedNotifs = [
      {
        id: 'notif-' + (notifications.length + 1),
        title: 'Contract Bid Awarded!',
        description: `Your bid on "${targetQuote?.requirementTitle}" has been APPROVED. Core order secured.`,
        time: 'Just now',
        type: 'success',
        read: false,
        role: 'supplier'
      },
      ...notifications
    ];

    saveState(updatedReqs, suppliers, updatedQuotes, updatedNotifs);
  };

  // Admin approves supplier verification Badging
  const handleApproveSupplier = (id) => {
    const targetSup = suppliers.find(s => s.id === id);
    const updatedSups = suppliers.map(s => {
      if (s.id === id) return { ...s, verified: 'Approved' };
      return s;
    });

    const updatedNotifs = [
      {
        id: 'notif-' + (notifications.length + 1),
        title: 'Supplier documents approved!',
        description: `${targetSup?.name} has completed document review and gained approved supplier access.`,
        time: 'Just now',
        type: 'success',
        read: false,
        role: 'admin'
      },
      ...notifications
    ];

    saveState(requirements, updatedSups, quotations, updatedNotifs);
  };

  // Admin rejects/flags supplier for auditing inquiry
  const handleRejectSupplier = (id) => {
    const targetSup = suppliers.find(s => s.id === id);
    const updatedSups = suppliers.map(s => {
      if (s.id === id) return { ...s, verified: 'Rejected' };
      return s;
    });

    const updatedNotifs = [
      {
        id: 'notif-' + (notifications.length + 1),
        title: 'Supplier ID document audit inquiry',
        description: `Identity files for ${targetSup?.name} flagged for verification mismatch issues.`,
        time: 'Just now',
        type: 'warning',
        read: false,
        role: 'admin'
      },
      ...notifications
    ];

    saveState(requirements, updatedSups, quotations, updatedNotifs);
  };

  // Profile update for suppliers
  const handleUpdateProfile = (updatedProfile) => {
    const updatedSups = suppliers.map(s => {
      if (s.id === 'sup-2' || (currentUser && s.id === currentUser.id)) {
        return {
          ...s,
          ...updatedProfile
        };
      }
      return s;
    });
    saveState(requirements, updatedSups, quotations, notifications);
  };

  // Clear system alert streams
  const handleClearNotifications = (role) => {
    const updatedNotifs = notifications.filter(n => n.role !== role);
    saveState(requirements, suppliers, quotations, updatedNotifs);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      activeRole,
      setActiveRole,
      isLoggedOutAnim,
      requirements,
      suppliers,
      quotations,
      notifications,
      businessRules,
      handleLoginSuccess,
      handleLogout,
      handleAddRequirement,
      handleDeleteRequirement,
      handleSubmitBid,
      handleSelectQuotation,
      handleApproveSupplier,
      handleRejectSupplier,
      handleUpdateProfile,
      handleClearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
