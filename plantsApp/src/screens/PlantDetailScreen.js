import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getDB } from '../db';
import { fetchPlantData } from '../utils/plantAPI';

export default function PlantDetailScreen({ route, navigation }) {
  const { plant } = route.params;
  const [wateringLog, setWateringLog] = useState([]);
  const [humidityLog, setHumidityLog] = useState([]);
  const screenWidth = Dimensions.get('window').width - 32;
  const [externalData, setExternalData] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const db = getDB();
        const today = new Date();
        const past30 = new Date();
        past30.setDate(today.getDate() - 29);
        const startDate = past30.toISOString().split('T')[0];

        // Generamos arreglo de fechas
        const dateArray = [];
        for (let d = new Date(past30); d <= today; d.setDate(d.getDate() + 1)) {
          dateArray.push(d.toISOString().split('T')[0]);
        }

        // Función para mapear logs
        const mapLogs = async (table, hasValue) => {
          const [results] = await db.executeSql(
            `SELECT date, ${hasValue ? 'value' : '1'} as value, MAX(id) as id
             FROM ${table}
             WHERE plant_id = ? AND date >= ?
             GROUP BY date
             ORDER BY date ASC`,
            [plant.id, startDate]
          );

          //console.log(results);

          //console.log(plant.id);

          /*const [results2] = await db.executeSql('SELECT * FROM moisture_logs');
          console.log(results2);
          for (let i = 0; i < results2.rows.length; i++) {
            const row = results2.rows.item(i);
            console.log(row);
          }*/

          //------------------------

          const logsByDate = {};
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            //console.log(row);
            logsByDate[row.date] = hasValue ? parseInt(row.value, 10) : 1;
          }

          // Devolvemos todos los días (null si no hay registro)
          return dateArray.map(date => ({
            date,
            value: logsByDate[date] ?? null
          }));
        };

        const wateringData = await mapLogs('watering_logs', false);
        const humidityData = await mapLogs('moisture_logs', true);

        //console.log(wateringData);
        //console.log(humidityData);

        setWateringLog(wateringData);
        setHumidityLog(humidityData);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, [plant.id]);

  useEffect(() => {
    const getExternalData = async () => {
      if (plant.scientific_name) {
        const data = await fetchPlantData(plant.scientific_name);
        if (data) setExternalData(data);
      }
    };
    getExternalData();
  }, [plant.scientific_name]);

  const prepareChartData = (data) => {
    //Alert.alert(data.toString());
    if (!data || data.length === 0) {
      const length = 30;

      return {
        labels: Array.from({ length }, (_, index) =>
          (index + 1) % 3 === 0 ? (index + 1).toString() : ''
        ),
        datasets: [
          {
            data: Array(length).fill(0)
          }
        ]
      };
    }


    return {
      labels: data.map((_, index) => (index + 1) % 3 === 0 ? (index + 1).toString() : ''),
      datasets: [{
        data: data.map(item => {
          const v = Number(item.value);
          return Number.isFinite(v) ? v : 0;
        }),
        strokeWidth: 2,
      }]
    };
  };

  const deletePlant = () => {
    Alert.alert(
      'Confirmar borrado',
      'Este registro se borrará permanentemente junto con todos sus registros de riego y humedad. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          style: 'destructive',
          onPress: () => {
            const db = getDB();
            db.transaction((tx) => {
              // borrar logs de humedad
              tx.executeSql(
                'DELETE FROM moisture_logs WHERE plant_id = ?',
                [plant.id],
                () => {
                  console.log('moisture_logs eliminados');
                },
                (_, error) => {
                  console.log('Error borrando moisture_logs:', error);
                  return true; // para indicar que manejamos el error
                }
              );

              // borrar logs de riego
              tx.executeSql(
                'DELETE FROM watering_logs WHERE plant_id = ?',
                [plant.id],
                () => {
                  console.log('watering_logs eliminados');
                },
                (_, error) => {
                  console.log('Error borrando watering_logs:', error);
                  return true;
                }
              );

              // borrar planta
              tx.executeSql(
                'DELETE FROM plants WHERE id = ?',
                [plant.id],
                () => {
                  console.log('Planta eliminada');
                  Alert.alert('Éxito', 'La planta y sus registros fueron eliminados');
                  navigation.goBack();
                },
                (_, error) => {
                  console.log('Error borrando planta:', error);
                  Alert.alert('Error', 'No se pudo borrar la planta');
                  return true;
                }
              );
            });
          },
        },
      ]
    );
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{plant.name}</Text>
      <Text style={styles.scientific}>{plant.scientific_name}</Text>

      <View style={styles.imageWrapper}>
        {plant.image ? (
          <Image source={{ uri: plant.image }} style={styles.image} />
        ) : externalData?.image ? (
          <Image source={{ uri: externalData.image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>🌱</Text>
        )}
      </View>

      <View style={styles.card}>
        {externalData ? (
          <>
            <Text style={styles.cardTitle}>Información:</Text>
            <Text style={styles.cardText}>Familia: {externalData.family || ''}</Text>
            <Text style={styles.cardText}>Género: {externalData.genus || ''}</Text>
          </>
        ) : (
          <Text style={styles.cardText}>Cargando información...</Text>
        )}
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>Humedad ideal</Text>
        <Text style={styles.cardText}>{plant.humidity_min}% – {plant.humidity_max}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Riesgos</Text>
        <Text style={styles.cardText}>Sequía: {plant.drought_risk}%</Text>
        <Text style={styles.cardText}>Ahogamiento: {plant.flood_risk}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comentarios</Text>
        <Text style={styles.cardText}>{plant.comments || 'Sin comentarios'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Último riego</Text>
        <Text style={styles.cardText}>{plant.last_watering_date || 'Sin registro'}</Text>
      </View>

      {/* Gráfica de riegos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de Riegos (últimos 30 días)</Text>
        <LineChart
          data={prepareChartData(wateringLog)}
          width={screenWidth}
          height={200}
          chartConfig={{
            backgroundColor: '#f1f1f1',
            backgroundGradientFrom: '#f1f1f1',
            backgroundGradientTo: '#f1f1f1',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(30,136,229,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#1E88E5'
            }
          }}
          style={{ marginVertical: 8, borderRadius: 8 }}
        />
      </View>

      {/* Gráfica de humedad */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de Humedad (últimos 30 días)</Text>
        <LineChart
          data={prepareChartData(humidityLog)}
          width={screenWidth}
          height={200}
          chartConfig={{
            backgroundColor: '#f1f1f1',
            backgroundGradientFrom: '#f1f1f1',
            backgroundGradientTo: '#f1f1f1',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(126,87,194,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#7E57C2'
            }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 8 }}
        />
      </View>

      <TouchableOpacity
        style={styles.wateringButton}
        onPress={() => navigation.navigate('RegisterWatering', { plant })}
      >
        <Text style={styles.buttonText}>Registrar riego</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.humidityButton}
        onPress={() => navigation.navigate('RegisterHumidity', { plant })}
      >
        <Text style={styles.buttonText}>Registrar humedad</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('PlantForm', { plant })}
      >
        <Text style={styles.buttonText}>Editar planta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={deletePlant}
      >
        <Text style={styles.buttonText}>Borrar planta</Text>
      </TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16},
  name: { fontSize: 22, fontWeight: '700' },
  scientific: { fontSize: 18, color: '#555', marginBottom: 12 },
  imageWrapper: { alignItems: 'center', marginVertical: 12, backgroundColor:'#ccc', padding:10, borderRadius:20, minHeight: 120 },
  image: { width: 200, height: 200, borderRadius: 12 },
  imagePlaceholder: { fontSize: 64 },
  card: {
    marginTop: 5, 
    padding: 12, 
    backgroundColor: '#f1f1f1', 
    borderRadius: 8},
  cardTitle: { fontWeight: '600', marginBottom: 6, fontSize:16 },
  cardText: { fontSize:16 },
  wateringButton: { marginBottom: 16, padding: 14, backgroundColor: '#1E88E5', borderRadius: 8, alignItems: 'center' },
  humidityButton: { marginBottom: 16, padding: 14, backgroundColor: '#7E57C2', borderRadius: 8, alignItems: 'center' },
  editButton: { marginBottom: 16, padding: 14, backgroundColor: '#2e7d32', borderRadius: 8, alignItems: 'center' },
  deleteButton: { marginBottom: 16, padding: 14, backgroundColor: '#ff0000', borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize:16 }
});