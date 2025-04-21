import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Order, Product } from '@/utils/types';
import { getOrders, getProducts } from '@/utils/storage';

export default function DashboardScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [loadedOrders, loadedProducts] = await Promise.all([
      getOrders(),
      getProducts(),
    ]);
    setOrders(loadedOrders);
    setProducts(loadedProducts);
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.paymentStatus === 'PENDING').length;
  };

  const getTopProducts = () => {
    const productCounts = orders.reduce((acc, order) => {
      // Iterate through each item in the order
      order.items.forEach(item => {
        acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      });
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(productCounts)
      .map(([productId, count]) => ({
        product: products.find(p => p.id === productId),
        count,
      }))
      .filter(item => item.product)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <Card style={[styles.statsCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]} onPress={() => router.push('/orders')}>
            <Card.Content>
              <ThemedText type="defaultSemiBold">Total Orders</ThemedText>
              <ThemedText type="title">{orders.length}</ThemedText>
            </Card.Content>
          </Card>

          <Card style={[styles.statsCard, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]} onPress={() => router.push('/products')}>
            <Card.Content>
              <ThemedText type="defaultSemiBold">Total Products</ThemedText>
              <ThemedText type="title">{products.length}</ThemedText>
            </Card.Content>
          </Card>
        </View>

        <Card style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]}>
          <Card.Content>
            <ThemedText type="defaultSemiBold">Revenue</ThemedText>
            <ThemedText type="title">${getTotalRevenue().toFixed(2)}</ThemedText>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]}>
          <Card.Content>
            <ThemedText type="defaultSemiBold">Pending Orders</ThemedText>
            <ThemedText type="title">{getPendingOrders()}</ThemedText>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]}>
          <Card.Content>
            <ThemedText type="defaultSemiBold">Top Selling Products</ThemedText>
            {getTopProducts().map(({ product, count }) => (
              <View key={product?.id} style={styles.topProduct}>
                <ThemedText>{product?.name}</ThemedText>
                <ThemedText>Qty: {count}</ThemedText>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Added top padding
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  topProduct: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
