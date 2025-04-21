import React, { useState } from 'react';
import { StyleSheet, Share, Alert, ScrollView, Platform, useColorScheme } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { exportData, importData } from '@/utils/storage';

const PRODUCTS_KEY = '@products';
const ORDERS_KEY = '@orders';

const SettingsScreen = () => {
  const [importText, setImportText] = useState('');
  const colorScheme = useColorScheme();

  const handleExport = async () => {
    try {
      const jsonData = await exportData();
      const fileName = `OrderApp_Backup_${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'web') {
        const element = document.createElement('a');
        const file = new Blob([jsonData], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else {
        const filePath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(filePath, jsonData, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Save Backup Data',
          UTI: 'public.json'
        });
      }
      
      Alert.alert('Success', 'Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportFromText = async () => {
    try {
      if (!importText) {
        Alert.alert('Error', 'Please paste your backup data');
        return;
      }

      const parsedData = JSON.parse(importText);
      if (!parsedData.products || !Array.isArray(parsedData.products) || 
          !parsedData.orders || !Array.isArray(parsedData.orders)) {
        throw new Error('Invalid data format');
      }

      await importData(importText);
      Alert.alert('Success', 'Data imported successfully');
      setImportText('');
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Invalid backup data format');
    }
  };

  const handleImportFromFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json'
      });
      
      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        const fileContent = await FileSystem.readAsStringAsync(file.uri);
        
        const parsedData = JSON.parse(fileContent);
        if (!parsedData.products || !Array.isArray(parsedData.products) || 
            !parsedData.orders || !Array.isArray(parsedData.orders)) {
          throw new Error('Invalid data format');
        }

        await importData(fileContent);
        Alert.alert('Success', 'Data imported successfully');
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import data. Please make sure the file contains valid backup data.');
    }
  };

  const handleResetProducts = () => {
    Alert.alert(
      'Reset Products',
      'Are you sure you want to delete all products? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
              Alert.alert('Success', 'All products have been deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset products');
            }
          },
        },
      ]
    );
  };

  const handleResetOrders = () => {
    Alert.alert(
      'Reset Orders',
      'Are you sure you want to delete all orders? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify([]));
              Alert.alert('Success', 'All orders have been deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset orders');
            }
          },
        },
      ]
    );
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all products and orders? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiSet([
                [PRODUCTS_KEY, JSON.stringify([])],
                [ORDERS_KEY, JSON.stringify([])],
              ]);
              Alert.alert('Success', 'All data has been reset');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]}>
          <Card.Content>
            <ThemedText type="title" style={styles.sectionTitle}>Export Data</ThemedText>
            <ThemedText style={styles.description}>
              Export your products and orders as a JSON file that you can import later.
            </ThemedText>
            <Button 
              mode="contained" 
              onPress={handleExport}
              style={styles.button}
            >
              Export Data
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]}>
          <Card.Content>
            <ThemedText type="title" style={styles.sectionTitle}>Import Data</ThemedText>
            <ThemedText style={styles.description}>
              Import your previously exported data by selecting a file or pasting the JSON content.
            </ThemedText>
            <Button 
              mode="contained"
              onPress={handleImportFromFile}
              style={styles.button}
            >
              Import from File
            </Button>
            <TextInput
              label="Or paste your backup data here"
              value={importText}
              onChangeText={setImportText}
              multiline
              numberOfLines={4}
              style={[styles.textInput, { backgroundColor: colorScheme === 'dark' ? '#2A2A4F' : '#FFFFFF' }]}
            />
            <Button 
              mode="contained"
              onPress={handleImportFromText}
              disabled={!importText}
              style={styles.button}
            >
              Import from Text
            </Button>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1E1E3F' : '#FBF7FF' }]}>
          <Card.Content>
            <ThemedText type="title" style={styles.sectionTitle}>Reset Data</ThemedText>
            <ThemedText style={styles.description}>
              Reset your data. Warning: This action cannot be undone!
            </ThemedText>
            <Button 
              mode="outlined"
              onPress={handleResetProducts}
              style={styles.button}
              textColor="red"
            >
              Reset Products
            </Button>
            <Button 
              mode="outlined"
              onPress={handleResetOrders}
              style={styles.button}
              textColor="red"
            >
              Reset Orders
            </Button>
            <Button 
              mode="contained"
              onPress={handleResetAll}
              style={styles.button}
              buttonColor="red"
            >
              Reset All Data
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
  },
  description: {
    marginVertical: 8,
  },
  button: {
    marginTop: 8,
  },
  textInput: {
    marginTop: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
});

export default SettingsScreen;