import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Platform } from 'react-native';
import { Button, TextInput, Card, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Product } from '@/utils/types';
import { getProducts, saveProduct, deleteProduct, updateProduct } from '@/utils/storage';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const colorScheme = useColorScheme();

  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    const loadedProducts = await getProducts();
    setProducts(loadedProducts);
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name,
      price: parseFloat(price),
    };

    if (editingProduct) {
      await updateProduct(newProduct);
    } else {
      await saveProduct(newProduct);
    }

    setName('');
    setPrice('');
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${product.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(product.id);
            loadProducts();
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]}>
      <Card.Content>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText>Price: ${item.price.toFixed(2)}</ThemedText>
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
          <View style={[
            styles.form, 
            { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF', borderRadius: 8 }
          ]}>
            <TextInput
              label="Product Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              label="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.formButtons}>
              <Button onPress={() => {
                setShowForm(false);
                setEditingProduct(null);
                setName('');
                setPrice('');
              }}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSave}>
                {editingProduct ? 'Update' : 'Save'}
              </Button>
            </View>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderProduct}
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
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 50 : 24, // Updated to match orders tab padding
  },
  form: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});