export interface InventoryItem {
  id: string
  code: string
  name: string
  category: string
  inStock: number
  reorderLevel: number
  unitPrice: number
  status: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface StockAdjustment {
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
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Payment {
  id: string
  type: 'cash' | 'bank' | 'cheque'
  date: string
  reference?: string
  party: string
  amount: number
  chequeNumber?: string
  chequeDate?: string
  clearanceDate?: string
  bankName?: string
  bankBranch?: string
  notes?: string
  status: 'pending' | 'cleared' | 'bounced'
  createdAt?: string
  updatedAt?: string
}

export interface Party {
  id: string
  name: string
  type: 'customer' | 'supplier' | 'other'
  email?: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}
