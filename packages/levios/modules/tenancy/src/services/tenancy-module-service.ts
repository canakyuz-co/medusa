import {
  Context,
  DAL,
  InternalModuleDeclaration,
  ModulesSdkTypes,
} from "@medusajs/framework/types"
import {
  InjectManager,
  MedusaContext,
  MedusaService,
  generateEntityId,
} from "@medusajs/framework/utils"
import { CommissionRule, StoreConfig, Tenant } from "@models"
import {
  CommissionRuleDTO,
  CreateCommissionRuleDTO,
  CreateStoreConfigDTO,
  CreateTenantDTO,
  ITenancyModuleService,
  StoreConfigDTO,
  TenantDTO,
  UpdateStoreConfigDTO,
} from "@types"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
  tenantService: ModulesSdkTypes.IMedusaInternalService<any>
  storeConfigService: ModulesSdkTypes.IMedusaInternalService<any>
  commissionRuleService: ModulesSdkTypes.IMedusaInternalService<any>
}

export class TenancyModuleService
  extends MedusaService<{
    Tenant: { dto: TenantDTO }
    StoreConfig: { dto: StoreConfigDTO }
    CommissionRule: { dto: CommissionRuleDTO }
  }>({ Tenant, StoreConfig, CommissionRule })
  implements ITenancyModuleService
{
  protected baseRepository_: DAL.RepositoryService
  protected readonly tenantDbService_: ModulesSdkTypes.IMedusaInternalService<any>
  protected readonly storeConfigDbService_: ModulesSdkTypes.IMedusaInternalService<any>
  protected readonly commissionRuleDbService_: ModulesSdkTypes.IMedusaInternalService<any>

  constructor(
    {
      baseRepository,
      tenantService,
      storeConfigService,
      commissionRuleService,
    }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)

    this.baseRepository_ = baseRepository
    this.tenantDbService_ = tenantService
    this.storeConfigDbService_ = storeConfigService
    this.commissionRuleDbService_ = commissionRuleService
  }

  @InjectManager()
  async listTenants(
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TenantDTO[]> {
    const tenants = await this.tenantDbService_.list({}, {}, sharedContext)
    return this.baseRepository_.serialize<TenantDTO[]>(tenants)
  }

  @InjectManager()
  async createTenant(
    data: CreateTenantDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TenantDTO> {
    const tenant = await this.tenantDbService_.create(
      {
        id: generateEntityId(undefined, "tenant"),
        name: data.name,
        slug: data.slug,
        default_region: data.default_region ?? null,
        default_currency: data.default_currency ?? "TRY",
        metadata: data.metadata ?? null,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<TenantDTO>(tenant)
  }

  @InjectManager()
  async listStores(
    tenantId?: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<StoreConfigDTO[]> {
    const filters = tenantId ? { tenant_id: tenantId } : {}
    const stores = await this.storeConfigDbService_.list(
      filters,
      {},
      sharedContext
    )
    return this.baseRepository_.serialize<StoreConfigDTO[]>(stores)
  }

  @InjectManager()
  async createStoreConfig(
    data: CreateStoreConfigDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<StoreConfigDTO> {
    const store = await this.storeConfigDbService_.create(
      {
        id: generateEntityId(undefined, "store_cfg"),
        tenant_id: data.tenant_id,
        store_name: data.store_name,
        store_slug: data.store_slug,
        region_id: data.region_id ?? null,
        currency_code: data.currency_code ?? "TRY",
        whatsapp_number: data.whatsapp_number ?? null,
        modules_enabled: data.modules_enabled ?? [],
        providers_enabled: data.providers_enabled ?? [],
        metadata: data.metadata ?? null,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<StoreConfigDTO>(store)
  }

  @InjectManager()
  async updateStoreConfig(
    id: string,
    data: UpdateStoreConfigDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<StoreConfigDTO> {
    const store = await this.storeConfigDbService_.update(
      {
        selector: { id },
        data: {
          store_name: data.store_name,
          store_slug: data.store_slug,
          region_id: data.region_id,
          currency_code: data.currency_code,
          whatsapp_number: data.whatsapp_number,
          modules_enabled: data.modules_enabled,
          providers_enabled: data.providers_enabled,
          metadata: data.metadata,
        },
      },
      sharedContext
    )

    return this.baseRepository_.serialize<StoreConfigDTO>(store)
  }

  @InjectManager()
  async listCommissionRules(
    tenantId?: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<CommissionRuleDTO[]> {
    const filters = tenantId ? { tenant_id: tenantId } : {}
    const rules = await this.commissionRuleDbService_.list(
      filters,
      {},
      sharedContext
    )
    return this.baseRepository_.serialize<CommissionRuleDTO[]>(rules)
  }

  @InjectManager()
  async createCommissionRule(
    data: CreateCommissionRuleDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<CommissionRuleDTO> {
    const rule = await this.commissionRuleDbService_.create(
      {
        id: generateEntityId(undefined, "comm_rule"),
        tenant_id: data.tenant_id,
        type: data.type,
        value: data.value,
        applies_to: data.applies_to ?? "order",
        metadata: data.metadata ?? null,
      },
      sharedContext
    )

    return this.baseRepository_.serialize<CommissionRuleDTO>(rule)
  }
}

export default TenancyModuleService
