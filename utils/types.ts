export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  paymentStatus: 'PAID' | 'PENDING';
}