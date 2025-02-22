<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Journal Entries</h1>
      <button 
        @click="showNewEntry = true"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        New Journal Entry
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Search entries..." 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select 
          v-model="filters.status" 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
        </select>
        <input 
          type="date" 
          v-model="filters.dateFrom" 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <input 
          type="date" 
          v-model="filters.dateTo" 
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Entry Type
          </label>
          <select 
            v-model="filters.entryType"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Journal Entry">Journal Entry</option>
            <option value="Bank Entry">Bank Entry</option>
            <option value="Cash Entry">Cash Entry</option>
            <option value="Credit Card Entry">Credit Card Entry</option>
            <option value="Debit Note">Debit Note</option>
            <option value="Credit Note">Credit Note</option>
            <option value="Contra Entry">Contra Entry</option>
            <option value="Excise Entry">Excise Entry</option>
            <option value="Write Off Entry">Write Off Entry</option>
            <option value="Opening Entry">Opening Entry</option>
            <option value="Depreciation Entry">Depreciation Entry</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Journal Entries Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Debit
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Credit
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entry Type
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="entry in filteredEntries" :key="entry.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(entry.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ entry.reference }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ entry.description }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatCurrency(entry.debitTotal) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatCurrency(entry.creditTotal) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ entry.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ entry.entryType }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                v-if="entry.status === 'draft'"
                @click="postEntry(entry)" 
                class="text-green-600 hover:text-green-900 mr-3"
              >
                Post
              </button>
              <button 
                @click="viewEntry(entry)" 
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                View
              </button>
              <button 
                v-if="entry.status === 'draft'"
                @click="editEntry(entry)" 
                class="text-yellow-600 hover:text-yellow-900 mr-3"
              >
                Edit
              </button>
              <button 
                v-if="entry.status === 'draft'"
                @click="deleteEntry(entry)" 
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New/Edit Journal Entry Modal -->
    <div v-if="showNewEntry" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Edit Journal Entry' : 'New Journal Entry' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input 
                  type="date" 
                  v-model="entryForm.date"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Entry Type
                </label>
                <select 
                  v-model="entryForm.entryType"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Journal Entry">Journal Entry</option>
                  <option value="Bank Entry">Bank Entry</option>
                  <option value="Cash Entry">Cash Entry</option>
                  <option value="Credit Card Entry">Credit Card Entry</option>
                  <option value="Debit Note">Debit Note</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Contra Entry">Contra Entry</option>
                  <option value="Excise Entry">Excise Entry</option>
                  <option value="Write Off Entry">Write Off Entry</option>
                  <option value="Opening Entry">Opening Entry</option>
                  <option value="Depreciation Entry">Depreciation Entry</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Number Series
                </label>
                <input 
                  type="text"
                  v-model="entryForm.numberSeries"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="entryForm.entryType === 'Journal Entry' ? 'JV-' : ''"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Reference
                </label>
                <input 
                  type="text"
                  v-model="entryForm.reference"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input 
                  type="text"
                  v-model="entryForm.referenceNumber"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Reference Date
                </label>
                <input 
                  type="date"
                  v-model="entryForm.referenceDate"
                  class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea 
                v-model="entryForm.description"
                required
                rows="2"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- Line Items -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">
                  Line Items
                </label>
                <button 
                  type="button"
                  @click="addLineItem"
                  class="text-blue-500 hover:text-blue-700"
                >
                  Add Line
                </button>
              </div>
              
              <div class="space-y-2">
                <div 
                  v-for="(item, index) in entryForm.items" 
                  :key="index"
                  class="grid grid-cols-12 gap-4 items-center"
                >
                  <div class="col-span-4">
                    <select 
                      v-model="item.accountId"
                      required
                      class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Account</option>
                      <option v-for="account in accounts" :key="account.id" :value="account.id">
                        {{ account.code }} - {{ account.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-span-3">
                    <input 
                      type="number"
                      v-model="item.debit"
                      placeholder="Debit"
                      min="0"
                      step="0.01"
                      @input="updateTotals"
                      class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>
                  <div class="col-span-3">
                    <input 
                      type="number"
                      v-model="item.credit"
                      placeholder="Credit"
                      min="0"
                      step="0.01"
                      @input="updateTotals"
                      class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                  </div>
                  <div class="col-span-2">
                    <button 
                      type="button"
                      @click="removeLineItem(index)"
                      class="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <!-- Totals -->
              <div class="mt-4 flex justify-end">
                <div class="w-1/2 grid grid-cols-2 gap-4">
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-700">Total Debit</div>
                    <div class="text-lg font-semibold">{{ formatCurrency(totalDebit) }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-700">Total Credit</div>
                    <div class="text-lg font-semibold">{{ formatCurrency(totalCredit) }}</div>
                  </div>
                </div>
              </div>

              <div v-if="!isBalanced" class="mt-2 text-right text-red-600 text-sm">
                Warning: Debits and credits are not balanced
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button 
              type="button"
              @click="showNewEntry = false"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="!isBalanced"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

const router = useRouter()
const auth = useAuthStore()

const filters = ref({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  entryType: ''
})

const entries = ref([])
const accounts = ref([])
const showNewEntry = ref(false)
const isEditing = ref(false)

const entryForm = ref({
  date: new Date().toISOString().split('T')[0],
  entryType: 'Journal Entry',
  numberSeries: 'JV-',
  reference: '',
  referenceNumber: '',
  referenceDate: '',
  description: '',
  items: []
})

// Computed properties
const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    const matchesSearch = entry.reference.toLowerCase().includes(filters.value.search.toLowerCase()) ||
                         entry.description.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesStatus = !filters.value.status || entry.status === filters.value.status
    const matchesDateRange = (!filters.value.dateFrom || entry.date >= filters.value.dateFrom) &&
                           (!filters.value.dateTo || entry.date <= filters.value.dateTo)
    const matchesEntryType = !filters.value.entryType || entry.entryType === filters.value.entryType
    return matchesSearch && matchesStatus && matchesDateRange && matchesEntryType
  })
})

const totalDebit = computed(() => {
  return entryForm.value.items.reduce((sum, item) => sum + (Number(item.debit) || 0), 0)
})

const totalCredit = computed(() => {
  return entryForm.value.items.reduce((sum, item) => sum + (Number(item.credit) || 0), 0)
})

const isBalanced = computed(() => {
  return Math.abs(totalDebit.value - totalCredit.value) < 0.01
})

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const addLineItem = () => {
  entryForm.value.items.push({
    accountId: '',
    debit: 0,
    credit: 0
  })
}

const removeLineItem = (index: number) => {
  entryForm.value.items.splice(index, 1)
}

const updateTotals = () => {
  // This will trigger the computed properties to recalculate
}

const handleSubmit = async () => {
  try {
    const data = {
      ...entryForm.value,
      status: 'draft',
      debitTotal: totalDebit.value,
      creditTotal: totalCredit.value
    }

    if (isEditing.value) {
      await axios.put(`/api/journal-entries/${entryForm.value.id}`, data, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
    } else {
      await axios.post('/api/journal-entries', data, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
    }

    showNewEntry.value = false
    resetForm()
    await fetchEntries()
  } catch (error) {
    console.error('Error saving journal entry:', error)
  }
}

const resetForm = () => {
  entryForm.value = {
    date: new Date().toISOString().split('T')[0],
    entryType: 'Journal Entry',
    numberSeries: 'JV-',
    reference: '',
    referenceNumber: '',
    referenceDate: '',
    description: '',
    items: []
  }
  isEditing.value = false
}

const postEntry = async (entry: any) => {
  try {
    await axios.post(`/api/journal-entries/${entry.id}/post`, null, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    await fetchEntries()
  } catch (error) {
    console.error('Error posting journal entry:', error)
  }
}

const viewEntry = (entry: any) => {
  router.push(`/journal-entries/${entry.id}`)
}

const editEntry = (entry: any) => {
  entryForm.value = { ...entry }
  isEditing.value = true
  showNewEntry.value = true
}

const deleteEntry = async (entry: any) => {
  if (!confirm('Are you sure you want to delete this journal entry?')) return

  try {
    await axios.delete(`/api/journal-entries/${entry.id}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    await fetchEntries()
  } catch (error) {
    console.error('Error deleting journal entry:', error)
  }
}

// Fetch data
const fetchEntries = async () => {
  try {
    const response = await axios.get('/api/journal-entries', {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    entries.value = response.data
  } catch (error) {
    console.error('Error fetching journal entries:', error)
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

// Initialize data
onMounted(() => {
  fetchEntries()
  fetchAccounts()
})
</script>
