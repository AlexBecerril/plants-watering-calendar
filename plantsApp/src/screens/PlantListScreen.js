import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getDB } from '../db';

export default function PlantListScreen({ navigation }) {
  
  const [plants, setPlants] = useState([]);

  //useEffect(() => {
    const loadPlants = async () => {
      try {
        const db = getDB();
        const results = await db.executeSql('SELECT * FROM plants');
        const rows = results[0].rows;
        const loadedPlants = [];
        for (let i = 0; i < rows.length; i++) {
          loadedPlants.push(rows.item(i));
        }
        setPlants(loadedPlants);
      } catch (error) {
        console.error('Error loading plants:', error);
      }
    };

    useFocusEffect(
      useCallback(() => {
        loadPlants();
      }, [])
    );

    //loadPlants();
  //}, []);
  
  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PlantDetail', { plant: item })}
          >
            <View style={styles.imagePlaceholder}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
              ) : (
                <Text>🌱</Text>
              )}
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.name}>
                    {item.name}
                    {item.scientific_name ? (
                    <Text style={styles.scientific}> ({item.scientific_name})</Text>
                    ) : null}
                </Text>

                <Text style={styles.meta}>
                    Último riego: {item.last_watering_date || 'Sin registro'}
                </Text>

                <Text style={styles.meta}>
                    Humedad ideal: {item.humidity_min}% – {item.humidity_max}%
                </Text>
            </View>

          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('PlantForm')}
      >
        <Text style={styles.addButtonText}>+ Agregar planta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
    borderRadius: 6
  },
  image: { width: 50, height: 50, borderRadius: 6 },
  name: { fontSize: 16, fontWeight: '600' },
  scientific: { fontSize: 12, color: '#555' },
  textContainer: {
    flex: 1
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  addButton: {
    padding: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    alignItems: 'center'
  },
  addButtonText: { color: '#fff', fontWeight: '600' }
});