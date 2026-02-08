import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type {
  CreateStoreConfigDTO,
  ITenancyModuleService,
} from "@levios/tenancy"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const tenancyModule = req.scope.resolve<ITenancyModuleService>("leviosTenancy")
  const tenantId = req.query?.tenant_id as string | undefined
  const stores = await tenancyModule.listStores(tenantId)

  res.json({ stores })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const tenancyModule = req.scope.resolve<ITenancyModuleService>("leviosTenancy")
  const payload = req.body as CreateStoreConfigDTO
  const store = await tenancyModule.createStoreConfig(payload)

  res.status(201).json({ store })
}
