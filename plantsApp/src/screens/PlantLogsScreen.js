import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { getDB } from '../db';

export default function PlantLogsScreen({ route }) {
  const { plant, type } = route.params;
  const [logs, setLogs] = useState([]);

  const table = type === 'moisture' ? 'moisture_logs' : 'watering_logs';

  const loadLogs = async () => {
    const db = getDB();
    const [results] = await db.executeSql(
      `SELECT * FROM ${table} WHERE plant_id = ? ORDER BY date ASC`,
      [plant.id]
    );

    const rows = [];
    for (let i = 0; i < results.rows.length; i++) {
      rows.push(results.rows.item(i));
    }

    setLogs(rows);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const deleteLog = (id) => {
    Alert.alert(
      'Confirmar borrado',
      '¿Deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const db = getDB();
            await db.executeSql(
              `DELETE FROM ${table} WHERE id = ?`,
              [id]
            );
            loadLogs();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.date}>{item.date}</Text>
        {type === 'moisture' && (
          <Text style={styles.value}>{item.value}%</Text>
        )}
      </View>

      <TouchableOpacity onPress={() => deleteLog(item.id)}>
        <Text style={styles.delete}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No hay registros
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 10,
  },
  date: { fontWeight: '600' },
  value: { marginTop: 4 },
  delete: { color: 'red', fontSize: 18 },
});