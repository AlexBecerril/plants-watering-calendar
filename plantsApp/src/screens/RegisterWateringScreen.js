import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDB } from '../db';

export default function RegisterWateringScreen({ route, navigation }) {
  const { plant } = route.params; 
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const saveWatering = async () => {
    try {
      const db = getDB();
      await db.executeSql(
        `INSERT INTO watering_logs (plant_id, date) VALUES (?, ?)`,
        [plant.id, date.toISOString().split('T')[0]]
      );
      await db.executeSql(
        `UPDATE plants SET last_watering_date = ? WHERE id = ?`,
        [date.toISOString().split('T')[0], plant.id]
      );
      Alert.alert('Éxito', 'Riego registrado correctamente');
      navigation.goBack();
    } catch (e) {
      console.error('Error guardando riego:', e);
      Alert.alert('Error', 'No se pudo registrar el riego');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar riego</Text>

      <Text style={styles.label}>Fecha de riego</Text>

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
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveWatering}>
        <Text style={styles.saveText}>Guardar riego</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  label: { fontWeight: '600', marginBottom: 8, fontSize:16 },
  dateButton: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8
  },
  dateText:{
    fontSize:16
  },
  saveButton: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#1E88E5',
    borderRadius: 8,
    alignItems: 'center'
  },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});