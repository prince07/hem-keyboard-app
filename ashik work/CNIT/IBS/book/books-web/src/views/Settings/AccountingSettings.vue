<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Accounting Settings</h1>
      <button 
        @click="saveSettings" 
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Save Settings
      </button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-6 space-y-8">
        <!-- Company Information -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                type="text"
                v-model="settings.fullname"
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input 
                type="text"
                v-model="settings.companyName"
                required
                readonly
                class="w-full px-4 py-2 border rounded-lg bg-gray-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input 
                type="text"
                v-model="settings.bankName"
                required
                readonly
                class="w-full px-4 py-2 border rounded-lg bg-gray-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input 
                type="text"
                v-model="settings.country"
                required
                readonly
                class="w-full px-4 py-2 border rounded-lg bg-gray-50"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input 
                type="email"
                v-model="settings.email"
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>
        </div>

        <!-- Account Settings -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Write Off Account
              </label>
              <select 
                v-model="settings.writeOffAccount"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Round Off Account
              </label>
              <select 
                v-model="settings.roundOffAccount"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Discount Account
              </label>
              <select 
                v-model="settings.discountAccount"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Account</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">Features</h2>
          <div class="space-y-4">
            <div class="flex items-center">
              <input 
                type="checkbox"
                v-model="settings.enableDiscounting"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">
                Enable Discount Accounting
              </label>
            </div>
            <div class="flex items-center">
              <input 
                type="checkbox"
                v-model="settings.enableInventory"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">
                Enable Inventory
              </label>
            </div>
            <div class="flex items-center">
              <input 
                type="checkbox"
                v-model="settings.enablePriceList"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">
                Enable Price List
              </label>
            </div>
            <div class="flex items-center">
              <input 
                type="checkbox"
                v-model="settings.enableInvoiceReturns"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">
                Enable Invoice Returns
              </label>
            </div>
            <div class="flex items-center">
              <input 
                type="checkbox"
                v-model="settings.enableFormCustomization"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">
                Enable Form Customization
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const auth = useAuthStore()

const settings = ref({
  fullname: '',
  companyName: '',
  bankName: '',
  country: '',
  email: '',
  writeOffAccount: '',
  roundOffAccount: '',
  discountAccount: '',
  enableDiscounting: false,
  enableInventory: false,
  enablePriceList: false,
  enableInvoiceReturns: false,
  enableFormCustomization: false
})

const accounts = ref([])

const fetchSettings = async () => {
  try {
    const response = await axios.get('/api/accounting-settings', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    settings.value = response.data
  } catch (error) {
    console.error('Error fetching accounting settings:', error)
  }
}

const fetchAccounts = async () => {
  try {
    const response = await axios.get('/api/accounts', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    accounts.value = response.data
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

const saveSettings = async () => {
  try {
    await axios.put('/api/accounting-settings', settings.value, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    // Show success message
  } catch (error) {
    console.error('Error saving accounting settings:', error)
    // Show error message
  }
}

onMounted(() => {
  fetchSettings()
  fetchAccounts()
})
</script>
