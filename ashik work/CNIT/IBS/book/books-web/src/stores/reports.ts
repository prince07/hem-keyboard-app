import { defineStore } from 'pinia'
import { ref } from 'vue'

interface BalanceSheet {
  assets: Record<string, number>
  liabilities: Record<string, number>
  equity: Record<string, number>
}

interface ProfitAndLoss {
  income: Record<string, number>
  expenses: Record<string, number>
  netProfit: number
}

interface LedgerEntry {
  id: number
  date: string
  description: string
  debit?: number
  credit?: number
  balance: number
}

interface StockMovementItem {
  id: string
  name: string
  opening: number
  in: number
  out: number
  closing: number
}

interface StockValuationItem {
  id: string
  name: string
  quantity: number
  unitCost: number
  totalValue: number
}

interface StockAgingItem {
  id: string
  name: string
  current: number
  days30: number
  days60: number
  days60Plus: number
}

export const useReportsStore = defineStore('reports', () => {
  const balanceSheet = ref<BalanceSheet | null>(null)
  const profitAndLoss = ref<ProfitAndLoss | null>(null)
  const generalLedger = ref<Record<string, LedgerEntry[]> | null>(null)
  const stockMovement = ref<StockMovementItem[] | null>(null)
  const stockValuation = ref<StockValuationItem[] | null>(null)
  const stockAging = ref<StockAgingItem[] | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBalanceSheet(date?: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/reports/balance-sheet${date ? `?date=${date}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch balance sheet')
      }

      balanceSheet.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProfitAndLoss(startDate?: string, endDate?: string) {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports/profit-loss?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profit and loss report')
      }

      profitAndLoss.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGeneralLedger(account?: string, startDate?: string, endDate?: string) {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      if (account) params.append('account', account)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/reports/general-ledger?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch general ledger')
      }

      generalLedger.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function generateStockMovement({ startDate, endDate }: { startDate: string; endDate: string }) {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()
      params.append('startDate', startDate)
      params.append('endDate', endDate)

      const response = await fetch(`/api/reports/stock-movement?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate stock movement report')
      }

      stockMovement.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function generateStockValuation({ date }: { date: string }) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/reports/stock-valuation?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate stock valuation report')
      }

      stockValuation.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function generateStockAging({ period }: { period: number }) {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/reports/stock-aging?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate stock aging report')
      }

      stockAging.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearReports() {
    balanceSheet.value = null
    profitAndLoss.value = null
    generalLedger.value = null
    stockMovement.value = null
    stockValuation.value = null
    stockAging.value = null
    error.value = null
  }

  return {
    balanceSheet,
    profitAndLoss,
    generalLedger,
    stockMovement,
    stockValuation,
    stockAging,
    isLoading,
    error,
    fetchBalanceSheet,
    fetchProfitAndLoss,
    fetchGeneralLedger,
    generateStockMovement,
    generateStockValuation,
    generateStockAging,
    clearReports,
  }
})
