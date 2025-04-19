import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order } from './types';

const PRODUCTS_KEY = '@products';
const ORDERS_KEY = '@orders';

// Product operations
export const saveProduct = async (product: Product) => {
  try {
    const products = await getProducts();
    const updatedProducts = [...products, product];
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    return true;
  } catch (error) {
    console.error('Error saving product:', error);
    return false;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await AsyncStorage.getItem(PRODUCTS_KEY);
    return products ? JSON.parse(products) : [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const updateProduct = async (updatedProduct: Product) => {
  try {
    const products = await getProducts();
    const updatedProducts = products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    );
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const products = await getProducts();
    const updatedProducts = products.filter(product => product.id !== productId);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

// Order operations
export const saveOrder = async (order: Order) => {
  try {
    const orders = await getOrders();
    const updatedOrders = [...orders, order];
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    return true;
  } catch (error) {
    console.error('Error saving order:', error);
    return false;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const orders = await AsyncStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const updateOrder = async (updatedOrder: Order) => {
  try {
    const orders = await getOrders();
    const updatedOrders = orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    );
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    const orders = await getOrders();
    const updatedOrders = orders.filter(order => order.id !== orderId);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
};

// Export all data
export const exportData = async () => {
  try {
    const products = await getProducts();
    const orders = await getOrders();
    return JSON.stringify({
      products,
      orders,
      exportDate: new Date().toISOString()
    }, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

// Import data
export const importData = async (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    if (!data.products || !data.orders) {
      throw new Error('Invalid data format');
    }
    
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.products));
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};