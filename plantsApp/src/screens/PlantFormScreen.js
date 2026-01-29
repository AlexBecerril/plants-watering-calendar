import React, { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { getDB } from '../db';

export default function PlantFormScreen({ navigation }) {
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');

  const [minHumidity, setMinHumidity] = useState('');
  const [maxHumidity, setMaxHumidity] = useState('');
  const [dryRisk, setDryRisk] = useState('');
  const [overwaterRisk, setOverwaterRisk] = useState('');
  const [comments, setComments] = useState('');

  const savePlant = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la planta es obligatorio');
      return;
    }

    const plant = {
      name,
      scientific_name: scientificName,
      humidity_min: parseInt(minHumidity) || 0,
      humidity_max: parseInt(maxHumidity) || 0,
      drought_risk: parseInt(dryRisk) || 0,
      flood_risk: parseInt(overwaterRisk) || 0,
      last_watering_date: null,
      image: null
    };

    try {
      const db = getDB();
      await db.executeSql(
        `INSERT INTO plants 
        (name, scientific_name, humidity_min, humidity_max, drought_risk, flood_risk, last_watering_date, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plant.name,
          plant.scientific_name,
          plant.humidity_min,
          plant.humidity_max,
          plant.drought_risk,
          plant.flood_risk,
          plant.last_watering_date,
          plant.image
        ]
      );

      Alert.alert('Éxito', 'Planta guardada correctamente');
      
      // Limpiar formulario
      setName('');
      setScientificName('');
      setMinHumidity('');
      setMaxHumidity('');
      setDryRisk('');
      setOverwaterRisk('');
      setComments('');

      // Opcional: navegar a la lista
      navigation.goBack();

    } catch (error) {
      console.error('Error saving plant:', error);
      Alert.alert('Error', 'No se pudo guardar la planta');
    }
  };


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
      <TouchableOpacity style={styles.saveButton} onPress={savePlant}>
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
    color: '#666',
    fontSize: 16
  },

  label: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 16
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
    fontSize: 16
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
    alignItems: 'center',
    marginBottom: 10
  },

  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});