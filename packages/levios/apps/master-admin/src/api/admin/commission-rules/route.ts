import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type {
  CreateCommissionRuleDTO,
  ITenancyModuleService,
} from "@levios/tenancy"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const tenancyModule = req.scope.resolve<ITenancyModuleService>("leviosTenancy")
  const tenantId = req.query?.tenant_id as string | undefined
  const rules = await tenancyModule.listCommissionRules(tenantId)

  res.json({ rules })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const tenancyModule = req.scope.resolve<ITenancyModuleService>("leviosTenancy")
  const payload = req.body as CreateCommissionRuleDTO
  const rule = await tenancyModule.createCommissionRule(payload)

  res.status(201).json({ rule })
}
