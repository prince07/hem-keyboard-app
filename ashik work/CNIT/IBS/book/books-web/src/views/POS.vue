<template>
  <div class="h-screen flex">
    <!-- Left Panel: Product Selection -->
    <div class="w-2/3 bg-gray-50 p-6 flex flex-col">
      <!-- Search and Category Filter -->
      <div class="mb-6 flex space-x-4">
        <div class="flex-1">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products..."
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div class="w-48">
          <select
            v-model="selectedCategory"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="flex-1 overflow-auto">
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            @click="addToCart(product)"
            class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div class="aspect-w-1 aspect-h-1 mb-4">
              <img
                :src="product.image || '/placeholder.png'"
                :alt="product.name"
                class="w-full h-full object-cover rounded-lg"
              >
            </div>
            <h3 class="font-medium text-gray-900 mb-1">{{ product.name }}</h3>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">{{ formatCurrency(product.price) }}</span>
              <span class="text-sm text-gray-500">Stock: {{ product.stock }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Cart -->
    <div class="w-1/3 bg-white border-l flex flex-col">
      <!-- Customer Selection -->
      <div class="p-4 border-b">
        <select
          v-model="selectedCustomer"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Walk-in Customer</option>
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </option>
        </select>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-auto p-4">
        <div v-if="cart.items.length === 0" class="text-center text-gray-500 mt-8">
          Cart is empty
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="(item, index) in cart.items"
            :key="index"
            class="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
          >
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
              <p class="text-sm text-gray-500">{{ formatCurrency(item.price) }} each</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="decrementQuantity(index)"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <i class="fas fa-minus"></i>
              </button>
              <span class="w-12 text-center">{{ item.quantity }}</span>
              <button
                @click="incrementQuantity(index)"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="text-right">
              <div class="font-medium text-gray-900">
                {{ formatCurrency(item.price * item.quantity) }}
              </div>
              <button
                @click="removeFromCart(index)"
                class="text-red-600 hover:text-red-800"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div class="border-t p-4 space-y-4">
        <div class="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{{ formatCurrency(cart.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>Tax ({{ taxRate }}%)</span>
          <span>{{ formatCurrency(cart.tax) }}</span>
        </div>
        <div class="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{{ formatCurrency(cart.total) }}</span>
        </div>

        <!-- Payment Method -->
        <select
          v-model="paymentMethod"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Payment Method</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
        </select>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            @click="clearCart"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
          <button
            @click="processPayment"
            :disabled="!canCheckout"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Pay
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <i class="fas fa-check text-green-600"></i>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Payment Successful
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    The payment has been processed successfully. Would you like to print the receipt?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="printReceipt"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Print Receipt
            </button>
            <button
              @click="closeSuccessModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '@/composables/auth'

const auth = useAuth()

// State
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedCustomer = ref('')
const paymentMethod = ref('')
const showSuccessModal = ref(false)
const taxRate = 5 // This could be fetched from settings

// Data
const categories = ref([])
const products = ref([])
const customers = ref([])
const cart = ref({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0
})

// Computed
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || product.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const canCheckout = computed(() => {
  return cart.value.items.length > 0 && paymentMethod.value
})

// Methods
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categories', {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchProducts = async () => {
  try {
    const response = await axios.get('/api/products', {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    products.value = response.data
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const fetchCustomers = async () => {
  try {
    const response = await axios.get('/api/parties', {
      params: { type: 'customer' },
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    customers.value = response.data
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
}

const addToCart = (product) => {
  const existingItem = cart.value.items.find(item => item.id === product.id)
  if (existingItem) {
    incrementQuantity(cart.value.items.indexOf(existingItem))
  } else {
    cart.value.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    })
  }
  updateCartTotals()
}

const removeFromCart = (index) => {
  cart.value.items.splice(index, 1)
  updateCartTotals()
}

const incrementQuantity = (index) => {
  cart.value.items[index].quantity++
  updateCartTotals()
}

const decrementQuantity = (index) => {
  if (cart.value.items[index].quantity > 1) {
    cart.value.items[index].quantity--
    updateCartTotals()
  } else {
    removeFromCart(index)
  }
}

const updateCartTotals = () => {
  cart.value.subtotal = cart.value.items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  )
  cart.value.tax = (cart.value.subtotal * taxRate) / 100
  cart.value.total = cart.value.subtotal + cart.value.tax
}

const clearCart = () => {
  cart.value.items = []
  updateCartTotals()
}

const processPayment = async () => {
  try {
    const sale = {
      customer: selectedCustomer.value,
      paymentMethod: paymentMethod.value,
      items: cart.value.items,
      subtotal: cart.value.subtotal,
      tax: cart.value.tax,
      total: cart.value.total
    }

    await axios.post('/api/sales', sale, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })

    showSuccessModal.value = true
  } catch (error) {
    console.error('Error processing payment:', error)
  }
}

const printReceipt = () => {
  // Implement receipt printing logic
  window.print()
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  clearCart()
  paymentMethod.value = ''
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Initial load
onMounted(() => {
  Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchCustomers()
  ])
})
</script>
