import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDB } from '../db';

export default function RegisterHumidityScreen({ route, navigation }) {
  const [indicatorColor, setIndicatorColor] = useState('green');
  const { plant } = route.params;

  const [humidity, setHumidity] = useState(50);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

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

    if (humidity >= plant.humidity_min && humidity <= plant.humidity_max) {
      setStatus('Humedad ideal · Todo está bien');
      setIndicatorColor('#2e7d32'); // verde
    } else if (
      humidity >= plant.humidity_min - margin &&
      humidity <= plant.humidity_max + margin
    ) {
      setStatus('Humedad fuera del rango · Atención');
      setIndicatorColor('#f9a825'); // amarillo
    } else {
      setStatus('Humedad crítica · Riesgo para la planta');
      setIndicatorColor('#c62828'); // rojo
    }
  }, [humidity]);

  const saveHumidity = async () => {
    try {
      const db = getDB();
      const isoDate = date.toISOString().split('T')[0];

      await db.transaction(async (tx) => {
        await tx.executeSql(
          `INSERT INTO moisture_logs (plant_id, date, value) VALUES (?, ?, ?)`,
          [plant.id, isoDate, humidity]
        );
      });

      Alert.alert('Éxito', 'Lectura de humedad guardada correctamente');
      navigation.goBack();
    } catch (e) {
      console.error('Error guardando humedad:', e);
      Alert.alert('Error', 'No se pudo guardar la lectura');
    }
  };

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

      {/* Selector de fecha */}
      <Text style={[styles.label, { marginTop: 24 }]}>Fecha de lectura</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateText}>{date.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={saveHumidity}>
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
    fontSize: 22,
    marginBottom: 12,
    fontWeight: '600'
  },
  humidityValue: {
    fontSize: 55,
    fontWeight: '800',
    color: '#1E88E5'
  },
  status: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  indicator: {
    width: 18,
    height: 18,
    borderRadius: 10,
    marginRight: 8,
    marginTop: 12
  },
  button: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#7E57C2',
    borderRadius: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16
  }
});