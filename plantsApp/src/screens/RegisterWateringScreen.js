import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterWateringScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar riego</Text>

      <Text style={styles.label}>Fecha de riego</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text>{date.toISOString().split('T')[0]}</Text>
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

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>Guardar riego</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  label: { fontWeight: '600', marginBottom: 8 },
  dateButton: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8
  },
  saveButton: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#388e3c',
    borderRadius: 8,
    alignItems: 'center'
  },
  saveText: { color: '#fff', fontWeight: '600' }
});