import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { ITenancyModuleService, UpdateStoreConfigDTO } from "@levios/tenancy"

export const PATCH = async (req: MedusaRequest, res: MedusaResponse) => {
  const tenancyModule = req.scope.resolve<ITenancyModuleService>("leviosTenancy")
  const { id } = req.params
  const payload = req.body as UpdateStoreConfigDTO

  const store = await tenancyModule.updateStoreConfig(id, payload)

  res.json({ store })
}
