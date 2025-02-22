<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ isEditing ? 'Edit Payment' : 'New Payment' }}
      </h1>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Payment Type
            <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.type"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Type</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Payment Date
            <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            v-model="form.date"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reference No.
          </label>
          <input
            type="text"
            v-model="form.reference"
            placeholder="Reference number"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Party
            <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.party"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Party</option>
            <option v-for="party in parties" :key="party.id" :value="party.id">
              {{ party.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Amount
            <span class="text-red-500">*</span>
          </label>
          <input
            type="number"
            v-model="form.amount"
            step="0.01"
            min="0"
            placeholder="Enter amount"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>
      </div>

      <div v-if="form.type === 'cheque'" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cheque Number
            <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.chequeNumber"
            placeholder="Enter cheque number"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Bank Name
            <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="form.bankName"
            placeholder="Enter bank name"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Bank Branch
          </label>
          <input
            type="text"
            v-model="form.bankBranch"
            placeholder="Enter bank branch"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cheque Date
            <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            v-model="form.chequeDate"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Clearance Date
          </label>
          <input
            type="date"
            v-model="form.clearanceDate"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Clearance Date
          </label>
          <input
            type="date"
            v-model="form.clearanceDate"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            v-model="form.status"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="Enter any additional notes"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="router.back()"
          class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Payment, Party } from '@/types'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const isEditing = computed(() => route.params.id !== undefined)

interface PaymentForm extends Omit<Payment, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

const form = ref<PaymentForm>({
  type: 'cash',
  date: new Date().toISOString().split('T')[0],
  party: '',
  amount: 0,
  reference: '',
  notes: '',
  chequeNumber: '',
  chequeDate: '',
  clearanceDate: '',
  bankName: '',
  bankBranch: '',
  status: 'draft'
})

const parties = ref<Party[]>([])

async function fetchParties() {
  try {
    const response = await fetch('/api/parties')
    const data = await response.json()
    parties.value = data
  } catch (error) {
    console.error('Error fetching parties:', error)
  }
}

async function fetchPayment(id: string) {
  try {
    loading.value = true
    const response = await fetch(`/api/payments/${id}`)
    const payment = await response.json()
    
    // Map payment data to form
    Object.keys(form.value).forEach(key => {
      if (key in payment) {
        form.value[key as keyof PaymentForm] = payment[key]
      }
    })
  } catch (error) {
    console.error('Error fetching payment:', error)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  try {
    loading.value = true
    const url = isEditing.value 
      ? `/api/payments/${route.params.id}` 
      : '/api/payments'
    
    const method = isEditing.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (!response.ok) {
      throw new Error('Failed to save payment')
    }

    router.push('/payments')
  } catch (error) {
    console.error('Error saving payment:', error)
    // TODO: Show error message to user
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchParties()
  if (isEditing.value && route.params.id) {
    await fetchPayment(route.params.id as string)
  }
})
</script>
