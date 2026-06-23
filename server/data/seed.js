const today = new Date().toISOString().split('T')[0];

const demoUsers = [
  {
    id: 'user-customer-1',
    name: 'Priya Sharma (Buyer)',
    email: 'priyaAllIn@example.com',
    password: 'password',
    role: 'customer',
    verified: true,
    joinedDate: today,
    initials: 'PS',
    phone: '+91 9876543210',
    location: 'Pune, Maharashtra',
    buyerType: 'Enterprise Customer',
    organization: 'Pune Dev Hub',
    preferredContact: 'Email'
  },
  {
    id: 'user-supplier-1',
    name: 'Fastparts Global (Seller)',
    email: 'fastpartsCorporate@example.com',
    password: 'password',
    role: 'supplier',
    verified: true,
    joinedDate: today,
    initials: 'FP',
    companyName: 'Fastparts Global',
    gstin: '33AABCF5678H1Z8',
    location: 'Chennai, Tamil Nadu',
    primaryCategories: 'Industrial & manufacturing'
  },
  {
    id: 'user-admin-1',
    name: 'Amit Kumar (Administrator)',
    email: 'chiefadmin@example.com',
    password: 'password',
    role: 'admin',
    verified: true,
    joinedDate: today,
    initials: 'AK'
  }
];

const requirements = [
  {
    id: 'req-1',
    title: 'Cloud Storage Infrastructure - 500 TB',
    category: 'IT / Technology',
    subcategory: 'Cloud infrastructure',
    quantity: '500 TB',
    budgetRange: 'INR 8,00,000 - INR 15,00,000',
    requiredBy: '2026-07-15',
    priority: 'High',
    location: 'Pan-India',
    specifications: 'Secure object storage, S3-compliant API, 99.99% durability SLA, high performance, ISO 9001 certified provider.',
    status: 'Open',
    createdAt: '2026-06-10',
    matchPercentage: 95,
    quotationsCount: 2,
    customerId: 'user-customer-1'
  },
  {
    id: 'req-2',
    title: 'Industrial Fasteners Q4',
    category: 'Industrial & manufacturing',
    subcategory: 'Fasteners',
    quantity: '50,000 units',
    budgetRange: 'INR 2,00,000 - INR 5,00,000',
    requiredBy: '2026-12-30',
    priority: 'Normal',
    location: 'Chennai, TN',
    specifications: 'High-tensile grade 8.8 bolts and nuts, ISO 9001 certified manufacturing, delivery to factory site.',
    status: 'Open',
    createdAt: '2026-06-12',
    matchPercentage: 78,
    quotationsCount: 1,
    customerId: 'user-customer-1'
  },
  {
    id: 'req-3',
    title: 'Last-Mile Delivery Services',
    category: 'Logistics',
    subcategory: 'Delivery routing',
    quantity: '12 active routes',
    budgetRange: 'INR 1,50,000/month',
    requiredBy: '2026-07-05',
    priority: 'Critical',
    location: 'Mumbai, MH',
    specifications: 'Daily last-mile shipping, temperature-controlled fleet required for some pharma parcels, real-time tracking dashboard.',
    status: 'Under review',
    createdAt: '2026-06-15',
    matchPercentage: 85,
    quotationsCount: 1,
    customerId: 'user-customer-1'
  },
  {
    id: 'req-4',
    title: 'Organic Produce Supply',
    category: 'Agriculture',
    subcategory: 'Fresh produce',
    quantity: '5 tonnes/month',
    budgetRange: 'INR 40,000/tonne',
    requiredBy: '2026-06-30',
    priority: 'Normal',
    location: 'Pune, MH',
    specifications: 'Certified organic vegetables, packed in eco-friendly crates, delivered in batches.',
    status: 'Open',
    createdAt: '2026-06-01',
    matchPercentage: 61,
    quotationsCount: 1,
    customerId: 'user-customer-1'
  }
];

const suppliers = [
  {
    id: 'sup-1',
    name: 'NexaSys Solutions',
    initials: 'NS',
    location: 'Pune, MH',
    rating: 4.8,
    qualityRating: 4.9,
    priceLevel: 'INR INR',
    matchPercent: 95,
    tags: ['ISO 9001', 'Pan-India', 'Enterprise'],
    experienceYears: 8,
    deliveryDays: 21,
    type: 'Service provider',
    verified: 'Approved',
    joinedDate: '2025-09-28',
    gstin: '27AABCF1234G1Z5',
    primaryCategories: 'IT & Cloud, Infrastructure services',
    certifications: 'ISO 9001:2015, AWS Certified Partner'
  },
  {
    id: 'sup-2',
    userId: 'user-supplier-1',
    name: 'Fastparts Global',
    initials: 'FP',
    location: 'Chennai, TN',
    rating: 4.7,
    qualityRating: 4.6,
    priceLevel: 'INR INR INR',
    matchPercent: 88,
    tags: ['ISO 9001', 'OEM Manufacturer'],
    experienceYears: 5,
    deliveryDays: 14,
    type: 'Manufacturer',
    verified: 'Approved',
    joinedDate: '2025-10-15',
    gstin: '33AABCF5678H1Z8',
    primaryCategories: 'Industrial & manufacturing, Precision components',
    certifications: 'ISO 9001, IATF 16949 certified'
  },
  {
    id: 'sup-3',
    name: 'VeloLog Network',
    initials: 'VL',
    location: 'Mumbai, MH',
    rating: 4.6,
    qualityRating: 4.4,
    priceLevel: 'INR',
    matchPercent: 85,
    tags: ['Pan-India', 'Logistics Partner'],
    experienceYears: 6,
    deliveryDays: 2,
    type: 'Service provider',
    verified: 'Approved',
    joinedDate: '2025-11-20',
    gstin: '27AABCV3344J2Z0',
    primaryCategories: 'Logistics, Express Cargo, Warehousing',
    certifications: 'GDP compliant, ISO 28000 security certification'
  },
  {
    id: 'sup-4',
    name: 'AgroVista Exports',
    initials: 'AG',
    location: 'Nagpur, MH',
    rating: 4.2,
    qualityRating: 4.3,
    priceLevel: 'INR',
    matchPercent: 61,
    tags: ['Organic', 'Direct Farmer'],
    experienceYears: 3,
    deliveryDays: 3,
    type: 'Dealer',
    verified: 'Pending',
    joinedDate: '2026-06-17',
    gstin: '27AABCV8899K1Z4',
    primaryCategories: 'Agriculture, Premium exports',
    certifications: 'APEDA certified, Organic India validation'
  },
  {
    id: 'sup-5',
    name: 'Rajan Constructions',
    initials: 'RK',
    location: 'Pune, MH',
    rating: 4.4,
    qualityRating: 4.5,
    priceLevel: 'INR INR',
    matchPercent: 92,
    tags: ['Real Estate', 'Turnkey interiors'],
    experienceYears: 10,
    deliveryDays: 45,
    type: 'Manufacturer',
    verified: 'Pending',
    joinedDate: '2026-06-18',
    gstin: '27AABCR4455G1Z9',
    primaryCategories: 'Real estate & construction, Turnkey solutions',
    certifications: 'RERA Registered, ISO 14001:2015'
  },
  {
    id: 'sup-6',
    name: 'PrimeTech Hardware',
    initials: 'PR',
    location: 'Hyderabad, TS',
    rating: 4.5,
    qualityRating: 4.4,
    priceLevel: 'INR INR',
    matchPercent: 88,
    tags: ['ISO Certification Pending', 'Enterprise Suppliers'],
    experienceYears: 4,
    deliveryDays: 7,
    type: 'Dealer',
    verified: 'Rejected',
    joinedDate: '2026-06-16',
    gstin: '36AABCP7788M2Z6',
    primaryCategories: 'IT Hardware, System supply',
    certifications: 'BIS certified pending renewal'
  }
];

const quotations = [
  {
    id: 'q-1',
    requirementId: 'req-1',
    requirementTitle: 'Cloud Storage Infrastructure - 500 TB',
    supplierId: 'sup-1',
    supplierName: 'NexaSys Solutions',
    supplierInitials: 'NS',
    price: 'INR 8,40,000',
    deliveryTime: '21 days',
    specifications: 'Enterprise-grade SSD pool, S3 SSEC enabled, 24/7 dedicated system engineer support.',
    status: 'New',
    submittedAt: '2026-06-19'
  },
  {
    id: 'q-2',
    requirementId: 'req-1',
    requirementTitle: 'Cloud Storage Infrastructure - 500 TB',
    supplierId: 'sup-6',
    supplierName: 'PrimeTech Hardware',
    supplierInitials: 'PR',
    price: 'INR 7,10,000',
    deliveryTime: '30 days',
    specifications: 'Hybrid array storage configuration, hardware encryption, redundant controllers, remote setup.',
    status: 'New',
    submittedAt: '2026-06-18'
  },
  {
    id: 'q-3',
    requirementId: 'req-3',
    requirementTitle: 'Last-Mile Delivery Services',
    supplierId: 'sup-3',
    supplierName: 'VeloLog Network',
    supplierInitials: 'VL',
    price: 'INR 1,80,000/month',
    deliveryTime: 'Same-day SLA',
    specifications: 'Daily routes across South Mumbai, live dashboard integration, 12 electric vans.',
    status: 'Reviewing',
    submittedAt: '2026-06-17'
  },
  {
    id: 'q-4',
    requirementId: 'req-2',
    requirementTitle: 'Industrial Fasteners Q4',
    supplierId: 'sup-2',
    supplierName: 'Fastparts Global',
    supplierInitials: 'FP',
    price: 'INR 3,20,000',
    deliveryTime: '14 days',
    specifications: '50k grade 8.8 bolts with high rust-resistance zinc coating.',
    status: 'Reviewing',
    submittedAt: '2026-06-15'
  }
];

const notifications = [
  {
    id: 'notif-1',
    title: 'New match - Cloud Storage',
    description: 'NexaSys Solutions matches at 95% threshold based on system guidelines.',
    time: '2 mins ago',
    type: 'success',
    read: false,
    role: 'customer'
  },
  {
    id: 'notif-2',
    title: 'Quotation received - Last-Mile Delivery',
    description: 'VeloLog Network submitted a quotation of INR 1,80,000/month.',
    time: '1 hour ago',
    type: 'info',
    read: false,
    role: 'customer'
  },
  {
    id: 'notif-3',
    title: 'New lead matched - Industrial Fasteners',
    description: 'Customer requirement for 50,000 units loaded. Review specifications.',
    time: '30 mins ago',
    type: 'success',
    read: false,
    role: 'supplier'
  },
  {
    id: 'notif-4',
    title: 'Pending Verification - AgroVista Exports',
    description: 'Waiting docs complete for 1 day. Immediate admin review recommended.',
    time: '1 day ago',
    type: 'alert',
    read: false,
    role: 'admin'
  }
];

const businessRules = [
  {
    id: 'rule-1',
    title: 'BR1',
    description: 'Suppliers must posses direct ownership, stock, manufacturing authority, distribution rights, brokerage authority, or service capability,',
    icon: 'UserCheck'
  },
  {
    id: 'rule-2',
    title: 'BR2',
    description: 'Supplier-to-Supplier lead forwarding is prohibited.',
    icon: 'ShieldAlert'
  },
  {
    id: 'rule-3',
    title: 'BR3',
    description: 'Fake supplier shall be permenently suspendeded.',
    icon: 'ShieldCheck'
  },
  {
    id: 'rule-4',
    title: 'BR4',
    description: 'Customer can select only one supplir for each requirement.',
    icon: 'Lock'
  },
  {
    id: 'rule-5',
    title: 'BR5',
    description: 'Customer may recieve multiple supplier responses.',
    icon: 'Activity'
  },
  {
    id: 'rule-6',
    title: 'BR6',
    description: 'Only verified suppliers may access requirements.',
    icon: 'Activity'
  }
];

module.exports = {
  demoUsers,
  requirements,
  suppliers,
  quotations,
  notifications,
  businessRules
};
