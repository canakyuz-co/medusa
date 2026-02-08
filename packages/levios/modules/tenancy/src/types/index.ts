export type TenantDTO = {
  id: string
  name: string
  slug: string
  status: "active" | "suspended"
  default_region?: string | null
  default_currency: string
  metadata?: Record<string, unknown> | null
}

export type StoreConfigDTO = {
  id: string
  tenant_id: string
  store_name: string
  store_slug: string
  region_id?: string | null
  currency_code: string
  whatsapp_number?: string | null
  modules_enabled: string[]
  providers_enabled: string[]
  metadata?: Record<string, unknown> | null
}

export type CommissionRuleDTO = {
  id: string
  tenant_id: string
  type: "percentage" | "fixed"
  value: number
  applies_to: "order" | "payment" | "refund"
  metadata?: Record<string, unknown> | null
}

export type CreateTenantDTO = {
  name: string
  slug: string
  default_region?: string | null
  default_currency?: string
  metadata?: Record<string, unknown> | null
}

export type CreateStoreConfigDTO = {
  tenant_id: string
  store_name: string
  store_slug: string
  region_id?: string | null
  currency_code?: string
  whatsapp_number?: string | null
  modules_enabled?: string[]
  providers_enabled?: string[]
  metadata?: Record<string, unknown> | null
}

export type UpdateStoreConfigDTO = {
  store_name?: string
  store_slug?: string
  region_id?: string | null
  currency_code?: string
  whatsapp_number?: string | null
  modules_enabled?: string[]
  providers_enabled?: string[]
  metadata?: Record<string, unknown> | null
}

export type CreateCommissionRuleDTO = {
  tenant_id: string
  type: "percentage" | "fixed"
  value: number
  applies_to?: "order" | "payment" | "refund"
  metadata?: Record<string, unknown> | null
}

export interface ITenancyModuleService {
  listTenants(): Promise<TenantDTO[]>
  createTenant(data: CreateTenantDTO): Promise<TenantDTO>
  listStores(tenantId?: string): Promise<StoreConfigDTO[]>
  createStoreConfig(data: CreateStoreConfigDTO): Promise<StoreConfigDTO>
  updateStoreConfig(
    id: string,
    data: UpdateStoreConfigDTO
  ): Promise<StoreConfigDTO>
  listCommissionRules(tenantId?: string): Promise<CommissionRuleDTO[]>
  createCommissionRule(
    data: CreateCommissionRuleDTO
  ): Promise<CommissionRuleDTO>
}
