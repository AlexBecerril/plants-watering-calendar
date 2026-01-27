import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PlantListScreen from './src/screens/PlantListScreen';
import PlantFormScreen from './src/screens/PlantFormScreen';
import PlantDetailScreen from './src/screens/PlantDetailScreen';
import RegisterWateringScreen from './src/screens/RegisterWateringScreen';
import RegisterHumidityScreen from './src/screens/RegisterHumidityScreen';


const Stack = createNativeStackNavigator();

export default function App() {
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