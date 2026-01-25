import { Module } from "@medusajs/framework/utils"
import { FurnitureModuleService } from "@services"

export const FURNITURE_MODULE = "leviosFurniture"

export default Module(FURNITURE_MODULE, {
  service: FurnitureModuleService,
})

export * from "./types"
export * from "./services"
