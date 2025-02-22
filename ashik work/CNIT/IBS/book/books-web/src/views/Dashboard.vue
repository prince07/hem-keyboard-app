<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="metric in metrics" :key="metric.title" 
           class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 class="text-gray-500 text-sm font-medium">{{ metric.title }}</h3>
        <div class="mt-2 flex items-baseline">
          <span class="text-3xl font-semibold">{{ formatCurrency(metric.value) }}</span>
          <span :class="['ml-2 text-sm', metric.change >= 0 ? 'text-green-600' : 'text-red-600']">
            {{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Revenue vs Expenses Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Revenue vs Expenses</h3>
        <canvas ref="revenueChart"></canvas>
      </div>

      <!-- Top Accounts Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Account Balances</h3>
        <canvas ref="accountsChart"></canvas>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">Recent Activity</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="activity in recentActivity" :key="activity.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(activity.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getActivityTypeClass(activity.type)
                  ]">
                    {{ activity.type }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ activity.description }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium" 
                    :class="activity.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(activity.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const auth = useAuthStore()
const revenueChart = ref(null)
const accountsChart = ref(null)

const metrics = ref([
  { title: 'Total Revenue', value: 0, change: 0 },
  { title: 'Total Expenses', value: 0, change: 0 },
  { title: 'Net Profit', value: 0, change: 0 },
  { title: 'Outstanding Receivables', value: 0, change: 0 }
])

const recentActivity = ref([])

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get activity type class
const getActivityTypeClass = (type: string) => {
  const classes = {
    'invoice': 'bg-blue-100 text-blue-800',
    'payment': 'bg-green-100 text-green-800',
    'expense': 'bg-red-100 text-red-800',
    'journal': 'bg-yellow-100 text-yellow-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    const [metricsRes, activityRes] = await Promise.all([
      axios.get('/api/reports/metrics', {
        headers: { Authorization: `Bearer ${auth.token}` }
      }),
      axios.get('/api/reports/recent-activity', {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
    ])

    metrics.value = metricsRes.data
    recentActivity.value = activityRes.data

    // Initialize charts
    initializeCharts(metricsRes.data)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

// Initialize charts
const initializeCharts = (data: any) => {
  // Revenue vs Expenses Chart
  if (revenueChart.value) {
    new Chart(revenueChart.value, {
      type: 'line',
      data: {
        labels: data.months,
        datasets: [
          {
            label: 'Revenue',
            data: data.revenue,
            borderColor: '#10B981',
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: data.expenses,
            borderColor: '#EF4444',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    })
  }

  // Account Balances Chart
  if (accountsChart.value) {
    new Chart(accountsChart.value, {
      type: 'doughnut',
      data: {
        labels: data.topAccounts.map((a: any) => a.name),
        datasets: [{
          data: data.topAccounts.map((a: any) => Math.abs(a.balance)),
          backgroundColor: [
            '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    })
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
