import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import base64 from 'react-native-base64';

class BLEService {
  manager = new BleManager();
  device = null;

  SERVICE_UUID = '12345678-1234-1234-1234-1234567890AB';
  CHARACTERISTIC_UUID = 'ABCD1234-1234-1234-1234-ABCDEF123456';

  async requestPermissions() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  }

  async connect(onConnected) {
    await this.requestPermissions();

    this.manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.log('Scan error', error);
        Alert.alert('BLE Error', error.message);
        return;
      }

      if (device.name && device.name.includes('ESP32')) {
        this.manager.stopDeviceScan();

        try {
          this.device = await device.connect();
          await this.device.discoverAllServicesAndCharacteristics();

          console.log('BLE connected:', this.device.id);

          Alert.alert(
            'BLE Connected',
            `Connected to ${device.name || 'device'}`
          );

          if (onConnected) onConnected();
        } catch (e) {
          console.log('Connection error', e);
          Alert.alert('Connection Failed', e.message);
        }
      }
    });
  }

  async readHumidity(onValue) {
    if (!this.device) {
        Alert.alert('BLE', 'No device connected');
        return;
    }

    try {
        const characteristic =
        await this.device.readCharacteristicForService(
            this.SERVICE_UUID,
            this.CHARACTERISTIC_UUID
        );

        const decoded = base64.decode(characteristic.value);

        console.log('BLE decoded:', decoded);

        if (onValue) onValue(decoded);
    } catch (e) {
        Alert.alert('Read Error', e.message);
    }
  }

  destroy() {
    this.manager.destroy();
  }
}

export default new BLEService();