#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int pinSensor = 34;

const float DRY_VALUE = 4095; //Calibrate
const float WET_VALUE = 700; //Calibrate

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;

#define SERVICE_UUID        "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "abcd1234-1234-1234-1234-abcdef123456"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    BLEDevice::startAdvertising();
  }
};

void setup()
{
  Serial.begin(115200);
  Wire.begin(33, 32);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED no encontrado");
    while(true);
  }

  display.clearDisplay();
  display.display();

  delay(1000);

  analogReadResolution(12);

  //Initialize Ble
  BLEDevice::init("ESP32-Humedad");
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->start();

  Serial.println("BLE listo, esperando conexión...");
}

void drawHumidityBar(int percent) {

  int barWidth = 110;
  int barHeight = 18;
  int x = 9;
  int y = 20;

  display.drawRect(x, y, barWidth, barHeight, SSD1306_WHITE);

  int fillWidth = map(percent, 0, 100, 0, barWidth);

  if(fillWidth > 2){
    display.fillRect(x + 1, y + 1, fillWidth - 2, barHeight - 2, SSD1306_WHITE);
  }
}

void loop()
{
  int moisture = analogRead(pinSensor);
  float moisture_perc = ((DRY_VALUE - moisture) / (DRY_VALUE - WET_VALUE));
  moisture_perc = constrain(moisture_perc, 0.0, 1.0);

  //-----------------------------------------
  float humidityPercent = moisture_perc * 100;

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Título
  display.setTextSize(2);
  display.setCursor(9,0);
  display.print("Humedad:");

  // Barra
  drawHumidityBar(humidityPercent);

  // Porcentaje grande centrado
  display.setTextSize(2);

  String text = String(humidityPercent) + "%";

  int16_t x1, y1;
  uint16_t w, h;

  display.getTextBounds(text, 0, 0, &x1, &y1, &w, &h);

  int x = (128 - w) / 2;
  int y = 45;

  display.setCursor(x, y);
  display.print(text);

  display.display();
  //----------------------------------------

  char buffer[50];
  sprintf(buffer, "Raw:%d | Humedad: %.1f%%", moisture, moisture_perc * 100);

  // Serial (USB)
  Serial.println(buffer);

  // BLE
  if (deviceConnected) {
    pCharacteristic->setValue(buffer);
    pCharacteristic->notify();
  }
  
  delay(1000);
}