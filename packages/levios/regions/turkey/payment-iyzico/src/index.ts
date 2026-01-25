import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { IyzicoProviderService } from "./services/iyzico-provider"

export default ModuleProvider(Modules.PAYMENT, {
  services: [IyzicoProviderService],
})

// Types
export * from "./types"

// Services
export { IyzicoProviderService } from "./services/iyzico-provider"
export { IyzicoInstallmentService } from "./services/iyzico-installment"

// Core
export { IyzicoBase } from "./core/iyzico-base"

// Utils
export * from "./utils"
