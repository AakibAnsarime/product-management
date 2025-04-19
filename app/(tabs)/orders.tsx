import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Platform } from 'react-native';
import { Button, TextInput, Card, FAB, SegmentedButtons, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Order, Product } from '@/utils/types';
import { getOrders, saveOrder, deleteOrder, updateOrder, getProducts } from '@/utils/storage';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const colorScheme = useColorScheme();
  
  // Form states
  const [customerName, setCustomerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
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
    if (loadedProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(loadedProducts[0].id);
    }
  };

  const calculateTotalPrice = (productId: string, qty: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.price * qty : 0;
  };

  const handleSave = async () => {
    if (!customerName || !selectedProductId || !quantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const totalPrice = calculateTotalPrice(selectedProductId, parseInt(quantity));
    const newOrder: Order = {
      id: editingOrder?.id || Date.now().toString(),
      customerName,
      productId: selectedProductId,
      quantity: parseInt(quantity),
      totalPrice,
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
    setSelectedProductId(order.productId);
    setQuantity(order.quantity.toString());
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
    setSelectedProductId(products[0]?.id || '');
    setQuantity('');
    setPaymentStatus('PENDING');
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <ThemedText type="defaultSemiBold">
            Customer: {item.customerName}
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
        <ThemedText>
          Product: {getProductName(item.productId)}
        </ThemedText>
        <ThemedText>
          Quantity: {item.quantity}
        </ThemedText>
        <ThemedText>
          Total: ${item.totalPrice.toFixed(2)}
        </ThemedText>
        <ThemedText style={item.paymentStatus === 'PAID' ? styles.completedText : styles.pendingText}>
          Status: {item.paymentStatus}
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

  return (
    <ThemedView style={styles.container}>
      {showForm ? (
        <View style={styles.formContainer}>
          <View style={styles.form}>
            <TextInput
              label="Customer Name"
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.input}
            />
            <View style={styles.pickerContainer}>
              <ThemedText>Product:</ThemedText>
              <View style={[
                styles.pickerWrapper,
                { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }
              ]}>
                <Picker
                  selectedValue={selectedProductId}
                  onValueChange={setSelectedProductId}
                  style={[
                    styles.picker,
                    { color: colorScheme === 'dark' ? '#fff' : '#000' }
                  ]}
                  dropdownIconColor={colorScheme === 'dark' ? '#fff' : '#000'}
                  mode="dropdown">
                  {products.map(product => (
                    <Picker.Item
                      key={product.id}
                      label={`${product.name} - $${product.price}`}
                      value={product.id}
                      color={colorScheme === 'dark' ? '#fff' : '#000'}
                      style={{
                        backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                      }}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <TextInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={styles.input}
            />
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
              <Button onPress={resetForm}>Cancel</Button>
              <Button mode="contained" onPress={handleSave}>
                {editingOrder ? 'Update' : 'Save'}
              </Button>
            </View>
          </View>
        </View>
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
    paddingTop: 50,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
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
    marginBottom: 16,
  },
  pickerWrapper: {
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
    elevation: 2,
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
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});