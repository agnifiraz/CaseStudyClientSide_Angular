import { PurchaseOrderItem } from './purchase-order-item';
/**
 * PurchaseOrder - interface for expense report
 */
export interface PurchaseOrder {
  id: number;
  vendorid: number;
  amount: number;
  items: PurchaseOrderItem[];
}
