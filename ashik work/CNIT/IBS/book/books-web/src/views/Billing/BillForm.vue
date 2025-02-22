<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ isEditing ? 'Edit Purchase Invoice' : 'New Purchase Invoice' }}
      </h1>
      <div class="flex space-x-4">
        <button
          @click="saveDraft"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Save Draft
        </button>
        <button
          @click="printPreview"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Print Preview
        </button>
        <button
          @click="duplicateBill"
          v-if="isEditing"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Duplicate
        </button>
        <button
          @click="submitBill"
          :disabled="!isValid.value"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Header Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Number Series
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.numberSeries"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Series</option>
              <option v-for="series in numberSeries" :key="series.id" :value="series.id">
                {{ series.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Supplier
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.supplier"
              @change="handleSupplierChange"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Supplier</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Bill Date
              <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              v-model="form.date"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>

          <div v-if="isReturn.value">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Return Against
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.returnAgainst"
              @change="handleReturnInvoiceChange"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Invoice</option>
              <option v-for="invoice in returnableInvoices" :key="invoice.id" :value="invoice.id">
                {{ invoice.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Back Reference
            </label>
            <input
              type="text"
              v-model="form.backReference"
              placeholder="Supplier's invoice number"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in form.items" :key="index" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <select
                  v-model="item.product"
                  @change="handleProductChange($event, index)"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Product</option>
                  <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }}
                  </option>
                </select>
              </td>
              <td class="px-6 py-4">
                <input
                  type="number"
                  v-model.number="item.quantity"
                  @input="calculateItemAmount(index)"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  min="0"
                  step="0.01"
                  required
                >
              </td>
              <td class="px-6 py-4">
                <input
                  type="number"
                  v-model.number="item.rate"
                  @input="calculateItemAmount(index)"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  min="0"
                  step="0.01"
                  required
                >
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                  <input
                    type="number"
                    v-model.number="item.discountPercent"
                    @input="calculateItemAmount(index)"
                    class="w-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    min="0"
                    max="100"
                    step="0.01"
                  >
                  <span class="text-gray-500">%</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <select
                  v-model="item.tax"
                  @change="calculateItemAmount(index)"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Tax</option>
                  <option v-for="tax in taxes" :key="tax.id" :value="tax.id">
                    {{ tax.name }} ({{ tax.rate }}%)
                  </option>
                </select>
              </td>
              <td class="px-6 py-4 text-right">
                {{ formatCurrency(item.amount) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="removeItem(index)"
                  class="text-red-600 hover:text-red-900"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <button
                  @click="openBatchModal(index)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  <i class="fas fa-boxes"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td colspan="7" class="px-6 py-4">
                <button
                  @click="addItem"
                  type="button"
                  class="text-blue-600 hover:text-blue-900"
                >
                  <i class="fas fa-plus mr-2"></i>
                  Add Item
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Totals -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="space-y-4">
          <div class="flex justify-end items-center space-x-4">
            <span class="text-gray-700">Net Total:</span>
            <span class="text-lg font-medium">{{ formatCurrency(netTotal) }}</span>
          </div>
          <div class="flex justify-end items-center space-x-4">
            <span class="text-gray-700">Total Tax:</span>
            <span class="text-lg font-medium">{{ formatCurrency(totalTax) }}</span>
          </div>
          <div class="flex justify-end items-center space-x-4">
            <span class="text-gray-700">Grand Total:</span>
            <span class="text-xl font-semibold">{{ formatCurrency(grandTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- Additional Settings -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="form.autoCreateStock"
              id="autoCreateStock"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="autoCreateStock" class="text-sm text-gray-700">
              Automatically create stock entry on submission
            </label>
          </div>
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="form.isReturn"
              id="isReturn"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="isReturn" class="text-sm text-gray-700">
              This is a return invoice
            </label>
          </div>
        </div>
      </div>
    </form>
  </div>

  <!-- Batch Selection Modal -->
  <div v-if="showBatchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
      <h3 class="text-lg font-medium mb-4">Select Batch</h3>
      <div class="max-h-96 overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available Qty</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Select</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="batch in selectedProductBatches" :key="batch.id">
              <td class="px-6 py-4">{{ batch.name }}</td>
              <td class="px-6 py-4 text-right">{{ batch.quantity }}</td>
              <td class="px-6 py-4 text-right">{{ formatDate(batch.expiryDate) }}</td>
              <td class="px-6 py-4 text-right">
                <input
                  type="number"
                  v-model.number="batch.selectedQuantity"
                  class="w-24 px-2 py-1 border rounded"
                  :max="batch.quantity"
                  min="0"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex justify-end space-x-4">
        <button
          @click="closeBatchModal"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          @click="confirmBatchSelection"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { debounce } from 'lodash'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

// State
const form = ref({
  numberSeries: '',
  supplier: '',
  date: new Date().toISOString().split('T')[0],
  backReference: '',
  returnAgainst: '',
  items: [],
  autoCreateStock: true,
  isReturn: false
})

const numberSeries = ref([])
const suppliers = ref([])
const products = ref([])
const taxes = ref([])
const returnableInvoices = ref([])
const loading = ref(false)
const error = ref(null)

const isEditing = computed(() => route.params.id !== undefined)
const isReturn = computed(() => form.value.isReturn)

// Additional refs
const showBatchModal = ref(false)
const selectedProductBatches = ref([])
const currentItemIndex = ref(null)
const autoSaveTimeout = ref(null)

// Utility functions
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US')
}

const getSupplierName = (supplierId) => {
  const supplier = suppliers.value.find(s => s.id === supplierId)
  return supplier ? supplier.name : ''
}

const getProductName = (productId) => {
  const product = products.value.find(p => p.id === productId)
  return product ? product.name : ''
}

const getTaxName = (taxId) => {
  const tax = taxes.value.find(t => t.id === taxId)
  return tax ? tax.name : ''
}

// Computed properties
const netTotal = computed(() => {
  return form.value.items.reduce((total, item) => total + (item.amount || 0), 0)
})

const totalTax = computed(() => {
  return form.value.items.reduce((total, item) => {
    const tax = taxes.value.find(t => t.id === item.tax)
    if (tax && item.amount) {
      return total + (item.amount * (tax.rate / 100))
    }
    return total
  }, 0)
})

const grandTotal = computed(() => {
  return netTotal.value + totalTax.value
})

const isValid = computed(() => {
  return form.value.numberSeries &&
         form.value.supplier &&
         form.value.date &&
         form.value.items.length > 0 &&
         form.value.items.every(item => item.product && item.quantity > 0 && item.rate > 0)
})

// Methods
const calculateItemAmount = (index) => {
  const item = form.value.items[index]
  if (!item) return
  const baseAmount = (item.quantity || 0) * (item.rate || 0)
  const discountAmount = baseAmount * ((item.discountPercent || 0) / 100)
  item.amount = baseAmount - discountAmount
}

const addItem = () => {
  form.value.items.push({
    product: '',
    quantity: 1,
    rate: 0,
    discountPercent: 0,
    tax: '',
    amount: 0
  })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const saveDraft = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await api.post('/purchase-invoices', form.value)
    if (!isEditing.value) {
      router.replace({ name: 'EditBill', params: { id: response.data.id } })
    }
    return response.data
  } catch (err) {
    console.error('Error saving draft:', err)
    error.value = err.response?.data?.message || 'Failed to save draft'
    throw err
  } finally {
    loading.value = false
  }
}

const submitBill = async () => {
  try {
    loading.value = true
    error.value = null
    const draft = await saveDraft()
    await api.post(`/purchase-invoices/${draft.id}/submit`)
    router.push({ name: 'Bills' })
  } catch (err) {
    console.error('Error submitting bill:', err)
    error.value = err.response?.data?.message || 'Failed to submit bill'
  } finally {
    loading.value = false
  }
}

const handleSubmit = () => {
  if (isValid.value) {
    submitBill()
  }
}

// Initialize data
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    await Promise.all([
      fetchNumberSeries(),
      fetchSuppliers(),
      fetchProducts(),
      fetchTaxes()
    ])
    
    if (route.params.id) {
      await fetchBill()
    } else {
      // Add an empty item for new bills
      addItem()
    }
  } catch (err) {
    console.error('Error initializing form:', err)
    error.value = err.response?.data?.message || 'Failed to initialize form'
  } finally {
    loading.value = false
  }
})

// Watch for form changes to recalculate amounts
watch(() => form.value.items, () => {
  form.value.items.forEach((_, index) => calculateItemAmount(index))
}, { deep: true })
</script>
