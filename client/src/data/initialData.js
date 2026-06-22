export const initialRequirements = [
  {
    id: 'req-1',
    title: 'Cloud Storage Infrastructure — 500 TB',
    category: 'IT / Technology',
    subcategory: 'Cloud infrastructure',
    quantity: '500 TB',
    budgetRange: '₹8,00,000 - ₹15,00,000',
    requiredBy: '2026-07-15',
    priority: 'High',
    location: 'Pan-India',
    specifications: 'Secure object storage, S3-compliant API, 99.99% durability SLA, high performance, ISO 9001 certified provider.',
    status: 'Matched',
    createdAt: '2026-06-10',
    matchPercentage: 95,
    quotationsCount: 2
  },
  {
    id: 'req-2',
    title: 'Industrial Fasteners Q4',
    category: 'Industrial & manufacturing',
    subcategory: 'Fasteners',
    quantity: '50,000 units',
    budgetRange: '₹2,00,000 - ₹5,00,000',
    requiredBy: '2026-12-30',
    priority: 'Normal',
    location: 'Chennai, TN',
    specifications: 'High-tensile grade 8.8 bolts and nuts, ISO 9001 certified manufacturing, delivery to factory site.',
    status: 'Open',
    createdAt: '2026-06-12',
    matchPercentage: 78,
    quotationsCount: 1
  },
  {
    id: 'req-3',
    title: 'Last-Mile Delivery Services',
    category: 'Logistics',
    subcategory: 'Delivery routing',
    quantity: '12 active routes',
    budgetRange: '₹1,50,000/month',
    requiredBy: '2026-07-05',
    priority: 'Critical',
    location: 'Mumbai, MH',
    specifications: 'Daily last-mile shipping, temperature-controlled fleet required for some pharma parcels, real-time tracking dashboard.',
    status: 'In review',
    createdAt: '2026-06-15',
    matchPercentage: 85,
    quotationsCount: 1
  },
  {
    id: 'req-4',
    title: 'Organic Produce Supply',
    category: 'Agriculture',
    subcategory: 'Fresh produce',
    quantity: '5 tonnes/month',
    budgetRange: '₹40,000/tonne',
    requiredBy: '2026-06-30',
    priority: 'Normal',
    location: 'Pune, MH',
    specifications: 'Certified organic vegetables (potatoes, onions, tomatoes), packed in eco-friendly crates, delivered in batches.',
    status: 'Open',
    createdAt: '2026-06-01',
    matchPercentage: 61,
    quotationsCount: 1
  },
  {
    id: 'req-5',
    title: 'Contract Staffing — 8 Tech positions',
    category: 'Professional services',
    subcategory: 'HR/Staffing',
    quantity: '8 positions',
    budgetRange: '₹6,00,000/month',
    requiredBy: '2026-07-01',
    priority: 'High',
    location: 'Bengaluru, KA',
    specifications: 'Contract developers proficient in React, NodeJS, and Python for 6-month extendable term.',
    status: 'Open',
    createdAt: '2026-06-14',
    matchPercentage: 88,
    quotationsCount: 0
  },
  {
    id: 'req-6',
    title: 'Office Fit-Out — Pune HQ 8,000 sqft',
    category: 'Real estate & construction',
    subcategory: 'Office interior design',
    quantity: '8,000 sqft',
    budgetRange: '₹30,00,000 - ₹50,00,000',
    requiredBy: '2026-08-10',
    priority: 'Normal',
    location: 'Pune, MH',
    specifications: 'Premium layout interior designing, wiring, custom bento breakout zones, eco-friendly materials.',
    status: 'Open',
    createdAt: '2026-06-18',
    matchPercentage: 92,
    quotationsCount: 0
  },
  {
    id: 'req-7',
    title: 'Hardware Procurement — 40 units',
    category: 'IT / Technology',
    subcategory: 'Laptops and systems',
    quantity: '40 developer setups',
    budgetRange: '₹8,00,000 - ₹12,00,000',
    requiredBy: '2026-06-02',
    priority: 'High',
    location: 'Hyderabad, TS',
    specifications: '40 lightweight laptops with 32GB RAM, 1TB SSD, 3-year on-site warranty support.',
    status: 'Closed',
    createdAt: '2026-05-15',
    matchPercentage: 95,
    quotationsCount: 1
  }
];

export const initialSuppliers = [
  {
    id: 'sup-1',
    name: 'NexaSys Solutions',
    initials: 'NS',
    location: 'Pune, MH',
    rating: 4.8,
    qualityRating: 4.9,
    priceLevel: '₹₹',
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
    name: 'Fastparts Global',
    initials: 'FP',
    location: 'Chennai, TN',
    rating: 4.7,
    qualityRating: 4.6,
    priceLevel: '₹₹₹',
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
    priceLevel: '₹',
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
    priceLevel: '₹',
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
    priceLevel: '₹₹',
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
    priceLevel: '₹₹',
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

export const initialQuotations = [
  {
    id: 'q-1',
    requirementId: 'req-1',
    requirementTitle: 'Cloud Storage Infrastructure — 500 TB',
    supplierId: 'sup-1',
    supplierName: 'NexaSys Solutions',
    supplierInitials: 'NS',
    price: '₹8,40,000',
    deliveryTime: '21 days',
    specifications: 'Enterprise-grade SSD pool, S3 SSEC enabled, 24/7 dedicated system engineer support, full performance audit reports.',
    status: 'New',
    submittedAt: '2026-06-19'
  },
  {
    id: 'q-2',
    requirementId: 'req-1',
    requirementTitle: 'Cloud Storage Infrastructure — 500 TB',
    supplierId: 'sup-6',
    supplierName: 'PrimeTech Hardware',
    supplierInitials: 'PR',
    price: '₹7,10,000',
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
    price: '₹1,80,000/month',
    deliveryTime: 'Same-day SLA',
    specifications: 'Daily routes across South Mumbai, live dashboard integration, 12 electric vans custom fitted with dry ice cold packs.',
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
    price: '₹3,20,000',
    deliveryTime: '14 days',
    specifications: '50k grade 8.8 bolts with high rust-resistance zinc coating, standard shipping included directly to Chennai assembly hub.',
    status: 'Reviewing',
    submittedAt: '2026-06-15'
  }
];

export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'New match — Cloud Storage',
    description: 'NexaSys Solutions matches at 95% threshold based on system guidelines.',
    time: '2 mins ago',
    type: 'success',
    read: false,
    role: 'customer'
  },
  {
    id: 'notif-2',
    title: 'Quotation received — Last-Mile Delivery',
    description: 'VeloLog Network submitted a quotation of ₹1,80,000/month.',
    time: '1 hour ago',
    type: 'info',
    read: false,
    role: 'customer'
  },
  {
    id: 'notif-3',
    title: 'New lead matched — Industrial Fasteners',
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
  },
  {
    id: 'notif-5',
    title: 'Match rate dip — Agriculture category',
    description: 'Coverage dipped to 61% with only 4 verified active suppliers.',
    time: '3 hours ago',
    type: 'warning',
    read: false,
    role: 'admin'
  }
];

export const businessRules = [
  {
    id: 'rule-1',
    title: 'Direct Ownership Enforced',
    description: 'Only the original requirement poster can modify, archive, or award a contract. Inter-account proxy actions are strictly forbidden.',
    icon: 'UserCheck'
  },
  {
    id: 'rule-2',
    title: 'No Lead Forwarding',
    description: 'Supplier contacts are kept secure. Communication, bids, and chat occurs entirely within the platform to protect data privacy.',
    icon: 'ShieldAlert'
  },
  {
    id: 'rule-3',
    title: 'Three-Step Onboarding',
    description: 'All commercial accounts undergo MFA verification, official business certificate validation, and physical/digital admin approval.',
    icon: 'ShieldCheck'
  },
  {
    id: 'rule-4',
    title: 'Approved Access Only',
    description: 'Pending or rejected supplier accounts are restricted to view-only mode. Bidding, quotation submissions, and contact sharing require admin approval.',
    icon: 'Lock'
  },
  {
    id: 'rule-5',
    title: 'Single Supplier Selection',
    description: 'A posted requirement terminates when exactly one quotation is accepted. Partial award splitting is disabled by default.',
    icon: 'Activity'
  }
];
