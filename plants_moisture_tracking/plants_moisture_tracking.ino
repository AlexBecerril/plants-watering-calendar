const int pinSensor = A0;
const int leds[6] = {2,3,4,5,6,7};
const float min_moist = 1015; //Calibrate
const float max_moist = 385; //Calibrate

void setup()
{
  Serial.begin(9600);
  // Initialize leds
  for (int i = 0; i < 6; i++) {
    pinMode(leds[i], OUTPUT);
    digitalWrite(leds[i], LOW);
  }
}

void loop()
{
  int moisture = analogRead(pinSensor);
  float moisture_perc = ((min_moist - moisture) / (min_moist - max_moist));
 
  int turn_leds_on = 0;
  if(moisture_perc >= 0.7){
    turn_leds_on = 6;
  }else if(moisture_perc >=0.50  && moisture_perc < 0.70){
    turn_leds_on = 5;
  }else if(moisture_perc >= 0.30  && moisture_perc < 0.50){
    turn_leds_on = 4;
  }else if(moisture_perc >= 0.15 && moisture_perc < 0.30){
    turn_leds_on = 3;
  }else if(moisture_perc >= 0.05 && moisture_perc < 0.15){
    turn_leds_on = 2;
  }else if(moisture_perc < 0.05){
    turn_leds_on = 1;
  }
  
  Serial.print("Raw: ");
  Serial.print(moisture);
  Serial.print(" | %: ");
  Serial.println(moisture_perc*100);
  
  //turn leds on
  for(int i=0; i<turn_leds_on; i++){
    digitalWrite(leds[i], HIGH);
  }
  //turn leds off
  for(int j=5; j>turn_leds_on-1; j--){
    digitalWrite(leds[j], LOW);
  }
  
  delay(1000);
}
