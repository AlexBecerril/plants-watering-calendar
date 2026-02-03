import React, { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { getDB } from '../db';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

export default function PlantFormScreen({ route, navigation }) {
  const editingPlant = route.params?.plant;

  const [name, setName] = useState(editingPlant?.name || '');
  const [scientificName, setScientificName] = useState(editingPlant?.scientific_name || '');
  const [minHumidity, setMinHumidity] = useState(editingPlant?.humidity_min?.toString() || '');
  const [maxHumidity, setMaxHumidity] = useState(editingPlant?.humidity_max?.toString() || '');
  const [dryRisk, setDryRisk] = useState(editingPlant?.drought_risk?.toString() || '');
  const [overwaterRisk, setOverwaterRisk] = useState(editingPlant?.flood_risk?.toString() || '');
  const [comments, setComments] = useState(editingPlant?.comments || '');
  const [image, setImage] = useState(editingPlant?.image || null);

  const persistImage = async (tempUri) => {
    const filename = `plant_${Date.now()}.jpg`;
    const destPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

    const cleanUri = tempUri.replace('file://', '');

    await RNFS.copyFile(cleanUri, destPath);

    return `file://${destPath}`;
  };

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
      comments: comments || '',
      last_watering_date: null,
      image: image || null
    };

    try {
      const db = getDB();

      if (editingPlant) {
        await db.executeSql(
          `UPDATE plants 
           SET name=?, scientific_name=?, humidity_min=?, humidity_max=?, drought_risk=?, flood_risk=?, comments=?, image=? 
           WHERE id=?`,
          [
            plant.name,
            plant.scientific_name,
            plant.humidity_min,
            plant.humidity_max,
            plant.drought_risk,
            plant.flood_risk,
            plant.comments,
            plant.image,
            editingPlant.id
          ]
        );
        Alert.alert('Éxito', 'Planta actualizada correctamente');
      }else{
        await db.executeSql(
          `INSERT INTO plants 
          (name, scientific_name, humidity_min, humidity_max, drought_risk, flood_risk, comments, last_watering_date, image) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            plant.name,
            plant.scientific_name,
            plant.humidity_min,
            plant.humidity_max,
            plant.drought_risk,
            plant.flood_risk,
            plant.comments,
            plant.last_watering_date,
            plant.image
          ]
        );
        Alert.alert('Éxito', 'Planta guardada correctamente');
      }

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

  const chooseImage = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Cámara',
          onPress: () => {
            launchCamera(
              { mediaType: 'photo', quality: 0.7 },
              async response => {
                if (!response.didCancel && !response.errorCode) {
                  const tempUri = response.assets[0].uri;
                  const permanentUri = await persistImage(tempUri);
                  setImage(permanentUri);
                }
              }
            );
          },
        },
        {
          text: 'Galería',
          onPress: () => {
            launchImageLibrary(
              { mediaType: 'photo', quality: 0.7 },
              async response => {
                if (!response.didCancel && !response.errorCode) {
                  const tempUri = response.assets[0].uri;
                  const permanentUri = await persistImage(tempUri);
                  setImage(permanentUri);
                }
              }
            );
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };



  return (
    <ScrollView contentContainerStyle={styles.container}
    keyboardShouldPersistTaps="handled">

      <Text style={styles.title}>{editingPlant ? 'Editar Planta' : 'Nueva Planta'}</Text>

      {/* FOTO */}
      <TouchableOpacity style={styles.photoContainer} onPress={chooseImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.photoImage} />
        ) : (
          <Text style={styles.photoText}>Agregar foto</Text>
        )}
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
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover'
  },
  photoContainer: {
    height: 200,
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