<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Stock Adjustment</h1>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Header Information -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="type"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date
              <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              v-model="date"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Reference
            </label>
            <input
              type="text"
              v-model="reference"
              placeholder="Reference number or description"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>

        <!-- Items Table -->
        <div class="mt-6">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in items" :key="index" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <select
                    v-model="item.product"
                    @change="handleProductChange($event, index)"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Item</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }}
                    </option>
                  </select>
                </td>
                <td class="px-6 py-4">
                  <input
                    type="number"
                    v-model.number="item.quantity"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    min="1"
                    required
                  >
                </td>
                <td class="px-6 py-4">
                  <select
                    v-model="item.reason"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Reason</option>
                    <option value="purchase">Purchase</option>
                    <option value="return">Return</option>
                    <option value="damage">Damage</option>
                    <option value="loss">Loss</option>
                    <option value="correction">Correction</option>
                    <option value="other">Other</option>
                  </select>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="mt-4">
            <button
              type="button"
              @click="addItem"
              class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900"
            >
              <i class="fas fa-plus mr-2"></i> Add Item
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            v-model="notes"
            rows="3"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes or comments..."
          ></textarea>
        </div>

        <!-- Submit Buttons -->
        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!isValid || loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Submit Adjustment
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import type { InventoryItem } from '@/types'

interface AdjustmentItem {
  product: string
  quantity: number
  reason: string
}

const router = useRouter()
const route = useRoute()
const inventoryStore = useInventoryStore()

const type = ref<'in' | 'out'>('in')
const date = ref(new Date().toISOString().split('T')[0])
const reference = ref('')
const notes = ref('')
const items = ref<AdjustmentItem[]>([{
  product: '',
  quantity: 0,
  reason: ''
}])

const products = ref<InventoryItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const isValid = computed(() => {
  return items.value.every(item => 
    item.product && 
    item.quantity > 0 && 
    item.reason
  ) && date.value && reference.value
})

async function fetchProducts() {
  try {
    const response = await fetch('/api/inventory/products')
    products.value = await response.json()
  } catch (err) {
    console.error('Error fetching products:', err)
  }
}

function handleProductChange(event: Event, index: number) {
  const select = event.target as HTMLSelectElement
  const productId = select.value
  const product = products.value.find(p => p.id === productId)
  
  if (product) {
    items.value[index] = {
      ...items.value[index],
      product: productId
    }
  }
}

function addItem() {
  items.value.push({
    product: '',
    quantity: 0,
    reason: ''
  })
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

async function handleSubmit() {
  if (!isValid.value) return
  
  try {
    loading.value = true
    await inventoryStore.adjustStock({
      type: type.value,
      date: date.value,
      reference: reference.value,
      notes: notes.value,
      items: items.value
    })
    router.push('/inventory')
  } catch (err) {
    error.value = 'Failed to submit stock adjustment'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchProducts()
  
  // If item ID is provided in query params, pre-fill the form
  const itemId = route.query.item as string
  if (itemId) {
    items.value[0].product = itemId
  }
})
</script>
