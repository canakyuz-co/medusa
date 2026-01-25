import {
  FurnitureProductConfig,
  FurnitureSelection,
  FurniturePriceResult,
} from "../types"

/**
 * Furniture pricing service
 * Calculates prices based on fabric, dimensions, and options
 */
export class FurniturePricingService {
  /**
   * Calculate the total price for a furniture configuration
   */
  calculatePrice(
    config: FurnitureProductConfig,
    selection: FurnitureSelection
  ): FurniturePriceResult {
    const breakdown: FurniturePriceResult["breakdown"] = []

    // Base price
    const basePrice = config.basePrice
    breakdown.push({ label: "Base price", amount: basePrice })

    // Fabric cost (price per m² × surface area)
    const fabricCost = Math.round(
      selection.fabric.pricePerSquareMeter * config.fabricSurfaceArea
    )
    breakdown.push({
      label: `Fabric (${selection.fabric.name})`,
      amount: fabricCost,
    })

    // Dimension adjustment
    const dimensionAdjustment = Math.round(
      basePrice * (selection.dimensions.priceMultiplier - 1)
    )
    if (dimensionAdjustment !== 0) {
      breakdown.push({
        label: `Size adjustment (${selection.dimensions.name})`,
        amount: dimensionAdjustment,
      })
    }

    // Express surcharge
    let expressSurcharge = 0
    if (
      selection.expressProduction &&
      config.productionTime.expressAvailable &&
      config.productionTime.expressSurchargePercent
    ) {
      expressSurcharge = Math.round(
        (basePrice + fabricCost + dimensionAdjustment) *
          (config.productionTime.expressSurchargePercent / 100)
      )
      breakdown.push({
        label: "Express production",
        amount: expressSurcharge,
      })
    }

    const totalPrice =
      basePrice + fabricCost + dimensionAdjustment + expressSurcharge

    return {
      basePrice,
      fabricCost,
      dimensionAdjustment,
      expressSurcharge,
      totalPrice,
      currencyCode: config.currencyCode,
      breakdown,
    }
  }

  /**
   * Calculate fabric cost for a given surface area
   */
  calculateFabricCost(
    fabricPricePerSqm: number,
    surfaceArea: number
  ): number {
    return Math.round(fabricPricePerSqm * surfaceArea)
  }

  /**
   * Calculate dimension price adjustment
   */
  calculateDimensionAdjustment(
    basePrice: number,
    multiplier: number
  ): number {
    return Math.round(basePrice * (multiplier - 1))
  }

  /**
   * Calculate express surcharge
   */
  calculateExpressSurcharge(
    subtotal: number,
    surchargePercent: number
  ): number {
    return Math.round(subtotal * (surchargePercent / 100))
  }
}

export default FurniturePricingService
