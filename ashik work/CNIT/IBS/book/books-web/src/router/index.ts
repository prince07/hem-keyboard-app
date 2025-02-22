import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authService } from '../services/api';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pos',
    name: 'Point of Sale',
    component: () => import('../views/POS.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: () => import('../views/Invoicing/InvoiceList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices/new',
    name: 'New Invoice',
    component: () => import('../views/Invoicing/InvoiceForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bills',
    name: 'Bills',
    component: () => import('../views/Billing/BillList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bills/new',
    name: 'NewBill',
    component: () => import('../views/Billing/BillForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bills/:id',
    name: 'EditBill',
    component: () => import('../views/Billing/BillForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('../views/Payments/PaymentList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/journal-entries',
    name: 'Journal Entries',
    component: () => import('../views/JournalEntries/JournalEntryList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/general-ledger',
    name: 'General Ledger',
    component: () => import('../views/Reports/GeneralLedger.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/profit-loss',
    name: 'Profit & Loss',
    component: () => import('../views/Reports/ProfitLoss.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/balance-sheet',
    name: 'Balance Sheet',
    component: () => import('../views/Reports/BalanceSheet.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/trial-balance',
    name: 'Trial Balance',
    component: () => import('../views/Reports/TrialBalance.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = !!authService.getCurrentUser();
  
  // If the route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }
  
  // If user is authenticated and trying to access login page
  if (isAuthenticated && to.path === '/login') {
    next('/dashboard');
    return;
  }

  next();
});

export default router;
