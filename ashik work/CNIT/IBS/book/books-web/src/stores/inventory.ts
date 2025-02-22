import { defineStore } from 'pinia'
import axios from 'axios'

interface InventoryItem {
  id: string
  code: string
  name: string
  category: string
  inStock: number
  reorderLevel: number
  unitPrice: number
  status: 'active' | 'inactive'
}

interface StockAdjustment {
  id: string
  type: 'in' | 'out'
  date: string
  reference: string
  notes: string
  items: Array<{
    product: string
    quantity: number
    reason: string
  }>
}

interface InventoryState {
  items: InventoryItem[]
  loading: boolean
  error: string | null
  totalItems: number
  currentPage: number
  itemsPerPage: number
  filters: {
    search: string
    category: string
    stockLevel: string
    status: string
  }
}

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    items: [],
    loading: false,
    error: null,
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
      search: '',
      category: '',
      stockLevel: '',
      status: ''
    }
  }),

  getters: {
    lowStockItems: (state) => {
      return state.items.filter(item => item.inStock <= item.reorderLevel)
    },
    outOfStockItems: (state) => {
      return state.items.filter(item => item.inStock === 0)
    },
    activeItems: (state) => {
      return state.items.filter(item => item.status === 'active')
    },
    totalPages: (state) => {
      return Math.ceil(state.totalItems / state.itemsPerPage)
    }
  },

  actions: {
    async fetchItems() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/inventory', {
          params: {
            page: this.currentPage,
            pageSize: this.itemsPerPage,
            ...this.filters
          }
        })
        this.items = response.data.items
        this.totalItems = response.data.total
      } catch (error) {
        this.error = 'Failed to fetch inventory items'
        console.error('Error fetching inventory:', error)
      } finally {
        this.loading = false
      }
    },

    async createItem(item: Partial<InventoryItem>) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/inventory', item)
        this.items.push(response.data)
        return response.data
      } catch (error) {
        this.error = 'Failed to create inventory item'
        console.error('Error creating inventory item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateItem(id: string, updates: Partial<InventoryItem>) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.put(`/api/inventory/${id}`, updates)
        const index = this.items.findIndex(item => item.id === id)
        if (index !== -1) {
          this.items[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = 'Failed to update inventory item'
        console.error('Error updating inventory item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteItem(id: string) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/api/inventory/${id}`)
        this.items = this.items.filter(item => item.id !== id)
      } catch (error) {
        this.error = 'Failed to delete inventory item'
        console.error('Error deleting inventory item:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async adjustStock(adjustment: StockAdjustment) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/api/inventory/adjust', adjustment)
        // Refresh inventory after adjustment
        await this.fetchItems()
        return response.data
      } catch (error) {
        this.error = 'Failed to adjust stock'
        console.error('Error adjusting stock:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async getStockHistory(itemId: string, params: { startDate: string; endDate: string }) {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/api/inventory/${itemId}/history`, { params })
        return response.data
      } catch (error) {
        this.error = 'Failed to fetch stock history'
        console.error('Error fetching stock history:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setPage(page: number) {
      this.currentPage = page
      this.fetchItems()
    },

    setFilters(filters: Partial<InventoryState['filters']>) {
      this.filters = { ...this.filters, ...filters }
      this.currentPage = 1
      this.fetchItems()
    },

    resetFilters() {
      this.filters = {
        search: '',
        category: '',
        stockLevel: '',
        status: ''
      }
      this.currentPage = 1
      this.fetchItems()
    }
  }
})
