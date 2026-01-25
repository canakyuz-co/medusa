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
  generateEntityId,
} from "@medusajs/framework/utils"
import { Fabric, Dimension, FurnitureProduct } from "@models"
import {
  FabricType,
  FabricGrade,
  DimensionOption,
  FurnitureProductConfig,
  FurnitureSelection,
  FurniturePriceResult,
  FurnitureDeliveryEstimate,
  IFurnitureModuleService,
} from "../types"
import { FurniturePricingService } from "./pricing-service"
import { FurnitureDeliveryService } from "./delivery-service"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
  fabricService: ModulesSdkTypes.IMedusaInternalService<any>
  dimensionService: ModulesSdkTypes.IMedusaInternalService<any>
  furnitureProductService: ModulesSdkTypes.IMedusaInternalService<any>
}

export default class FurnitureModuleService
  extends MedusaService<{
    Fabric: { dto: FabricType }
    Dimension: { dto: DimensionOption }
    FurnitureProduct: { dto: FurnitureProductConfig }
  }>({
    Fabric,
    Dimension,
    FurnitureProduct,
  })
  implements IFurnitureModuleService
{
  protected baseRepository_: DAL.RepositoryService
  protected readonly fabricService_: ModulesSdkTypes.IMedusaInternalService<any>
  protected readonly dimensionService_: ModulesSdkTypes.IMedusaInternalService<any>
  protected readonly furnitureProductService_: ModulesSdkTypes.IMedusaInternalService<any>

  private pricingService: FurniturePricingService
  private deliveryService: FurnitureDeliveryService

  constructor(
    {
      baseRepository,
      fabricService,
      dimensionService,
      furnitureProductService,
    }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)

    this.baseRepository_ = baseRepository
    this.fabricService_ = fabricService
    this.dimensionService_ = dimensionService
    this.furnitureProductService_ = furnitureProductService

    this.pricingService = new FurniturePricingService()
    this.deliveryService = new FurnitureDeliveryService()
  }

  /**
   * Calculate price for a furniture configuration
   */
  calculatePrice(
    config: FurnitureProductConfig,
    selection: FurnitureSelection
  ): FurniturePriceResult {
    return this.pricingService.calculatePrice(config, selection)
  }

  /**
   * Estimate delivery time
   */
  estimateDelivery(
    config: FurnitureProductConfig,
    selection: FurnitureSelection,
    destinationCountry: string
  ): FurnitureDeliveryEstimate {
    return this.deliveryService.estimateDelivery(
      config,
      selection,
      destinationCountry
    )
  }

  /**
   * List fabrics with optional grade filter
   */
  @InjectManager()
  async listFabrics(
    filters?: { grade?: FabricGrade },
    @MedusaContext() sharedContext: Context = {}
  ): Promise<FabricType[]> {
    const fabrics = await this.fabricService_.list(
      filters?.grade ? { grade: filters.grade } : {},
      {},
      sharedContext
    )

    return this.baseRepository_.serialize<FabricType[]>(fabrics)
  }

  /**
   * Get fabric by ID
   */
  @InjectManager()
  async getFabric(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<FabricType | undefined> {
    try {
      const fabric = await this.fabricService_.retrieve(id, {}, sharedContext)
      return this.baseRepository_.serialize<FabricType>(fabric)
    } catch {
      return undefined
    }
  }

  /**
   * Create a fabric
   */
  @InjectTransactionManager()
  async createFabric(
    data: Omit<FabricType, "id">,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<FabricType> {
    const fabric = await this.fabricService_.create(
      {
        id: generateEntityId(undefined, "fabric"),
        name: data.name,
        code: data.code,
        grade: data.grade,
        price_per_square_meter: data.pricePerSquareMeter,
        color_options: data.colorOptions,
        composition: data.composition,
        care_instructions: data.careInstructions,
        image_url: data.imageUrl,
        metadata: data.metadata,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<FabricType>(fabric)
  }

  /**
   * Update a fabric
   */
  @InjectTransactionManager()
  async updateFabric(
    id: string,
    data: Partial<FabricType>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<FabricType> {
    const updateData: Record<string, any> = { id }

    if (data.name !== undefined) updateData.name = data.name
    if (data.code !== undefined) updateData.code = data.code
    if (data.grade !== undefined) updateData.grade = data.grade
    if (data.pricePerSquareMeter !== undefined)
      updateData.price_per_square_meter = data.pricePerSquareMeter
    if (data.colorOptions !== undefined)
      updateData.color_options = data.colorOptions
    if (data.composition !== undefined)
      updateData.composition = data.composition
    if (data.careInstructions !== undefined)
      updateData.care_instructions = data.careInstructions
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl
    if (data.metadata !== undefined) updateData.metadata = data.metadata

    const fabric = await this.fabricService_.update(
      [updateData],
      sharedContext
    )

    return this.baseRepository_.serialize<FabricType>(fabric[0])
  }

  /**
   * Delete a fabric
   */
  @InjectTransactionManager()
  async deleteFabric(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    await this.fabricService_.delete([id], sharedContext)
  }

  /**
   * List dimensions
   */
  @InjectManager()
  async listDimensions(
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DimensionOption[]> {
    const dimensions = await this.dimensionService_.list({}, {}, sharedContext)
    return this.baseRepository_.serialize<DimensionOption[]>(dimensions)
  }

  /**
   * Get dimension by ID
   */
  @InjectManager()
  async getDimension(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DimensionOption | undefined> {
    try {
      const dimension = await this.dimensionService_.retrieve(
        id,
        {},
        sharedContext
      )
      return this.baseRepository_.serialize<DimensionOption>(dimension)
    } catch {
      return undefined
    }
  }

  /**
   * Create a dimension option
   */
  @InjectTransactionManager()
  async createDimension(
    data: Omit<DimensionOption, "id">,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DimensionOption> {
    const dimension = await this.dimensionService_.create(
      {
        id: generateEntityId(undefined, "dim"),
        name: data.name,
        width: data.width,
        depth: data.depth,
        height: data.height,
        unit: data.unit,
        price_multiplier: data.priceMultiplier,
        is_default: data.isDefault,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<DimensionOption>(dimension)
  }

  /**
   * Update a dimension option
   */
  @InjectTransactionManager()
  async updateDimension(
    id: string,
    data: Partial<DimensionOption>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<DimensionOption> {
    const updateData: Record<string, any> = { id }

    if (data.name !== undefined) updateData.name = data.name
    if (data.width !== undefined) updateData.width = data.width
    if (data.depth !== undefined) updateData.depth = data.depth
    if (data.height !== undefined) updateData.height = data.height
    if (data.unit !== undefined) updateData.unit = data.unit
    if (data.priceMultiplier !== undefined)
      updateData.price_multiplier = data.priceMultiplier
    if (data.isDefault !== undefined) updateData.is_default = data.isDefault

    const dimension = await this.dimensionService_.update(
      [updateData],
      sharedContext
    )

    return this.baseRepository_.serialize<DimensionOption>(dimension[0])
  }

  /**
   * Delete a dimension option
   */
  @InjectTransactionManager()
  async deleteDimension(
    id: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    await this.dimensionService_.delete([id], sharedContext)
  }
}
