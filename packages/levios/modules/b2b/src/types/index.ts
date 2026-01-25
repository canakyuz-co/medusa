/**
 * Dealer status
 */
export enum DealerStatus {
  PENDING = "pending",
  APPROVED = "approved",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

/**
 * Dealer tier for pricing
 */
export enum DealerTier {
  BRONZE = "bronze",
  SILVER = "silver",
  GOLD = "gold",
  PLATINUM = "platinum",
}

/**
 * Dealer information
 */
export interface DealerDTO {
  id: string
  customerId: string
  companyName: string
  taxId: string
  status: DealerStatus
  tier: DealerTier
  creditLimit: number
  currentBalance: number
  discountPercentage: number
  contactEmail: string
  contactPhone?: string
  billingAddress?: {
    address1: string
    address2?: string
    city: string
    province?: string
    postalCode: string
    countryCode: string
  }
  approvedAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

/**
 * Create dealer input
 */
export interface CreateDealerDTO {
  customerId: string
  companyName: string
  taxId: string
  contactEmail: string
  contactPhone?: string
  billingAddress?: DealerDTO["billingAddress"]
  metadata?: Record<string, unknown>
}

/**
 * Update dealer input
 */
export interface UpdateDealerDTO {
  companyName?: string
  taxId?: string
  status?: DealerStatus
  tier?: DealerTier
  creditLimit?: number
  discountPercentage?: number
  contactEmail?: string
  contactPhone?: string
  billingAddress?: DealerDTO["billingAddress"]
  metadata?: Record<string, unknown>
}

/**
 * Price tier for bulk pricing
 */
export interface PriceTierDTO {
  id: string
  name: string
  minQuantity: number
  maxQuantity?: number
  discountPercentage: number
  isActive: boolean
}

/**
 * Create price tier input
 */
export interface CreatePriceTierDTO {
  name: string
  minQuantity: number
  maxQuantity?: number
  discountPercentage: number
  isActive?: boolean
}

/**
 * Credit transaction type
 */
export enum CreditTransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
  PAYMENT = "payment",
  ADJUSTMENT = "adjustment",
}

/**
 * Credit account transaction
 */
export interface CreditTransactionDTO {
  id: string
  dealerId: string
  type: CreditTransactionType
  amount: number
  balance: number
  orderId?: string
  description: string
  createdAt: Date
}

/**
 * Bulk order item
 */
export interface BulkOrderItemDTO {
  productId: string
  variantId: string
  quantity: number
  unitPrice: number
  discountPercentage: number
  totalPrice: number
}

/**
 * Bulk order
 */
export interface BulkOrderDTO {
  id: string
  dealerId: string
  items: BulkOrderItemDTO[]
  subtotal: number
  discount: number
  total: number
  status: "draft" | "submitted" | "approved" | "rejected" | "completed"
  notes?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Create bulk order input
 */
export interface CreateBulkOrderDTO {
  dealerId: string
  items: Array<{
    productId: string
    variantId: string
    quantity: number
  }>
  notes?: string
}

/**
 * Bulk price calculation result
 */
export interface BulkPriceResult {
  unitPrice: number
  originalUnitPrice: number
  discountPercentage: number
  quantity: number
  totalPrice: number
  appliedTier?: PriceTierDTO
  dealerDiscount?: number
}

/**
 * Interface for B2B Module Service
 */
export interface IB2BModuleService {
  // Dealer management
  listDealers(filters?: { status?: DealerStatus; tier?: DealerTier }): Promise<DealerDTO[]>
  getDealer(id: string): Promise<DealerDTO | undefined>
  getDealerByCustomerId(customerId: string): Promise<DealerDTO | undefined>
  createDealer(data: CreateDealerDTO): Promise<DealerDTO>
  updateDealer(id: string, data: UpdateDealerDTO): Promise<DealerDTO>
  approveDealer(id: string): Promise<DealerDTO>
  suspendDealer(id: string, reason?: string): Promise<DealerDTO>
  rejectDealer(id: string, reason?: string): Promise<DealerDTO>

  // Price tiers
  listPriceTiers(): Promise<PriceTierDTO[]>
  getPriceTier(id: string): Promise<PriceTierDTO | undefined>
  createPriceTier(data: CreatePriceTierDTO): Promise<PriceTierDTO>
  updatePriceTier(id: string, data: Partial<CreatePriceTierDTO>): Promise<PriceTierDTO>
  deletePriceTier(id: string): Promise<void>

  // Pricing calculations
  calculateBulkPrice(
    productId: string,
    variantId: string,
    quantity: number,
    dealerId?: string
  ): Promise<BulkPriceResult>

  getApplicablePriceTier(quantity: number): PriceTierDTO | undefined

  // Credit management
  getCreditBalance(dealerId: string): Promise<number>
  addCredit(dealerId: string, amount: number, description: string): Promise<CreditTransactionDTO>
  deductCredit(dealerId: string, amount: number, orderId: string, description: string): Promise<CreditTransactionDTO>
  getCreditTransactions(dealerId: string): Promise<CreditTransactionDTO[]>

  // Bulk orders
  createBulkOrder(data: CreateBulkOrderDTO): Promise<BulkOrderDTO>
  getBulkOrder(id: string): Promise<BulkOrderDTO | undefined>
  approveBulkOrder(id: string): Promise<BulkOrderDTO>
  rejectBulkOrder(id: string, reason?: string): Promise<BulkOrderDTO>
}
