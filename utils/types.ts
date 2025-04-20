export interface Product {
    id: string;
    name: string;
    price: number;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customerName: string;
    items: OrderItem[];
    totalPrice: number;
    orderDate: string;
    paymentStatus: 'PAID' | 'PENDING';
}