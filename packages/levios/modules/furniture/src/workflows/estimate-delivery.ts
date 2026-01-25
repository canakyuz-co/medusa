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
  FurnitureDeliveryEstimate,
} from "../types"

type EstimateDeliveryInput = {
  config: FurnitureProductConfig
  selection: FurnitureSelection
  destinationCountry: string
}

/**
 * Step to estimate furniture delivery
 */
export const estimateDeliveryStep = createStep(
  "estimate-furniture-delivery-step",
  async (
    input: EstimateDeliveryInput,
    { container }
  ): Promise<StepResponse<FurnitureDeliveryEstimate>> => {
    const furnitureModuleService = container.resolve(FURNITURE_MODULE)

    const result = furnitureModuleService.estimateDelivery(
      input.config,
      input.selection,
      input.destinationCountry
    )

    return new StepResponse(result)
  }
)

/**
 * Workflow to estimate furniture delivery
 */
export const estimateDeliveryWorkflow = createWorkflow(
  "estimate-furniture-delivery",
  (input: WorkflowData<EstimateDeliveryInput>) => {
    const result = estimateDeliveryStep(input)

    return new WorkflowResponse(result)
  }
)
