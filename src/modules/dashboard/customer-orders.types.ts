export type CustomerOrderPaymentStatus = "paid" | "pending" | "failed";

export type CustomerOrderInvoice = {
  number: string;
  orderReference: string;
  purchaseDate: string;
  titleSnapshot: string;
  amountToman: number;
  paymentStatus: CustomerOrderPaymentStatus;
  paymentReference?: string;
  maskedCustomerPhone: string;
};

export type CustomerOrder = {
  reference: string;
  titleSnapshot: string;
  purchaseDate: string;
  amountToman: number;
  paymentStatus: CustomerOrderPaymentStatus;
  paymentReference?: string;
  invoice: CustomerOrderInvoice | null;
};

export type CustomerOrdersSource =
  | { status: "preview"; orders: readonly CustomerOrder[] }
  | { status: "unavailable" }
  | { status: "error" };
