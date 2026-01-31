import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getDB } from '../db';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import bleManager from '../utils/bleManager';

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
          console.log(rows.item(i));
          loadedPlants.push(rows.item(i));
        }
        setPlants(loadedPlants);
      } catch (error) {
        console.error('Error loading plants:', error);
      }
    };

    const exportDataToCSV = async () => {
      try {
        const db = getDB();

        //Leer plantas
        const plantsResult = await db.executeSql('SELECT * FROM plants');
        const plantsRows = plantsResult[0].rows;

        const plantsMap = {};
        for (let i = 0; i < plantsRows.length; i++) {
          const plant = plantsRows.item(i);
          //console.log(plant.id);
          //console.log(typeof plant.id);
          plantsMap[plant.id] = plant;
        }
        //console.log(plantsMap);

        //Leer moisture logs
        const moistureResult = await db.executeSql('SELECT * FROM moisture_logs');
        const moistureRows = moistureResult[0].rows;
        //console.log(moistureRows);

        //Leer watering logs
        const wateringResult = await db.executeSql('SELECT * FROM watering_logs');
        const wateringRows = wateringResult[0].rows;
        //console.log(wateringRows);

        const events = [];

        //Convertir moisture logs a eventos
        for (let i = 0; i < moistureRows.length; i++) {
          const log = moistureRows.item(i);
          //console.log(log);
          //console.log(typeof log.plant_id);
          const plant = plantsMap[log.plant_id];

          if (!plant) continue;

          console.log(plant);

          events.push({
            plant_id: log.plant_id,
            plant_scientific_name: plant.scientific_name,
            event_type: 'moisture',
            timestamp: log.date,
            humidity_value: log.value,
            humidity_min: plant.humidity_min,
            humidity_max: plant.humidity_max,
            drought_risk: plant.drought_risk,
            flood_risk: plant.flood_risk
          });
        }

        //Convertir watering logs a eventos
        for (let i = 0; i < wateringRows.length; i++) {
          const log = wateringRows.item(i);
          //console.log(log);
          const plant = plantsMap[log.plant_id];

          if (!plant) continue;

          events.push({
            plant_id: log.plant_id,
            plant_scientific_name: plant.scientific_name,
            event_type: 'watering',
            timestamp: log.date,
            humidity_value: '',
            humidity_min: plant.humidity_min,
            humidity_max: plant.humidity_max,
            drought_risk: plant.drought_risk,
            flood_risk: plant.flood_risk
          });
        }

        console.log('EVENTS---------------->');
        console.log(events);

        //Ordenar por planta y tiempo
        events.sort((a, b) => {
          if (a.plant_id !== b.plant_id) {
            return a.plant_id - b.plant_id;
          }
          return new Date(a.timestamp) - new Date(b.timestamp);
        });

        //Generar CSV
        const headers = [
          'plant_id',
          'scientific_name',
          'event_type',
          'timestamp',
          'humidity_value',
          'humidity_min',
          'humidity_max',
          'drought_risk',
          'flood_risk'
        ];

        const csvRows = [
          headers.join(','),
          ...events.map(e =>
            [
              e.plant_id,
              e.plant_scientific_name,
              e.event_type,
              e.timestamp,
              e.humidity_value,
              e.humidity_min,
              e.humidity_max,
              e.drought_risk,
              e.flood_risk
            ].join(',')
          )
        ];

        const csvContent = csvRows.join('\n');

        console.log(csvContent);

        //Guardar archivo
        const fileName = `plant_events_${new Date().toISOString().slice(0, 10)}.csv`;
        //const path = `${RNFS.ExternalCachesDirectoryPath}/${fileName}`;
        //const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        const path =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

        await RNFS.writeFile(path, csvContent, 'utf8');

        console.log('CSV exportado en:', path);
        alert('CSV exportado correctamente');

        const exists = await RNFS.exists(path);
        if(exists){
          const shareOptions = {
            title: 'Exportar datos de plantas',
            url: `${path}`,
            type: 'text/csv',
            failOnCancel: false
          };
          await Share.open(shareOptions);
        }

      } catch (error) {
        console.error('Error exportando CSV:', error);
        alert('Error al exportar CSV');
      }
    };


    useFocusEffect(
      useCallback(() => {
        loadPlants();
      }, [])
    );

    useEffect(() => {
      console.log('PlantListScreen mounted');
      bleManager.connect(() => {
        console.log('Connected from PlantList');
      });

      return () => {
        console.log('PlantListScreen unmounted');
      };
    }, []);

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
      <TouchableOpacity
        style={styles.expButton}
        onPress={() => exportDataToCSV()}
      >
        <Text style={styles.expButtonText}>Exportar CSV</Text>
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
    width: 70,
    height: 70,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
    borderRadius: 6
  },
  image: { width: 70, height: 70, borderRadius: 6 },
  name: { fontSize: 18, fontWeight: '600' },
  scientific: { fontSize: 16, color: '#555' },
  textContainer: {
    flex: 1
  },
  meta: {
    fontSize: 16,
    color: '#666',
    marginTop: 2
  },
  addButton: {
    padding: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  expButton: {
    padding: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  expButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});