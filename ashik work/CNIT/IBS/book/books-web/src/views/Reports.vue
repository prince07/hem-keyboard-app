<template>
  <div>
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Reports
        </h2>
      </div>
    </div>

    <div class="mt-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Balance Sheet -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Balance Sheet</dt>
                  <dd class="mt-1">
                    <div class="flex items-center space-x-2">
                      <input
                        type="date"
                        v-model="balanceSheetDate"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                      <button
                        @click="generateBalanceSheet"
                        :disabled="reportsStore.isLoading"
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="reportsStore.isLoading && activeReport === 'balance-sheet'" class="mr-2">
                          <svg class="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        Generate Report
                      </button>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div v-if="reportsStore.error && activeReport === 'balance-sheet'" class="bg-red-50 px-5 py-3">
            <p class="text-sm text-red-600">{{ reportsStore.error }}</p>
          </div>
          <div v-else-if="reportsStore.balanceSheet" class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <div class="font-medium text-gray-900">Assets</div>
              <ul class="mt-2 divide-y divide-gray-200">
                <li v-for="(value, name) in reportsStore.balanceSheet.assets" :key="name" class="py-2">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">{{ name }}</div>
                    <div class="text-gray-900">{{ formatAmount(value) }}</div>
                  </div>
                </li>
              </ul>
              <div class="mt-4 font-medium text-gray-900">Liabilities</div>
              <ul class="mt-2 divide-y divide-gray-200">
                <li v-for="(value, name) in reportsStore.balanceSheet.liabilities" :key="name" class="py-2">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">{{ name }}</div>
                    <div class="text-gray-900">{{ formatAmount(value) }}</div>
                  </div>
                </li>
              </ul>
              <div class="mt-4 font-medium text-gray-900">Equity</div>
              <ul class="mt-2 divide-y divide-gray-200">
                <li v-for="(value, name) in reportsStore.balanceSheet.equity" :key="name" class="py-2">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">{{ name }}</div>
                    <div class="text-gray-900">{{ formatAmount(value) }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Profit & Loss -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Profit & Loss</dt>
                  <dd class="mt-1">
                    <div class="flex items-center space-x-2">
                      <div class="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          v-model="plStartDate"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <input
                          type="date"
                          v-model="plEndDate"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                      <button
                        @click="generateProfitAndLoss"
                        :disabled="reportsStore.isLoading"
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="reportsStore.isLoading && activeReport === 'profit-loss'" class="mr-2">
                          <svg class="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        Generate Report
                      </button>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div v-if="reportsStore.error && activeReport === 'profit-loss'" class="bg-red-50 px-5 py-3">
            <p class="text-sm text-red-600">{{ reportsStore.error }}</p>
          </div>
          <div v-else-if="reportsStore.profitAndLoss" class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <div class="font-medium text-gray-900">Income</div>
              <ul class="mt-2 divide-y divide-gray-200">
                <li v-for="(value, name) in reportsStore.profitAndLoss.income" :key="name" class="py-2">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">{{ name }}</div>
                    <div class="text-gray-900">{{ formatAmount(value) }}</div>
                  </div>
                </li>
              </ul>
              <div class="mt-4 font-medium text-gray-900">Expenses</div>
              <ul class="mt-2 divide-y divide-gray-200">
                <li v-for="(value, name) in reportsStore.profitAndLoss.expenses" :key="name" class="py-2">
                  <div class="flex items-center justify-between">
                    <div class="text-gray-600">{{ name }}</div>
                    <div class="text-gray-900">{{ formatAmount(value) }}</div>
                  </div>
                </li>
              </ul>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between font-medium">
                  <div class="text-gray-900">Net Profit</div>
                  <div :class="[
                    reportsStore.profitAndLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
                    'text-base'
                  ]">
                    {{ formatAmount(reportsStore.profitAndLoss.netProfit) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- General Ledger -->
        <div class="bg-white overflow-hidden shadow rounded-lg sm:col-span-2">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">General Ledger</dt>
                  <dd class="mt-1">
                    <div class="flex items-center space-x-2">
                      <select
                        v-model="selectedAccount"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="">All Accounts</option>
                        <!-- Add account options dynamically -->
                      </select>
                      <div class="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          v-model="glStartDate"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <input
                          type="date"
                          v-model="glEndDate"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                      <button
                        @click="generateGeneralLedger"
                        :disabled="reportsStore.isLoading"
                        class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="reportsStore.isLoading && activeReport === 'general-ledger'" class="mr-2">
                          <svg class="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        Generate Report
                      </button>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div v-if="reportsStore.error && activeReport === 'general-ledger'" class="bg-red-50 px-5 py-3">
            <p class="text-sm text-red-600">{{ reportsStore.error }}</p>
          </div>
          <div v-else-if="reportsStore.generalLedger" class="bg-gray-50 px-5 py-3">
            <div class="text-sm">
              <div v-for="(entries, account) in reportsStore.generalLedger" :key="account" class="mb-6">
                <div class="font-medium text-gray-900">{{ account }}</div>
                <div class="mt-2 overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="entry in entries" :key="entry.id">
                        <td class="px-3 py-2 text-gray-600">{{ formatDate(entry.date) }}</td>
                        <td class="px-3 py-2 text-gray-600">{{ entry.description }}</td>
                        <td class="px-3 py-2 text-right text-gray-900">{{ entry.debit ? formatAmount(entry.debit) : '' }}</td>
                        <td class="px-3 py-2 text-right text-gray-900">{{ entry.credit ? formatAmount(entry.credit) : '' }}</td>
                        <td class="px-3 py-2 text-right text-gray-900">{{ formatAmount(entry.balance) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
import { useReportsStore } from '@/stores/reports'
import { storeToRefs } from 'pinia'

const reportsStore = useReportsStore()

const balanceSheetDate = ref('')
const plStartDate = ref('')
const plEndDate = ref('')
const glStartDate = ref('')
const glEndDate = ref('')
const selectedAccount = ref('')
const activeReport = ref<'balance-sheet' | 'profit-loss' | 'general-ledger' | null>(null)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

async function generateBalanceSheet() {
  activeReport.value = 'balance-sheet'
  try {
    await reportsStore.fetchBalanceSheet(balanceSheetDate.value)
  } catch (error) {
    console.error('Failed to generate balance sheet:', error)
  }
}

async function generateProfitAndLoss() {
  activeReport.value = 'profit-loss'
  try {
    await reportsStore.fetchProfitAndLoss(plStartDate.value, plEndDate.value)
  } catch (error) {
    console.error('Failed to generate profit & loss:', error)
  }
}

async function generateGeneralLedger() {
  activeReport.value = 'general-ledger'
  try {
    await reportsStore.fetchGeneralLedger(
      selectedAccount.value,
      glStartDate.value,
      glEndDate.value
    )
  } catch (error) {
    console.error('Failed to generate general ledger:', error)
  }
}
</script>
