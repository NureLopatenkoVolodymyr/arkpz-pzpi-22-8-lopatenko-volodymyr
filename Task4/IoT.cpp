#include <WiFi.h>
#include <PubSubClient.h>
#include <Keypad.h>

// Настройки Wi-Fi
const char* ssid = "Wokwi-GUEST"; // Имя сети Wi-Fi
const char* password = ""; // Пароль Wi-Fi

// Настройки MQTT
const char* mqttServer = "broker.hivemq.com"; // Публичный MQTT-брокер
const int mqttPort = 1883; // Порт MQTT

// Настройки для HC-SR04
const int trigPin = 23; // Пин TRIG датчика HC-SR04
const int echoPin = 22; // Пин ECHO датчика HC-SR04

// Настройки для Keypad
const byte ROWS = 4; // 4 строки
const byte COLS = 4; // 4 столбца
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {13, 12, 14, 27}; // Подключение строк к пинам
byte colPins[COLS] = {26, 25, 33, 32}; // Подключение столбцов к пинам
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Переменные для хранения введенного кода
String inputCode = "";
const int codeLength = 4; // Длина кода (4 символа)

// MQTT-клиент
WiFiClient espClient;
PubSubClient client(espClient);

// Функция подключения к Wi-Fi
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Wi-Fi connected!");
  Serial.println(WiFi.localIP());
}

// Функция подключения к MQTT
void connectToMQTT() {
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");

    // Генерация уникального клиентского ID
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("Connected to MQTT broker!");
    } else {
      Serial.print("Failed to connect. State: ");
      Serial.println(client.state());
      delay(2000); // Увеличьте задержку между попытками подключения
    }
  }
}

// Функция отправки данных в MQTT
void sendMQTTData(String topic, String message) {
  if (client.connected()) {
    client.publish(topic.c_str(), message.c_str());
    Serial.println("Message sent to MQTT: " + topic + " -> " + message);
  } else {
    Serial.println("MQTT not connected!");
  }
}

// Функция для измерения расстояния с HC-SR04
float measureDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distance = duration * 0.034 / 2; // Расстояние в см
  return distance;
}

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Подключение к Wi-Fi
  setupWiFi();

  // Настройка MQTT
  client.setServer(mqttServer, mqttPort);
  connectToMQTT();

  Serial.println("Система запущена. Введите код:");
}

void loop() {
  // Поддержание соединения с MQTT
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();

  // Чтение ввода с клавиатуры
  char key = keypad.getKey();
  if (key) {
    if (key == '#') { // Если нажата "#", завершаем ввод
      checkCode(inputCode);
      inputCode = ""; // Сбрасываем введенный код
    } else if (key == '*') { // Если нажата "*", сбрасываем ввод
      inputCode = "";
      Serial.println("Ввод сброшен.");
    } else {
      inputCode += key; // Добавляем символ к введенному коду
      Serial.print(key); // Печатаем реальный символ вместо "*"
    }
  }
}

// Функция проверки введенного кода
void checkCode(String code) {
  Serial.println();
  Serial.println("Введенный код: " + code); // Выводим введенный код в консоль

  // Измерение расстояния
  float distance = measureDistance();
  if (distance > 0) { // Если расстояние больше 0
    // Формируем JSON-сообщение с кодом и расстоянием
    String jsonPayload = "{\"doorId\": 1, \"accessCode\": \"" + code + "\", \"distance\": " + String(distance) + "}";
    sendMQTTData("iot/sensor", jsonPayload);
  } else {
    Serial.println("Ошибка измерения расстояния!");
  }
}