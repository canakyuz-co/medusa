import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type {
  CreateTenantDTO,
  ITenancyModuleService,
} from "@levios/tenancy"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const tenancyModule = req.scope.resolve<ITenancyModuleService>("leviosTenancy")
  const tenants = await tenancyModule.listTenants()

  res.json({ tenants })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const tenancyModule = req.scope.resolve<ITenancyModuleService>("leviosTenancy")
  const payload = req.body as CreateTenantDTO
  const tenant = await tenancyModule.createTenant(payload)

  res.status(201).json({ tenant })
}
