<template>
  <div>
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Parties
        </h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          @click="showNewPartyModal = true"
        >
          New Party
        </button>
      </div>
    </div>

    <div class="mt-8">
      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <table class="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Default Account</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Balance</th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="!parties?.length">
              <td colspan="5" class="p-4 text-center text-gray-500">No parties found</td>
            </tr>
            <tr v-for="party in parties" :key="party.id" class="hover:bg-gray-50">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {{ party.name }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ party.type }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ party.defaultAccount }}</td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ party.balance }}</td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button
                  type="button"
                  class="text-indigo-600 hover:text-indigo-900"
                  @click="editParty(party)"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New Party Modal -->
    <div v-if="showNewPartyModal" class="relative z-10">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <h3 class="text-base font-semibold leading-6 text-gray-900">New Party</h3>
              <div class="mt-2">
                <form @submit.prevent="createParty">
                  <div class="space-y-4">
                    <div>
                      <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
                      <div class="mt-2">
                        <input
                          type="text"
                          id="name"
                          v-model="newParty.name"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <div>
                      <label for="type" class="block text-sm font-medium leading-6 text-gray-900">Type</label>
                      <div class="mt-2">
                        <select
                          id="type"
                          v-model="newParty.type"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Supplier">Supplier</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label for="defaultAccount" class="block text-sm font-medium leading-6 text-gray-900">Default Account</label>
                      <div class="mt-2">
                        <select
                          id="defaultAccount"
                          v-model="newParty.defaultAccountId"
                          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option v-for="account in accounts" :key="account.id" :value="account.id">
                            {{ account.name }}
                          </option>
                        </select>
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
                      @click="showNewPartyModal = false"
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
  type: string
  defaultAccount: string
  balance: number
}

const parties = ref<Party[]>([])
const accounts = ref<Account[]>([])
const showNewPartyModal = ref(false)
const newParty = ref({
  name: '',
  type: 'Customer',
  defaultAccountId: null as number | null
})

async function createParty() {
  try {
    // TODO: Implement party creation
    showNewPartyModal.value = false
  } catch (error) {
    console.error('Failed to create party:', error)
  }
}

function editParty(party: Party) {
  // TODO: Implement party editing
  console.log('Edit party:', party)
}

// TODO: Fetch accounts when component is mounted
</script>
