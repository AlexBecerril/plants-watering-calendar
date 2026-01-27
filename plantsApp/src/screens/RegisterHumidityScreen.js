import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function RegisterHumidityScreen({ route }) {
  const [indicatorColor, setIndicatorColor] = useState('green');
  
  const { plant } = route.params;

  const [humidity, setHumidity] = useState(50);
  const [status, setStatus] = useState('');

  // Simulación de lectura de humedad
  useEffect(() => {
    const interval = setInterval(() => {
      const randomValue = Math.floor(Math.random() * 101); // 0 - 100
      setHumidity(randomValue);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Evaluar estado según rangos de la planta
  useEffect(() => {
    const margin = 10;

    if (humidity >= plant.humidityMin && humidity <= plant.humidityMax) {
        setStatus('Humedad ideal · Todo está bien');
        setIndicatorColor('#2e7d32'); // verde
    } else if (
        humidity >= plant.humidityMin - margin &&
        humidity <= plant.humidityMax + margin
    ) {
        setStatus('Humedad fuera del rango · Atención');
        setIndicatorColor('#f9a825'); // amarillo
    } else {
        setStatus('Humedad crítica · Riesgo para la planta');
        setIndicatorColor('#c62828'); // rojo
    }
    }, [humidity]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Humedad actual</Text>

      <Text style={styles.humidityValue}>{humidity}%</Text>

      <View style={styles.statusRow}>
        <View
            style={[
            styles.indicator,
            { backgroundColor: indicatorColor }
            ]}
        />
        <Text style={styles.status}>{status}</Text>
        </View>


      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Guardar lectura</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600'
  },
  humidityValue: {
    fontSize: 72,
    fontWeight: '800',
    color: '#2e7d32'
  },
  status: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center'
  },
  button: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#388e3c',
    borderRadius: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  }

});