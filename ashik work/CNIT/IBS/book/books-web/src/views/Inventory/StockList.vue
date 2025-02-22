<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Inventory Management</h1>
      <div class="flex space-x-4">
        <button
          @click="exportStock"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <i class="fas fa-download mr-2"></i> Export
        </button>
        <router-link 
          to="/inventory/new" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          New Item
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="Search by item name or code..." 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select 
            v-model="filters.category" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Stock Level
          </label>
          <select 
            v-model="filters.stockLevel" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            <option value="excess">Excess Stock</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select 
            v-model="filters.status" 
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stock Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Item Code
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              In Stock
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reorder Level
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Price
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in showingItems" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
              <router-link :to="`/inventory/${item.id}`">
                {{ item.code }}
              </router-link>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.category }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
              <span :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-red-100 text-red-800': item.inStock <= item.reorderLevel,
                'bg-yellow-100 text-yellow-800': item.inStock > item.reorderLevel && item.inStock <= item.reorderLevel * 2,
                'bg-green-100 text-green-800': item.inStock > item.reorderLevel * 2
              }">
                {{ item.inStock }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
              {{ item.reorderLevel }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
              {{ formatCurrency(item.unitPrice) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span :class="{
                'px-2 py-1 text-xs font-medium rounded-full': true,
                'bg-green-100 text-green-800': item.status === 'active',
                'bg-gray-100 text-gray-800': item.status === 'inactive'
              }">
                {{ item.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="showActions(item)"
                class="text-gray-400 hover:text-gray-600"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-700">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} entries
          </div>
          <div class="flex space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Modal -->
    <div v-if="selectedItem" class="fixed inset-0 z-10 overflow-y-auto" @click.self="closeActions">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Item Actions
                </h3>
                <div class="space-y-2">
                  <button
                    @click="adjustStock"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Adjust Stock
                  </button>
                  <button
                    @click="viewHistory"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    View History
                  </button>
                  <button
                    @click="toggleStatus"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    {{ selectedItem.status === 'active' ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeActions"
              class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import type { InventoryItem } from '@/types'

const router = useRouter()
const inventoryStore = useInventoryStore()

const items = ref<InventoryItem[]>([])
const selectedItem = ref<InventoryItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const categories = ref<string[]>([])

const filters = ref({
  search: '',
  category: '',
  stockLevel: '',
  status: ''
})

const showingItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return items.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    const response = await inventoryStore.fetchItems()
    items.value = response.items
    totalItems.value = response.total
  } catch (err) {
    error.value = 'Failed to fetch inventory items'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const response = await fetch('/api/categories')
    categories.value = await response.json()
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

function showActions(item: InventoryItem) {
  selectedItem.value = item
}

function closeActions() {
  selectedItem.value = null
}

function adjustStock() {
  if (selectedItem.value) {
    router.push(`/inventory/adjustment?item=${selectedItem.value.id}`)
  }
}

function viewHistory() {
  if (selectedItem.value) {
    router.push(`/inventory/history/${selectedItem.value.id}`)
  }
}

async function toggleStatus() {
  if (!selectedItem.value) return
  
  try {
    await inventoryStore.updateItem(selectedItem.value.id, {
      status: selectedItem.value.status === 'active' ? 'inactive' : 'active'
    })
    await fetchItems()
    closeActions()
  } catch (err) {
    console.error('Error toggling status:', err)
  }
}

async function exportStock() {
  try {
    loading.value = true
    const response = await fetch('/api/inventory/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filters.value)
    })
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exporting inventory:', err)
  } finally {
    loading.value = false
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchItems()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchItems()
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Watch filters
watch(filters, () => {
  currentPage.value = 1
  fetchItems()
}, { deep: true })

// Initialize
onMounted(() => {
  fetchItems()
  fetchCategories()
})
</script>
