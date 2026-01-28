import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDB, getDB } from './src/db';

import PlantListScreen from './src/screens/PlantListScreen';
import PlantFormScreen from './src/screens/PlantFormScreen';
import PlantDetailScreen from './src/screens/PlantDetailScreen';
import RegisterWateringScreen from './src/screens/RegisterWateringScreen';
import RegisterHumidityScreen from './src/screens/RegisterHumidityScreen';


const Stack = createNativeStackNavigator();

export default function App() {

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDB();
        //clean tables-------
        const db = getDB();
        //await db.executeSql('DELETE FROM plants');
        //await db.executeSql('DROP TABLE IF EXISTS plants');
        //await db.executeSql('DROP TABLE IF EXISTS moisture_logs');
        //-------------------
        setDbReady(true);
        console.log('Database ready');
      } catch (e) {
        console.error('DB initialization failed:', e);
      }
    };
    setupDB();
  }, []);

  if (!dbReady) {
    // Opcional: puedes mostrar un splash o loader mientras DB se inicializa
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="PlantList"
          component={PlantListScreen}
          options={{ title: 'Mis plantas' }}
        />
        <Stack.Screen
          name="PlantForm"
          component={PlantFormScreen}
          options={{ title: 'Nueva planta' }}
        />
        <Stack.Screen
          name="PlantDetail"
          component={PlantDetailScreen}
          options={{ title: 'Detalle de planta' }}
        />
        <Stack.Screen
          name="RegisterWatering"
          component={RegisterWateringScreen}
          options={{ title: 'Registrar riego' }}
        />
        <Stack.Screen
          name="RegisterHumidity"
          component={RegisterHumidityScreen}
          options={{ title: 'Registrar humedad' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}