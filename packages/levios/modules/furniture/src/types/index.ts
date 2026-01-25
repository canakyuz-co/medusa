/**
 * Fabric grade levels for pricing
 */
export enum FabricGrade {
  ECONOMY = "economy",
  STANDARD = "standard",
  PREMIUM = "premium",
  LUXURY = "luxury",
}

/**
 * Fabric type definitions
 */
export interface FabricType {
  id: string
  name: string
  code: string
  grade: FabricGrade
  pricePerSquareMeter: number
  colorOptions: string[]
  composition?: string
  careInstructions?: string
  imageUrl?: string
  metadata?: Record<string, unknown>
}

/**
 * Dimension option for furniture
 */
export interface DimensionOption {
  id: string
  name: string
  width: number
  depth: number
  height: number
  unit: "cm" | "in"
  priceMultiplier: number
  isDefault?: boolean
}

/**
 * Production time configuration
 */
export interface ProductionTimeConfig {
  /**
   * Base production time in days
   */
  baseDays: number

  /**
   * Additional days per customization
   */
  customizationDays: number

  /**
   * Express production available
   */
  expressAvailable: boolean

  /**
   * Express production days
   */
  expressDays?: number

  /**
   * Express surcharge percentage
   */
  expressSurchargePercent?: number
}

/**
 * Furniture product configuration
 */
export interface FurnitureProductConfig {
  /**
   * Product ID
   */
  productId: string

  /**
   * Available fabrics for this product
   */
  availableFabrics: FabricType[]

  /**
   * Available dimensions for this product
   */
  availableDimensions: DimensionOption[]

  /**
   * Base price (without fabric/dimension adjustments)
   */
  basePrice: number

  /**
   * Fabric surface area in square meters (used for fabric price calculation)
   */
  fabricSurfaceArea: number

  /**
   * Production time configuration
   */
  productionTime: ProductionTimeConfig

  /**
   * Currency code
   */
  currencyCode: string
}

/**
 * Furniture configuration selection
 */
export interface FurnitureSelection {
  /**
   * Selected fabric
   */
  fabric: FabricType

  /**
   * Selected color
   */
  color: string

  /**
   * Selected dimensions
   */
  dimensions: DimensionOption

  /**
   * Express production requested
   */
  expressProduction?: boolean
}

/**
 * Furniture price calculation result
 */
export interface FurniturePriceResult {
  /**
   * Base price
   */
  basePrice: number

  /**
   * Fabric cost
   */
  fabricCost: number

  /**
   * Dimension adjustment
   */
  dimensionAdjustment: number

  /**
   * Express surcharge (if applicable)
   */
  expressSurcharge: number

  /**
   * Total price
   */
  totalPrice: number

  /**
   * Currency code
   */
  currencyCode: string

  /**
   * Price breakdown for display
   */
  breakdown: Array<{
    label: string
    amount: number
  }>
}

/**
 * Delivery estimate for furniture
 */
export interface FurnitureDeliveryEstimate {
  /**
   * Production time in days
   */
  productionDays: number

  /**
   * Shipping time in days (min-max)
   */
  shippingDays: {
    min: number
    max: number
  }

  /**
   * Total delivery time in days (min-max)
   */
  totalDays: {
    min: number
    max: number
  }

  /**
   * Display text
   */
  displayText: string
}

/**
 * DTO for creating a furniture product
 */
export interface CreateFurnitureProductDTO {
  productId: string
  basePrice: number
  fabricSurfaceArea: number
  availableFabricIds: string[]
  availableDimensionIds: string[]
  productionTime: ProductionTimeConfig
  currencyCode: string
}

/**
 * DTO for updating a furniture product
 */
export interface UpdateFurnitureProductDTO {
  basePrice?: number
  fabricSurfaceArea?: number
  availableFabricIds?: string[]
  availableDimensionIds?: string[]
  productionTime?: Partial<ProductionTimeConfig>
}

/**
 * Interface for Furniture Module Service
 */
export interface IFurnitureModuleService {
  /**
   * Calculate price for a furniture configuration
   */
  calculatePrice(
    config: FurnitureProductConfig,
    selection: FurnitureSelection
  ): FurniturePriceResult

  /**
   * Estimate delivery time
   */
  estimateDelivery(
    config: FurnitureProductConfig,
    selection: FurnitureSelection,
    destinationCountry: string
  ): FurnitureDeliveryEstimate

  /**
   * Get available fabrics
   */
  listFabrics(filters?: { grade?: FabricGrade }): Promise<FabricType[]>

  /**
   * Get fabric by ID
   */
  getFabric(id: string): Promise<FabricType | undefined>

  /**
   * Create a fabric
   */
  createFabric(data: Omit<FabricType, "id">): Promise<FabricType>

  /**
   * Update a fabric
   */
  updateFabric(id: string, data: Partial<FabricType>): Promise<FabricType>

  /**
   * Delete a fabric
   */
  deleteFabric(id: string): Promise<void>

  /**
   * Get available dimensions
   */
  listDimensions(): Promise<DimensionOption[]>

  /**
   * Get dimension by ID
   */
  getDimension(id: string): Promise<DimensionOption | undefined>

  /**
   * Create a dimension option
   */
  createDimension(data: Omit<DimensionOption, "id">): Promise<DimensionOption>

  /**
   * Update a dimension option
   */
  updateDimension(id: string, data: Partial<DimensionOption>): Promise<DimensionOption>

  /**
   * Delete a dimension option
   */
  deleteDimension(id: string): Promise<void>
}
