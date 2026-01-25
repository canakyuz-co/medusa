import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { FURNITURE_MODULE } from "../index"
import {
  FurnitureProductConfig,
  FurnitureSelection,
  FurniturePriceResult,
} from "../types"

type CalculateFurniturePriceInput = {
  config: FurnitureProductConfig
  selection: FurnitureSelection
}

/**
 * Step to calculate furniture price
 */
export const calculateFurniturePriceStep = createStep(
  "calculate-furniture-price-step",
  async (
    input: CalculateFurniturePriceInput,
    { container }
  ): Promise<StepResponse<FurniturePriceResult>> => {
    const furnitureModuleService = container.resolve(FURNITURE_MODULE)

    const result = furnitureModuleService.calculatePrice(
      input.config,
      input.selection
    )

    return new StepResponse(result)
  }
)

/**
 * Workflow to calculate furniture price
 */
export const calculateFurniturePriceWorkflow = createWorkflow(
  "calculate-furniture-price",
  (input: WorkflowData<CalculateFurniturePriceInput>) => {
    const result = calculateFurniturePriceStep(input)

    return new WorkflowResponse(result)
  }
)
