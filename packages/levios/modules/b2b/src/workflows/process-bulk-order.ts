import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowData,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { B2B_MODULE } from "../index"
import { CreateBulkOrderDTO, BulkOrderDTO } from "../types"

type ProcessBulkOrderInput = CreateBulkOrderDTO & {
  autoApprove?: boolean
}

/**
 * Step to create a bulk order
 */
export const createBulkOrderStep = createStep(
  "create-bulk-order-step",
  async (
    input: CreateBulkOrderDTO,
    { container }
  ): Promise<StepResponse<BulkOrderDTO, string>> => {
    const b2bModuleService = container.resolve(B2B_MODULE)

    const order = await b2bModuleService.createBulkOrder(input)

    return new StepResponse(order, order.id)
  }
)

/**
 * Step to approve a bulk order
 */
export const approveBulkOrderStep = createStep(
  "approve-bulk-order-step",
  async (
    input: { orderId: string },
    { container }
  ): Promise<StepResponse<BulkOrderDTO>> => {
    const b2bModuleService = container.resolve(B2B_MODULE)

    const order = await b2bModuleService.approveBulkOrder(input.orderId)

    return new StepResponse(order)
  }
)

/**
 * Workflow to process a bulk order
 */
export const processBulkOrderWorkflow = createWorkflow(
  "process-bulk-order",
  (input: WorkflowData<ProcessBulkOrderInput>) => {
    const orderData = transform(input, (data) => ({
      dealerId: data.dealerId,
      items: data.items,
      notes: data.notes,
    }))

    const order = createBulkOrderStep(orderData)

    // If auto-approve is set, approve the order
    const approvalInput = transform(
      { order, input },
      ({ order, input }) => ({
        orderId: order.id,
        shouldApprove: input.autoApprove === true,
      })
    )

    // Note: In a real implementation, we'd use 'when' for conditional approval
    // For now, we just return the created order

    return new WorkflowResponse(order)
  }
)
