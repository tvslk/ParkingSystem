#include <Arduino.h>
#include <SPI.h>
#include "Adafruit_Sensor.h"
#include "Adafruit_AM2320.h"

//server purpose
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "EDU_nodes";
const char* password = "1EDUwifi900!";

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;

#define LED 2 //default blue led
#define LED1 26 //yellow led
#define LED2 14 //red led
#define LED3 12 //green led

Adafruit_AM2320 am2320 = Adafruit_AM2320();

String httpGETRequest(const char* serverName);

void setup() {

  pinMode(2, OUTPUT);
  pinMode(26, OUTPUT);
  pinMode(14, OUTPUT);
  pinMode(12, OUTPUT);

  Serial.begin(115200);
  //while (!Serial) {
  //  delay(10);
  //}

  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  Serial.println("Adafruit AM2320 Basic Test");
  am2320.begin();
}

void loop() {

  digitalWrite(LED, HIGH);

  digitalWrite(LED1, HIGH);
  digitalWrite(LED3, LOW);

  delay(500);
  digitalWrite(LED, LOW);
  digitalWrite(LED1, LOW);
  digitalWrite(LED2, HIGH);

  delay(500);
  digitalWrite(LED2, LOW);
  digitalWrite(LED3, HIGH);
  
  delay(1000);

  Serial.print("Temp: "); Serial.println(am2320.readTemperature());
  Serial.print("Hum: "); Serial.println(am2320.readHumidity());

  // Send an HTTP GET request
  if ((millis() - lastTime) > timerDelay) {
    // Check WiFi connection status
    if(WiFi.status()== WL_CONNECTED){
      String serverPath = "http://172.17.116.114:8080";
      
      String message = httpGETRequest(serverPath.c_str());

      Serial.println(message);
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}

String httpGETRequest(const char* serverName) {
  WiFiClient client;
  HTTPClient http;
    
  // Your Domain name with URL path or IP address with path
  http.begin(client, serverName);
  
  // Send HTTP POST request
  int httpResponseCode = http.GET();
  
  String payload = "{}"; 
  
  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  http.end();

  return payload;
}