import {
  Context,
  DAL,
  InternalModuleDeclaration,
  ModulesSdkTypes,
} from "@medusajs/framework/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaService,
  MedusaError,
  generateEntityId,
} from "@medusajs/framework/utils"
import { Dealer, PriceTier, CreditTransaction, BulkOrder } from "@models"
import {
  DealerDTO,
  DealerStatus,
  DealerTier,
  CreateDealerDTO,
  UpdateDealerDTO,
  PriceTierDTO,
  CreatePriceTierDTO,
  CreditTransactionDTO,
  CreditTransactionType,
  BulkOrderDTO,
  CreateBulkOrderDTO,
  BulkPriceResult,
  IB2BModuleService,
} from "../types"
import { DealerService } from "./dealer-service"
import { BulkPricingService } from "./bulk-pricing-service"
import { CreditService } from "./credit-service"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
  dealerService: ModulesSdkTypes.IMedusaInternalService<any>
  priceTierService: ModulesSdkTypes.IMedusaInternalService<any>
  creditTransactionService: ModulesSdkTypes.IMedusaInternalService<any>
  bulkOrderService: ModulesSdkTypes.IMedusaInternalService<any>
}

export default class B2BModuleService
  extends MedusaService<{
    Dealer: { dto: DealerDTO }
    PriceTier: { dto: PriceTierDTO }
    CreditTransaction: { dto: CreditTransactionDTO }
    BulkOrder: { dto: BulkOrderDTO }
  }>({
    Dealer,
    PriceTier,
    CreditTransaction,
    BulkOrder,
  })
  implements IB2BModuleService
{
  protected baseRepository_: DAL.RepositoryService
  protected readonly dealerDbService_: ModulesSdkTypes.IMedusaInternalService<any>
  protected readonly priceTierService_: ModulesSdkTypes.IMedusaInternalService<any>
  protected readonly creditTransactionService_: ModulesSdkTypes.IMedusaInternalService<any>
  protected readonly bulkOrderService_: ModulesSdkTypes.IMedusaInternalService<any>

  private dealerService: DealerService
  private bulkPricingService: BulkPricingService
  private creditService: CreditService

  constructor(
    {
      baseRepository,
      dealerService,
      priceTierService,
      creditTransactionService,
      bulkOrderService,
    }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)

    this.baseRepository_ = baseRepository
    this.dealerDbService_ = dealerService
    this.priceTierService_ = priceTierService
    this.creditTransactionService_ = creditTransactionService
    this.bulkOrderService_ = bulkOrderService

    this.dealerService = new DealerService()
    this.bulkPricingService = new BulkPricingService()
    this.creditService = new CreditService()
  }

  // ==================== Dealer Management ====================

  @InjectManager()
  async listDealers(
    filters?: { status?: DealerStatus; tier?: DealerTier },
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO[]> {
    const dealers = await this.dealerDbService_.list(
      filters || {},
      {},
      sharedContext
    )
    return this.baseRepository_.serialize<DealerDTO[]>(dealers)
  }

  @InjectManager()
  async getDealer(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO | undefined> {
    try {
      const dealer = await this.dealerDbService_.retrieve(id, {}, sharedContext)
      return this.baseRepository_.serialize<DealerDTO>(dealer)
    } catch {
      return undefined
    }
  }

  @InjectManager()
  async getDealerByCustomerId(
    customerId: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO | undefined> {
    const dealers = await this.dealerDbService_.list(
      { customer_id: customerId },
      { take: 1 },
      sharedContext
    )
    if (dealers.length === 0) return undefined
    return this.baseRepository_.serialize<DealerDTO>(dealers[0])
  }

  @InjectTransactionManager()
  async createDealer(
    data: CreateDealerDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO> {
    const errors = this.dealerService.validateDealerData(data)
    if (errors.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        errors.join(", ")
      )
    }

    const dealer = await this.dealerDbService_.create(
      {
        id: generateEntityId(undefined, "dealer"),
        customer_id: data.customerId,
        company_name: data.companyName,
        tax_id: data.taxId,
        status: DealerStatus.PENDING,
        tier: DealerTier.BRONZE,
        credit_limit: this.dealerService.getDefaultCreditLimitForTier(DealerTier.BRONZE),
        current_balance: 0,
        discount_percentage: this.dealerService.getDefaultDiscountForTier(DealerTier.BRONZE),
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        billing_address: data.billingAddress,
        metadata: data.metadata,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<DealerDTO>(dealer)
  }

  @InjectTransactionManager()
  async updateDealer(
    id: string,
    data: UpdateDealerDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO> {
    const errors = this.dealerService.validateDealerData(data)
    if (errors.length > 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        errors.join(", ")
      )
    }

    const updateData: Record<string, any> = { id }
    if (data.companyName !== undefined) updateData.company_name = data.companyName
    if (data.taxId !== undefined) updateData.tax_id = data.taxId
    if (data.status !== undefined) updateData.status = data.status
    if (data.tier !== undefined) {
      updateData.tier = data.tier
      updateData.credit_limit = this.dealerService.getDefaultCreditLimitForTier(data.tier)
      updateData.discount_percentage = this.dealerService.getDefaultDiscountForTier(data.tier)
    }
    if (data.creditLimit !== undefined) updateData.credit_limit = data.creditLimit
    if (data.discountPercentage !== undefined) updateData.discount_percentage = data.discountPercentage
    if (data.contactEmail !== undefined) updateData.contact_email = data.contactEmail
    if (data.contactPhone !== undefined) updateData.contact_phone = data.contactPhone
    if (data.billingAddress !== undefined) updateData.billing_address = data.billingAddress
    if (data.metadata !== undefined) updateData.metadata = data.metadata

    const dealer = await this.dealerDbService_.update([updateData], sharedContext)
    return this.baseRepository_.serialize<DealerDTO>(dealer[0])
  }

  @InjectTransactionManager()
  async approveDealer(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO> {
    const dealer = await this.dealerDbService_.update(
      [{ id, status: DealerStatus.APPROVED, approved_at: new Date() }],
      sharedContext
    )
    return this.baseRepository_.serialize<DealerDTO>(dealer[0])
  }

  @InjectTransactionManager()
  async suspendDealer(
    id: string,
    reason?: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO> {
    const dealer = await this.dealerDbService_.update(
      [{ id, status: DealerStatus.SUSPENDED, suspension_reason: reason }],
      sharedContext
    )
    return this.baseRepository_.serialize<DealerDTO>(dealer[0])
  }

  @InjectTransactionManager()
  async rejectDealer(
    id: string,
    reason?: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DealerDTO> {
    const dealer = await this.dealerDbService_.update(
      [{ id, status: DealerStatus.REJECTED, rejection_reason: reason }],
      sharedContext
    )
    return this.baseRepository_.serialize<DealerDTO>(dealer[0])
  }

  // ==================== Price Tiers ====================

  @InjectManager()
  async listPriceTiers(
    @MedusaContext() sharedContext: Context = {}
  ): Promise<PriceTierDTO[]> {
    const tiers = await this.priceTierService_.list({}, {}, sharedContext)
    return this.baseRepository_.serialize<PriceTierDTO[]>(tiers)
  }

  @InjectManager()
  async getPriceTier(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<PriceTierDTO | undefined> {
    try {
      const tier = await this.priceTierService_.retrieve(id, {}, sharedContext)
      return this.baseRepository_.serialize<PriceTierDTO>(tier)
    } catch {
      return undefined
    }
  }

  @InjectTransactionManager()
  async createPriceTier(
    data: CreatePriceTierDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<PriceTierDTO> {
    const tier = await this.priceTierService_.create(
      {
        id: generateEntityId(undefined, "ptier"),
        name: data.name,
        min_quantity: data.minQuantity,
        max_quantity: data.maxQuantity,
        discount_percentage: data.discountPercentage,
        is_active: data.isActive ?? true,
      },
      sharedContext
    )
    return this.baseRepository_.serialize<PriceTierDTO>(tier)
  }

  @InjectTransactionManager()
  async updatePriceTier(
    id: string,
    data: Partial<CreatePriceTierDTO>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<PriceTierDTO> {
    const updateData: Record<string, any> = { id }
    if (data.name !== undefined) updateData.name = data.name
    if (data.minQuantity !== undefined) updateData.min_quantity = data.minQuantity
    if (data.maxQuantity !== undefined) updateData.max_quantity = data.maxQuantity
    if (data.discountPercentage !== undefined) updateData.discount_percentage = data.discountPercentage
    if (data.isActive !== undefined) updateData.is_active = data.isActive

    const tier = await this.priceTierService_.update([updateData], sharedContext)
    return this.baseRepository_.serialize<PriceTierDTO>(tier[0])
  }

  @InjectTransactionManager()
  async deletePriceTier(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    await this.priceTierService_.delete([id], sharedContext)
  }

  // ==================== Pricing Calculations ====================

  @InjectManager()
  async calculateBulkPrice(
    _productId: string,
    _variantId: string,
    quantity: number,
    dealerId?: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<BulkPriceResult> {
    const priceTiers = await this.listPriceTiers(sharedContext)

    let dealer: DealerDTO | undefined
    if (dealerId) {
      dealer = await this.getDealer(dealerId, sharedContext)
    }

    // For now, use a placeholder price - in real implementation,
    // this would fetch from product/pricing module
    const originalUnitPrice = 10000 // Placeholder

    return this.bulkPricingService.calculateBulkPrice(
      originalUnitPrice,
      quantity,
      priceTiers,
      dealer
    )
  }

  getApplicablePriceTier(quantity: number): PriceTierDTO | undefined {
    // This would typically be called with cached price tiers
    return undefined
  }

  // ==================== Credit Management ====================

  @InjectManager()
  async getCreditBalance(
    dealerId: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<number> {
    const dealer = await this.getDealer(dealerId, sharedContext)
    if (!dealer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Dealer with id ${dealerId} not found`
      )
    }
    return dealer.currentBalance
  }

  @InjectTransactionManager()
  async addCredit(
    dealerId: string,
    amount: number,
    description: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<CreditTransactionDTO> {
    const dealer = await this.getDealer(dealerId, sharedContext)
    if (!dealer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Dealer with id ${dealerId} not found`
      )
    }

    const newBalance = this.creditService.calculateNewBalance(
      dealer.currentBalance,
      amount,
      CreditTransactionType.CREDIT
    )

    // Update dealer balance
    await this.dealerDbService_.update(
      [{ id: dealerId, current_balance: newBalance }],
      sharedContext
    )

    // Create transaction record
    const transaction = await this.creditTransactionService_.create(
      {
        id: generateEntityId(undefined, "ctxn"),
        dealer_id: dealerId,
        type: CreditTransactionType.CREDIT,
        amount,
        balance: newBalance,
        description,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<CreditTransactionDTO>(transaction)
  }

  @InjectTransactionManager()
  async deductCredit(
    dealerId: string,
    amount: number,
    orderId: string,
    description: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<CreditTransactionDTO> {
    const dealer = await this.getDealer(dealerId, sharedContext)
    if (!dealer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Dealer with id ${dealerId} not found`
      )
    }

    const validation = this.creditService.validateCreditOperation(
      dealer,
      amount,
      CreditTransactionType.DEBIT
    )
    if (!validation.valid) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, validation.error!)
    }

    const newBalance = this.creditService.calculateNewBalance(
      dealer.currentBalance,
      amount,
      CreditTransactionType.DEBIT
    )

    // Update dealer balance
    await this.dealerDbService_.update(
      [{ id: dealerId, current_balance: newBalance }],
      sharedContext
    )

    // Create transaction record
    const transaction = await this.creditTransactionService_.create(
      {
        id: generateEntityId(undefined, "ctxn"),
        dealer_id: dealerId,
        type: CreditTransactionType.DEBIT,
        amount,
        balance: newBalance,
        order_id: orderId,
        description,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<CreditTransactionDTO>(transaction)
  }

  @InjectManager()
  async getCreditTransactions(
    dealerId: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<CreditTransactionDTO[]> {
    const transactions = await this.creditTransactionService_.list(
      { dealer_id: dealerId },
      { order: { created_at: "DESC" } },
      sharedContext
    )
    return this.baseRepository_.serialize<CreditTransactionDTO[]>(transactions)
  }

  // ==================== Bulk Orders ====================

  @InjectTransactionManager()
  async createBulkOrder(
    data: CreateBulkOrderDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<BulkOrderDTO> {
    const dealer = await this.getDealer(data.dealerId, sharedContext)
    if (!dealer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Dealer with id ${data.dealerId} not found`
      )
    }

    const orderCheck = this.dealerService.canPlaceOrder(dealer)
    if (!orderCheck.canPlace) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        orderCheck.reason!
      )
    }

    // Calculate prices for all items
    const priceTiers = await this.listPriceTiers(sharedContext)
    let subtotal = 0
    let discount = 0

    const items = data.items.map((item) => {
      const originalUnitPrice = 10000 // Placeholder
      const result = this.bulkPricingService.calculateBulkPrice(
        originalUnitPrice,
        item.quantity,
        priceTiers,
        dealer
      )

      const itemDiscount =
        (originalUnitPrice - result.unitPrice) * item.quantity
      subtotal += originalUnitPrice * item.quantity
      discount += itemDiscount

      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: result.unitPrice,
        discountPercentage: result.discountPercentage,
        totalPrice: result.totalPrice,
      }
    })

    const total = subtotal - discount

    const order = await this.bulkOrderService_.create(
      {
        id: generateEntityId(undefined, "bord"),
        dealer_id: data.dealerId,
        items,
        subtotal,
        discount,
        total,
        status: "draft",
        notes: data.notes,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<BulkOrderDTO>(order)
  }

  @InjectManager()
  async getBulkOrder(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<BulkOrderDTO | undefined> {
    try {
      const order = await this.bulkOrderService_.retrieve(id, {}, sharedContext)
      return this.baseRepository_.serialize<BulkOrderDTO>(order)
    } catch {
      return undefined
    }
  }

  @InjectTransactionManager()
  async approveBulkOrder(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<BulkOrderDTO> {
    const order = await this.bulkOrderService_.update(
      [{ id, status: "approved" }],
      sharedContext
    )
    return this.baseRepository_.serialize<BulkOrderDTO>(order[0])
  }

  @InjectTransactionManager()
  async rejectBulkOrder(
    id: string,
    reason?: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<BulkOrderDTO> {
    const order = await this.bulkOrderService_.update(
      [{ id, status: "rejected", rejection_reason: reason }],
      sharedContext
    )
    return this.baseRepository_.serialize<BulkOrderDTO>(order[0])
  }
}
