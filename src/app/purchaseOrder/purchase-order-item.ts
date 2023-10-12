/**
 * PurchaseOrderItem - container class for expense PurchaseOrder  item
 */
export interface PurchaseOrderItem {
  id: number;
  purchaseOrderid: number;
  productid: string;
  qty: number;
  price: number;
}
