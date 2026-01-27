import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';

export default function PlantFormScreen() {
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');

  const [minHumidity, setMinHumidity] = useState('');
  const [maxHumidity, setMaxHumidity] = useState('');
  const [dryRisk, setDryRisk] = useState('');
  const [overwaterRisk, setOverwaterRisk] = useState('');
  const [comments, setComments] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled">

      {/* FOTO */}
      <TouchableOpacity style={styles.photoContainer}>
        <Text style={styles.photoText}>Agregar foto</Text>
      </TouchableOpacity>

      {/* NOMBRE */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* NOMBRE CIENTÍFICO */}
      <Text style={styles.label}>Nombre científico</Text>
      <TextInput
        style={styles.input}
        value={scientificName}
        onChangeText={setScientificName}
      />

      {/* HUMEDAD IDEAL */}
      <Text style={styles.label}>Humedad ideal mínima (%)</Text>
      <TextInput
        style={styles.input}
        value={minHumidity}
        onChangeText={setMinHumidity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Humedad ideal máxima (%)</Text>
      <TextInput
        style={styles.input}
        value={maxHumidity}
        onChangeText={setMaxHumidity}
        keyboardType="numeric"
      />

      {/* RIESGOS */}
      <Text style={styles.label}>Riesgo de sequía (%)</Text>
      <TextInput
        style={styles.input}
        value={dryRisk}
        onChangeText={setDryRisk}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Riesgo de ahogamiento (%)</Text>
      <TextInput
        style={styles.input}
        value={overwaterRisk}
        onChangeText={setOverwaterRisk}
        keyboardType="numeric"
      />

      {/* COMENTARIOS */}
      <Text style={styles.label}>Comentarios</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={comments}
        onChangeText={setComments}
        multiline
        numberOfLines={4}
      />

      {/* GUARDAR */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>Guardar planta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40
  },


  photoContainer: {
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },

  photoText: {
    color: '#666'
  },

  label: {
    marginTop: 12,
    fontWeight: '600'
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 4
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },

  saveButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    alignItems: 'center'
  },

  saveText: {
    color: '#fff',
    fontWeight: '600'
  }
});