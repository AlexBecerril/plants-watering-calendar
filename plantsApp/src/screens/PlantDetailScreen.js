import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

export default function PlantDetailScreen({ route, navigation }) {
  const { plant } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Nombre */}
      <Text style={styles.name}>{plant.name}</Text>
      <Text style={styles.scientific}>{plant.scientificName}</Text>

      {/* Imagen */}
      <View style={styles.imageWrapper}>
        {plant.image ? (
          <Image source={{ uri: plant.image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>🌱</Text>
        )}
      </View>

      {/* Humedad ideal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Humedad ideal</Text>
        <Text>{plant.humidityMin}% – {plant.humidityMax}%</Text>
      </View>

      {/* Riesgos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Riesgos</Text>
        <Text>Sequía: {plant.droughtRisk}%</Text>
        <Text>Ahogamiento: {plant.floodRisk}%</Text>
      </View>

      {/* Comentarios */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comentarios</Text>
        <Text>{plant.comments || 'Sin comentarios'}</Text>
      </View>

      {/* Último riego */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Último riego</Text>
        <Text>{plant.lastWateringDate || 'Sin registro'}</Text>
      </View>

      {/* Gráfica de humedad (placeholder) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historial de humedad</Text>

        <View style={styles.chart}>
          {plant.humidityLog.map((item, index) => (
            <View key={index} style={styles.chartItem}>
              <View
                style={[
                  styles.bar,
                  { height: item.value }
                ]}
              />
              <Text style={styles.chartLabel}>{item.date.slice(8)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.chartNote}>
          * Altura de la barra = % de humedad
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterWatering')}>
        <Text style={styles.buttonText}>Registrar riego</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
            navigation.navigate('RegisterHumidity', { plant })
        }
        >
        <Text style={styles.buttonText}>Registrar humedad</Text>
        </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  name: {
    fontSize: 24,
    fontWeight: '700'
  },
  scientific: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12
  },
  imageWrapper: {
    alignItems: 'center',
    marginVertical: 12
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12
  },
  imagePlaceholder: {
    fontSize: 64
  },
  card: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 6
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
    height: 100
  },
  chartItem: {
    alignItems: 'center',
    marginRight: 8
  },
  bar: {
    width: 20,
    backgroundColor: '#4caf50',
    borderRadius: 4
  },
  chartLabel: {
    fontSize: 10,
    marginTop: 4
  },
  chartNote: {
    fontSize: 10,
    color: '#777',
    marginTop: 6
  },
  button: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#388e3c',
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonSecondary: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#1976d2',
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }

});
