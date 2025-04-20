import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Platform, ScrollView } from 'react-native';
import { Button, TextInput, Card, FAB, SegmentedButtons, IconButton, List } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Order, Product, OrderItem } from '@/utils/types';
import { getOrders, saveOrder, deleteOrder, updateOrder, getProducts } from '@/utils/storage';

interface OrderItemForm extends OrderItem {
  id: string; // Temporary ID for form management
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const colorScheme = useColorScheme();
  
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PENDING');

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
      loadProducts();
    }, [])
  );

  const loadOrders = async () => {
    const loadedOrders = await getOrders();
    setOrders(loadedOrders);
  };

  const loadProducts = async () => {
    const loadedProducts = await getProducts();
    setProducts(loadedProducts);
  };

  const addOrderItem = () => {
    if (products.length === 0) {
      Alert.alert('Error', 'No products available');
      return;
    }
    
    setOrderItems([
      ...orderItems,
      {
        id: Date.now().toString(),
        productId: products[0].id,
        quantity: 1,
        price: products[0].price
      }
    ]);
  };

  const removeOrderItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const updateOrderItem = (itemId: string, productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setOrderItems(orderItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          productId,
          quantity,
          price: product.price * quantity
        };
      }
      return item;
    }));
  };

  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.price, 0);
  };

  const handleSave = async () => {
    if (!customerName || orderItems.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and add at least one product');
      return;
    }

    const newOrder: Order = {
      id: editingOrder?.id || Date.now().toString(),
      customerName,
      items: orderItems.map(({ id, ...item }) => item), // Remove temporary ID
      totalPrice: calculateTotalPrice(),
      orderDate: new Date().toISOString(),
      paymentStatus,
    };

    if (editingOrder) {
      await updateOrder(newOrder);
    } else {
      await saveOrder(newOrder);
    }

    resetForm();
    loadOrders();
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setCustomerName(order.customerName);
    setOrderItems(order.items.map(item => ({
      ...item,
      id: Date.now().toString() // Add temporary ID for form management
    })));
    setPaymentStatus(order.paymentStatus);
    setShowForm(true);
  };

  const handleDelete = async (order: Order) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteOrder(order.id);
            loadOrders();
          },
        },
      ]
    );
  };

  const handleMarkComplete = async (order: Order) => {
    const updatedOrder: Order = {
      ...order,
      paymentStatus: 'PAID' as const
    };
    await updateOrder(updatedOrder);
    loadOrders();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingOrder(null);
    setCustomerName('');
    setOrderItems([]);
    setPaymentStatus('PENDING');
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const renderOrderItem = (item: OrderItem) => (
    <ThemedText>
      {getProductName(item.productId)} x {item.quantity} = ${item.price.toFixed(2)}
    </ThemedText>
  );

  const renderOrder = ({ item }: { item: Order }) => {
    // Safety check for potentially malformed orders
    if (!item || !Array.isArray(item.items)) {
      console.warn('Malformed order:', item);
      return null;
    }

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold">
              Customer: {item.customerName || 'Unknown'}
            </ThemedText>
            {item.paymentStatus !== 'PAID' && (
              <IconButton
                icon="check-circle"
                mode="contained"
                containerColor="#4CAF50"
                iconColor="#fff"
                size={20}
                onPress={() => handleMarkComplete(item)}
              />
            )}
          </View>
          {item.items.map((orderItem, index) => (
            <View key={index}>
              {renderOrderItem(orderItem)}
            </View>
          ))}
          <ThemedText>
            Total: ${(item.totalPrice || 0).toFixed(2)}
          </ThemedText>
          <ThemedText style={item.paymentStatus === 'PAID' ? styles.completedText : styles.pendingText}>
            Status: {item.paymentStatus || 'PENDING'}
          </ThemedText>
          <ThemedText>
            Date: {new Date(item.orderDate).toLocaleDateString()}
          </ThemedText>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => handleEdit(item)}>Edit</Button>
          <Button onPress={() => handleDelete(item)}>Delete</Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderOrderItemForm = (item: OrderItemForm, index: number) => (
    <Card key={item.id} style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemRow}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={item.productId}
              onValueChange={(productId) => 
                updateOrderItem(item.id, productId, item.quantity)
              }
              style={[
                styles.picker,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                }
              ]}
              dropdownIconColor={colorScheme === 'dark' ? '#fff' : '#000'}
              mode="dialog"
            >
              {products.map(product => (
                <Picker.Item
                  key={product.id}
                  label={`${product.name} - $${product.price}`}
                  value={product.id}
                />
              ))}
            </Picker>
          </View>
          <TextInput
            label="Qty"
            value={item.quantity.toString()}
            onChangeText={(text) => {
              const quantity = parseInt(text) || 0;
              updateOrderItem(item.id, item.productId, quantity);
            }}
            keyboardType="numeric"
            style={styles.quantityInput}
            mode="outlined"
          />
          <IconButton
            icon="delete"
            mode="contained"
            containerColor="#FF5252"
            iconColor="#fff"
            size={20}
            onPress={() => removeOrderItem(item.id)}
            style={styles.deleteButton}
          />
        </View>
        <ThemedText style={styles.subtotalText}>
          Subtotal: ${item.price.toFixed(2)}
        </ThemedText>
      </Card.Content>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      {showForm ? (
        <ScrollView 
          contentContainerStyle={[
            styles.formContainer,
            { minHeight: '100%' }
          ]}
        >
          <View style={styles.form}>
            <Card style={[
              styles.formCard,
              { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff' }
            ]}>
              <Card.Content>
                <TextInput
                  label="Customer Name"
                  value={customerName}
                  onChangeText={setCustomerName}
                  style={styles.input}
                  mode="outlined"
                />
                
                <List.Section>
                  <List.Subheader style={styles.sectionHeader}>Products</List.Subheader>
                  {orderItems.map((item, index) => renderOrderItemForm(item, index))}
                  <Button
                    mode="outlined"
                    onPress={addOrderItem}
                    style={styles.addButton}
                    icon="plus"
                  >
                    Add Product
                  </Button>
                </List.Section>

                <ThemedText type="defaultSemiBold" style={styles.totalText}>
                  Total: ${calculateTotalPrice().toFixed(2)}
                </ThemedText>

                <SegmentedButtons
                  value={paymentStatus}
                  onValueChange={(value) => setPaymentStatus(value as 'PAID' | 'PENDING')}
                  buttons={[
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'PAID', label: 'Paid' },
                  ]}
                  style={styles.segmentedButtons}
                />
                
                <View style={styles.formButtons}>
                  <Button 
                    onPress={resetForm}
                    style={styles.actionButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleSave}
                    style={styles.actionButton}
                  >
                    {editingOrder ? 'Update' : 'Save'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => setShowForm(true)}
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 50 : 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  formCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
    width: '100%',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  itemCard: {
    marginBottom: 8,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 16,
  },
  pickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  pickerWrapper: {
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    height: 50,
    justifyContent: 'center',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    } : {}),
  },
  picker: {
    marginTop: Platform.OS === 'ios' ? 0 : -8,
    width: '100%',
    height: 50,
  },
  quantityInput: {
    width: 80,
    marginHorizontal: 8,
    height: 50,
  },
  deleteButton: {
    margin: 0,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    minWidth: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#FFA000',
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 8,
  },
  totalText: {
    textAlign: 'right',
    marginVertical: 16,
    fontSize: 18,
  },
  subtotalText: {
    marginTop: 4,
    textAlign: 'right',
    opacity: 0.7,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});