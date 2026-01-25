import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { B2B_MODULE } from "../index"
import { CreateDealerDTO, DealerDTO } from "../types"

/**
 * Step to create a dealer
 */
export const createDealerStep = createStep(
  "create-dealer-step",
  async (
    input: CreateDealerDTO,
    { container }
  ): Promise<StepResponse<DealerDTO, string>> => {
    const b2bModuleService = container.resolve(B2B_MODULE)

    const dealer = await b2bModuleService.createDealer(input)

    return new StepResponse(dealer, dealer.id)
  },
  async (dealerId, { container }) => {
    if (!dealerId) return

    const b2bModuleService = container.resolve(B2B_MODULE)

    // Soft delete or restore dealer on rollback
    // In this case, we might want to actually delete since it was just created
  }
)

/**
 * Workflow to create a dealer
 */
export const createDealerWorkflow = createWorkflow(
  "create-dealer",
  (input: WorkflowData<CreateDealerDTO>) => {
    const dealer = createDealerStep(input)

    return new WorkflowResponse(dealer)
  }
)
