import {
  FabricType,
  FabricGrade,
  DimensionOption,
  FurnitureProductConfig,
  FurnitureSelection,
} from "../types"

/**
 * Configuration validation result
 */
export interface ConfigurationValidation {
  isValid: boolean
  errors: string[]
}

/**
 * Furniture configurator service
 * Manages product configuration and variant selection
 */
export class FurnitureConfiguratorService {
  /**
   * Validate a furniture selection against product configuration
   */
  validateSelection(
    config: FurnitureProductConfig,
    selection: FurnitureSelection
  ): ConfigurationValidation {
    const errors: string[] = []

    // Validate fabric selection
    const fabricExists = config.availableFabrics.some(
      (f) => f.id === selection.fabric.id
    )
    if (!fabricExists) {
      errors.push("Selected fabric is not available for this product")
    }

    // Validate color selection
    if (!selection.fabric.colorOptions.includes(selection.color)) {
      errors.push("Selected color is not available for this fabric")
    }

    // Validate dimension selection
    const dimensionExists = config.availableDimensions.some(
      (d) => d.id === selection.dimensions.id
    )
    if (!dimensionExists) {
      errors.push("Selected dimensions are not available for this product")
    }

    // Validate express production
    if (selection.expressProduction && !config.productionTime.expressAvailable) {
      errors.push("Express production is not available for this product")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get available fabrics filtered by grade
   */
  filterFabricsByGrade(
    fabrics: FabricType[],
    grade?: FabricGrade
  ): FabricType[] {
    if (!grade) {
      return fabrics
    }
    return fabrics.filter((f) => f.grade === grade)
  }

  /**
   * Get default selection for a product
   */
  getDefaultSelection(
    config: FurnitureProductConfig
  ): FurnitureSelection | null {
    if (
      config.availableFabrics.length === 0 ||
      config.availableDimensions.length === 0
    ) {
      return null
    }

    // Find default fabric (first standard grade, or first available)
    const defaultFabric =
      config.availableFabrics.find((f) => f.grade === FabricGrade.STANDARD) ||
      config.availableFabrics[0]

    // Find default dimension
    const defaultDimension =
      config.availableDimensions.find((d) => d.isDefault) ||
      config.availableDimensions[0]

    return {
      fabric: defaultFabric,
      color: defaultFabric.colorOptions[0] || "",
      dimensions: defaultDimension,
      expressProduction: false,
    }
  }

  /**
   * Get all possible configuration combinations count
   */
  getTotalCombinations(config: FurnitureProductConfig): number {
    const fabricColorCombinations = config.availableFabrics.reduce(
      (sum, fabric) => sum + fabric.colorOptions.length,
      0
    )

    return fabricColorCombinations * config.availableDimensions.length
  }

  /**
   * Generate SKU for a configuration
   */
  generateSku(
    productCode: string,
    selection: FurnitureSelection
  ): string {
    const fabricCode = selection.fabric.code.toUpperCase()
    const colorCode = selection.color
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s/g, "")
    const dimensionCode = `${selection.dimensions.width}x${selection.dimensions.depth}`

    return `${productCode}-${fabricCode}-${colorCode}-${dimensionCode}`
  }

  /**
   * Sort fabrics by grade (economy to luxury)
   */
  sortFabricsByGrade(fabrics: FabricType[]): FabricType[] {
    const gradeOrder: Record<FabricGrade, number> = {
      [FabricGrade.ECONOMY]: 0,
      [FabricGrade.STANDARD]: 1,
      [FabricGrade.PREMIUM]: 2,
      [FabricGrade.LUXURY]: 3,
    }

    return [...fabrics].sort(
      (a, b) => gradeOrder[a.grade] - gradeOrder[b.grade]
    )
  }

  /**
   * Sort dimensions by size (smallest to largest)
   */
  sortDimensionsBySize(dimensions: DimensionOption[]): DimensionOption[] {
    return [...dimensions].sort((a, b) => {
      const volumeA = a.width * a.depth * a.height
      const volumeB = b.width * b.depth * b.height
      return volumeA - volumeB
    })
  }
}

export default FurnitureConfiguratorService
