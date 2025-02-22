<template>
  <div>
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Transactions
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          @click="showNewTransactionModal = true"
        >
          New Transaction
        </button>
      </div>
    </div>

    <div class="mt-8">
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <table class="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Party</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="!transactions?.length">
              <td colspan="6" class="p-4 text-center text-gray-500">No transactions found</td>
            </tr>
            <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ transaction.type }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ transaction.party }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatAmount(transaction.amount) }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span :class="[
                  transaction.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                  transaction.status === 'Submitted' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700',
                  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset'
                ]">
                  {{ transaction.status }}
                </span>
              </td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                  type="button"
                  class="text-indigo-600 hover:text-indigo-900"
                  @click="editTransaction(transaction)"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New Transaction Modal -->
    <div v-if="showNewTransactionModal" class="relative z-10">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <h3 class="text-base font-semibold leading-6 text-gray-900">New Transaction</h3>
              <div class="mt-2">
                <form @submit.prevent="createTransaction">
                  <div class="space-y-4">
                    <div>
                      <label for="type" class="block text-sm font-medium leading-6 text-gray-900">Type</label>
                      <div class="mt-2">
                        <select
                          id="type"
                          v-model="newTransaction.type"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="Payment">Payment</option>
                          <option value="Receipt">Receipt</option>
                          <option value="Journal Entry">Journal Entry</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label for="date" class="block text-sm font-medium leading-6 text-gray-900">Date</label>
                      <div class="mt-2">
                        <input
                          type="date"
                          id="date"
                          v-model="newTransaction.date"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <div>
                      <label for="party" class="block text-sm font-medium leading-6 text-gray-900">Party</label>
                      <div class="mt-2">
                        <select
                          id="party"
                          v-model="newTransaction.partyId"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option v-for="party in parties" :key="party.id" :value="party.id">
                            {{ party.name }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <!-- Transaction Lines -->
                    <div>
                      <label class="block text-sm font-medium leading-6 text-gray-900">Lines</label>
                      <div class="mt-2 space-y-2">
                        <div v-for="(line, index) in newTransaction.lines" :key="index" class="flex gap-2">
                          <select
                            v-model="line.accountId"
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          >
                            <option v-for="account in accounts" :key="account.id" :value="account.id">
                              {{ account.name }}
                            </option>
                          </select>
                          <input
                            type="number"
                            v-model="line.debit"
                            placeholder="Debit"
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                          <input
                            type="number"
                            v-model="line.credit"
                            placeholder="Credit"
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                          <button
                            type="button"
                            class="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            @click="removeLine(index)"
                          >
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        <button
                          type="button"
                          class="inline-flex items-center text-sm font-semibold text-indigo-600"
                          @click="addLine"
                        >
                          <svg class="mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                          </svg>
                          Add Line
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      @click="showNewTransactionModal = false"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Account {
  id: number
  name: string
}

interface Party {
  id: number
  name: string
}

interface TransactionLine {
  accountId: number | null
  debit: number
  credit: number
}

interface Transaction {
  id: number
  date: string
  type: string
  party: string
  amount: number
  status: 'Draft' | 'Submitted' | 'Cancelled'
}

const transactions = ref<Transaction[]>([])
const accounts = ref<Account[]>([])
const parties = ref<Party[]>([])
const showNewTransactionModal = ref(false)
const newTransaction = ref({
  type: 'Payment',
  date: new Date().toISOString().split('T')[0],
  partyId: null as number | null,
  lines: [] as TransactionLine[]
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function addLine() {
  newTransaction.value.lines.push({
    accountId: null,
    debit: 0,
    credit: 0
  })
}

function removeLine(index: number) {
  newTransaction.value.lines.splice(index, 1)
}

async function createTransaction() {
  try {
    // TODO: Implement transaction creation
    showNewTransactionModal.value = false
  } catch (error) {
    console.error('Failed to create transaction:', error)
  }
}

function editTransaction(transaction: Transaction) {
  // TODO: Implement transaction editing
  console.log('Edit transaction:', transaction)
}

// TODO: Fetch accounts and parties when component is mounted
</script>
