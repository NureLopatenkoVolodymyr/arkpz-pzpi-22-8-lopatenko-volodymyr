#include <WiFi.h>
#include <PubSubClient.h>
#include <Keypad.h>

// Налаштування Wi-Fi
const char* ssid = "Wokwi-GUEST"; // Назва мережі Wi-Fi
const char* password = ""; // Пароль Wi-Fi

// Налаштування MQTT
const char* mqttServer = "broker.hivemq.com"; // Публічний MQTT-брокер
const int mqttPort = 1883; // Порт MQTT

// Налаштування для HC-SR04
const int trigPin = 23; // Пін TRIG датчика HC-SR04
const int echoPin = 22; // Пін ECHO датчика HC-SR04

// Налаштування для Keypad
const byte ROWS = 4; // 4 рядки
const byte COLS = 4; // 4 стовпці
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {13, 12, 14, 27}; // Підключення рядків до пінів
byte colPins[COLS] = {26, 25, 33, 32}; // Підключення стовпців до пінів
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// Змінні для зберігання введеного коду
String inputCode = "";
const int codeLength = 4; // Довжина коду (4 символи)

// MQTT-клієнт
WiFiClient espClient;
PubSubClient client(espClient);

// Функція підключення до Wi-Fi
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Підключення до Wi-Fi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("Підключено до Wi-Fi!");
  Serial.println(WiFi.localIP());
}

// Функція підключення до MQTT
void connectToMQTT() {
  while (!client.connected()) {
    Serial.println("Підключення до MQTT...");

    // Генерація унікального ідентифікатора клієнта
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("Підключено до MQTT брокера!");
    } else {
      Serial.print("Не вдалося підключитися. Стан: ");
      Serial.println(client.state());
      delay(2000); // Збільште затримку між спробами підключення
    }
  }
}

// Функція відправки даних через MQTT
void sendMQTTData(String topic, String message) {
  if (client.connected()) {
    client.publish(topic.c_str(), message.c_str());
    Serial.println("Повідомлення відправлено до MQTT: " + topic + " -> " + message);
  } else {
    Serial.println("MQTT не підключено!");
  }
}

// Функція для вимірювання відстані за допомогою HC-SR04
float measureDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distance = duration * 0.034 / 2; // Відстань у см
  return distance;
}

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Підключення до Wi-Fi
  setupWiFi();

  // Налаштування MQTT
  client.setServer(mqttServer, mqttPort);
  connectToMQTT();

  Serial.println("Система запущена. Введіть код:");
}

void loop() {
  // Підтримання з'єднання з MQTT
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();

  // Зчитування введення з клавіатури
  char key = keypad.getKey();
  if (key) {
    if (key == '#') { // Якщо натиснуто "#", завершуємо введення
      checkCode(inputCode);
      inputCode = ""; // Скидаємо введений код
    } else if (key == '*') { // Якщо натиснуто "*", скидаємо введення
      inputCode = "";
      Serial.println("Введення скинуто.");
    } else {
      inputCode += key; // Додаємо символ до введеного коду
      Serial.print(key); // Виводимо реальний символ замість "*"
    }
  }
}

// Функція перевірки введеного коду
void checkCode(String code) {
  Serial.println();
  Serial.println("Введений код: " + code); // Виводимо введений код у консоль

  // Вимірювання відстані
  float distance = measureDistance();
  if (distance > 0) { // Якщо відстань більше 0
    // Формуємо JSON-повідомлення з кодом та відстанню
    String jsonPayload = "{\"doorId\": 1, \"accessCode\": \"" + code + "\", \"distance\": " + String(distance) + "}";
    sendMQTTData("iot/sensor", jsonPayload);
  } else {
    Serial.println("Помилка вимірювання відстані!");
  }
}