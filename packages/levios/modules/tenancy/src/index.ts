import { Module } from "@medusajs/framework/utils"
import { TenancyModuleService } from "@services"
import loadDefaults from "./loaders/defaults"

export const TENANCY_MODULE = "leviosTenancy"

export default Module(TENANCY_MODULE, {
  service: TenancyModuleService,
  loaders: [loadDefaults],
})

export * from "./types"
export * from "./services"
