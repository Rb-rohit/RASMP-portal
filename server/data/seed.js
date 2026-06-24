const demoUsers = [];
const requirements = [];
const suppliers = [];
const quotations = [];
const notifications = [];

const businessRules = [
  {
    id: 'rule-1',
    title: 'BR1',
    description: 'Suppliers must possess direct ownership, stock, manufacturing authority, distribution rights, brokerage authority, or service capability.',
    icon: 'UserCheck'
  },
  {
    id: 'rule-2',
    title: 'BR2',
    description: 'Supplier-to-supplier lead forwarding is prohibited.',
    icon: 'ShieldAlert'
  },
  {
    id: 'rule-3',
    title: 'BR3',
    description: 'Fake suppliers shall be permanently suspended.',
    icon: 'ShieldCheck'
  },
  {
    id: 'rule-4',
    title: 'BR4',
    description: 'Customers can select only one supplier for each requirement.',
    icon: 'Lock'
  },
  {
    id: 'rule-5',
    title: 'BR5',
    description: 'Customers may receive multiple supplier responses.',
    icon: 'Activity'
  },
  {
    id: 'rule-6',
    title: 'BR6',
    description: 'Only verified suppliers may access requirements.',
    icon: 'Activity'
  }
];

const categories = [
  {
    id: 'cat-1',
    name: 'IT / Technology',
    description: 'Cloud, software, hardware, security, and digital infrastructure.',
    status: 'Active'
  },
  {
    id: 'cat-2',
    name: 'Industrial & manufacturing',
    description: 'Factory components, raw materials, machinery, and production services.',
    status: 'Active'
  },
  {
    id: 'cat-3',
    name: 'Logistics',
    description: 'Transportation, warehousing, delivery routing, and supply chain services.',
    status: 'Active'
  },
  {
    id: 'cat-4',
    name: 'Agriculture',
    description: 'Produce, agri-inputs, farm services, and organic supply.',
    status: 'Active'
  },
  {
    id: 'cat-5',
    name: 'Real estate & construction',
    description: 'Construction, interiors, fit-out, and civil works.',
    status: 'Active'
  },
  {
    id: 'cat-6',
    name: 'Professional services',
    description: 'Staffing, consulting, HR, compliance, and business support.',
    status: 'Active'
  }
];

const legacyDemoIds = {
  userIds: ['user-customer-1', 'user-supplier-1', 'user-admin-1'],
  requirementIds: ['req-1', 'req-2', 'req-3', 'req-4'],
  supplierIds: ['sup-1', 'sup-2', 'sup-3', 'sup-4', 'sup-5', 'sup-6'],
  quotationIds: ['q-1', 'q-2', 'q-3', 'q-4'],
  notificationIds: ['notif-1', 'notif-2', 'notif-3', 'notif-4']
};

module.exports = {
  demoUsers,
  requirements,
  suppliers,
  quotations,
  notifications,
  businessRules,
  categories,
  legacyDemoIds
};
