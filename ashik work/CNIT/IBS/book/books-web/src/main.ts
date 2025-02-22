import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './index.css'

// Views
import Dashboard from './views/Dashboard.vue'
import POS from './views/POS.vue'
import BillList from './views/Billing/BillList.vue'
import BillForm from './views/Billing/BillForm.vue'
import InvoiceList from './views/Invoicing/InvoiceList.vue'
import InvoiceForm from './views/Invoicing/InvoiceForm.vue'
import PaymentList from './views/Payments/PaymentList.vue'
import PaymentForm from './views/Payments/PaymentForm.vue'
import Accounts from './views/Accounts.vue'
import Parties from './views/Parties.vue'
import JournalEntryList from './views/JournalEntries/JournalEntryList.vue'
import JournalEntryView from './views/JournalEntries/JournalEntryView.vue'
import Transactions from './views/Transactions.vue'
import StockList from './views/Inventory/StockList.vue'
import StockAdjustment from './views/Inventory/StockAdjustment.vue'
import Reports from './views/Reports.vue'
import BalanceSheet from './views/Reports/BalanceSheet.vue'
import ProfitAndLoss from './views/Reports/ProfitAndLoss.vue'
import GeneralLedger from './views/Reports/GeneralLedger.vue'
import TrialBalance from './views/Reports/TrialBalance.vue'
import AccountingSettings from './views/Settings/AccountingSettings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/pos',
      name: 'POS',
      component: POS,
    },
    {
      path: '/billing',
      name: 'BillList',
      component: BillList,
    },
    {
      path: '/billing/create',
      name: 'NewBill',
      component: BillForm,
    },
    {
      path: '/billing/edit/:id',
      name: 'EditBill',
      component: BillForm,
    },
    {
      path: '/invoicing/list',
      name: 'InvoiceList',
      component: InvoiceList,
    },
    {
      path: '/invoicing/new',
      name: 'NewInvoice',
      component: InvoiceForm,
    },
    {
      path: '/invoicing/edit/:id',
      name: 'EditInvoice',
      component: InvoiceForm,
    },
    {
      path: '/payments/list',
      name: 'PaymentList',
      component: PaymentList,
    },
    {
      path: '/payments/new',
      name: 'NewPayment',
      component: PaymentForm,
    },
    {
      path: '/payments/edit/:id',
      name: 'EditPayment',
      component: PaymentForm,
    },
    {
      path: '/accounts',
      name: 'Accounts',
      component: Accounts,
    },
    {
      path: '/parties',
      name: 'Parties',
      component: Parties,
    },
    {
      path: '/journal-entries/list',
      name: 'JournalEntryList',
      component: JournalEntryList,
    },
    {
      path: '/journal-entries/view/:id',
      name: 'JournalEntryView',
      component: JournalEntryView,
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions,
    },
    {
      path: '/inventory/stock',
      name: 'StockList',
      component: StockList,
    },
    {
      path: '/inventory/new',
      name: 'NewStock',
      component: StockList,
    },
    {
      path: '/inventory/adjustment',
      name: 'StockAdjustment',
      component: StockAdjustment,
    },
    {
      path: '/reports',
      name: 'Reports',
      component: Reports,
    },
    {
      path: '/reports/balance-sheet',
      name: 'BalanceSheet',
      component: BalanceSheet,
    },
    {
      path: '/reports/profit-loss',
      name: 'ProfitAndLoss',
      component: ProfitAndLoss,
    },
    {
      path: '/reports/general-ledger',
      name: 'GeneralLedger',
      component: GeneralLedger,
    },
    {
      path: '/reports/trial-balance',
      name: 'TrialBalance',
      component: TrialBalance,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: AccountingSettings,
    },
  ],
})

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.mount('#app')
