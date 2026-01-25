import { Module } from "@medusajs/framework/utils"
import { B2BModuleService } from "@services"

export const B2B_MODULE = "leviosB2B"

export default Module(B2B_MODULE, {
  service: B2BModuleService,
})

export * from "./types"
export * from "./services"
