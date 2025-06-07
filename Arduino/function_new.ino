#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <string>
#include <algorithm> // std::min, std::max を使う場合などに必要になることがある

// -------- グローバル定数とピン定義 --------
const int ACCEL_X_PIN = 12;
const int ACCEL_Y_PIN = 27;
const int ACCEL_Z_PIN = 25;
const int NUM_READINGS_ACCEL = 10;
const float ZERO_G_ADC_VALUE_ACCEL = 2048.0;
const float ADC_UNITS_PER_G_ACCEL = 1100.0 * (4095.0 / 3300.0);

const char* BLE_DEVICE_NAME_STR = "Hukuyakuji";
const char* SERVICE_UUID_STR = "4fafc201-1fb5-459e-8fcc-c5c9c331914a";
const char* EVENT_CHAR_UUID_STR = "beefcafe-36e1-4688-b7f5-00000000000c";

const float SHAKE_DETECT_THRESHOLD_G = 1.5;
const int SHAKE_DATA_WINDOW_SIZE = 10; // リングバッファのサイズ

// -------- グローバル変数 --------
// BLE関連 (変更なし)
BLEServer* pServer = nullptr;
BLEService* pService = nullptr;
BLECharacteristic* pEventCharacteristic = nullptr;
bool g_bleClientConnected = false;

// シェイク検出関連 (リングバッファに変更)
float g_xHistory[SHAKE_DATA_WINDOW_SIZE];
float g_yHistory[SHAKE_DATA_WINDOW_SIZE];
float g_zHistory[SHAKE_DATA_WINDOW_SIZE];
int g_accelHistoryIndex = 0; // 次にデータを書き込む位置
int g_accelHistoryCount = 0; // バッファ内の有効なデータ数
bool g_shakeOccurred = false;

// -------- BLE コールバック関数 --------
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServerInstance) {
    g_bleClientConnected = true;
    Serial.println("BLE Client Connected");
  }

  void onDisconnect(BLEServer* pServerInstance) {
    g_bleClientConnected = false;
    Serial.println("BLE Client Disconnected - Restarting advertising...");
    pServerInstance->getAdvertising()->start();
  }
};

// -------- 加速度センサー関連関数 -------- (変更なし)
void accelerometer_setup() {
  Serial.println("Accelerometer setup complete.");
}

void accelerometer_read_gs(float &xG, float &yG, float &zG) {
  long sumX = 0, sumY = 0, sumZ = 0;
  for (int i = 0; i < NUM_READINGS_ACCEL; i++) {
    sumX += analogRead(ACCEL_X_PIN);
    sumY += analogRead(ACCEL_Y_PIN);
    sumZ += analogRead(ACCEL_Z_PIN);
    delayMicroseconds(100);
  }
  int rawX = sumX / NUM_READINGS_ACCEL;
  int rawY = sumY / NUM_READINGS_ACCEL;
  int rawZ = sumZ / NUM_READINGS_ACCEL;

  xG = (rawX - ZERO_G_ADC_VALUE_ACCEL) / ADC_UNITS_PER_G_ACCEL;
  yG = (rawY - ZERO_G_ADC_VALUE_ACCEL) / ADC_UNITS_PER_G_ACCEL;
  zG = (rawZ - ZERO_G_ADC_VALUE_ACCEL) / ADC_UNITS_PER_G_ACCEL;
  // シリアルプロッタ用のデータ出力追加
  Serial.print(xG);
  Serial.print(",");
  Serial.print(yG);
  Serial.print(",");
  Serial.println(zG);
}

// -------- シェイク検出関連関数 --------
// 固定長配列を受け取るように変更
float get_peak_to_peak(const float history[], int count) {
  if (count == 0) {
    return 0.0;
  }
  float minVal = history[0];
  float maxVal = history[0];
  // count が SHAKE_DATA_WINDOW_SIZE より小さい場合（バッファ充填中）も考慮
  for (int i = 1; i < count; ++i) {
    if (history[i] < minVal) minVal = history[i];
    if (history[i] > maxVal) maxVal = history[i];
  }
  return maxVal - minVal;
}

void shake_detector_update(float xG, float yG, float zG) {
  // リングバッファにデータを格納
  g_xHistory[g_accelHistoryIndex] = xG;
  g_yHistory[g_accelHistoryIndex] = yG;
  g_zHistory[g_accelHistoryIndex] = zG;

  g_accelHistoryIndex = (g_accelHistoryIndex + 1) % SHAKE_DATA_WINDOW_SIZE;

  if (g_accelHistoryCount < SHAKE_DATA_WINDOW_SIZE) {
    g_accelHistoryCount++;
  }

  g_shakeOccurred = false; // 毎回の評価前にリセット

  // シェイク判定はバッファが完全に満たされてから行うのが一般的
  // もしくは、g_accelHistoryCount が一定数以上になったら行うなど調整可能
  if (g_accelHistoryCount < SHAKE_DATA_WINDOW_SIZE) { // 今回はウィンドウサイズ分溜まるまで判定しない
    return;
  }

  // バッファが満たされている場合、全要素を使ってピークツーピークを計算
  float ptpX = get_peak_to_peak(g_xHistory, SHAKE_DATA_WINDOW_SIZE);
  float ptpY = get_peak_to_peak(g_yHistory, SHAKE_DATA_WINDOW_SIZE);
  float ptpZ = get_peak_to_peak(g_zHistory, SHAKE_DATA_WINDOW_SIZE);
  
  // (もしバッファ充填中でも判定したい場合は、get_peak_to_peak に g_accelHistoryCount を渡す)
  // float ptpX = get_peak_to_peak(g_xHistory, g_accelHistoryCount);
  // float ptpY = get_peak_to_peak(g_yHistory, g_accelHistoryCount);
  // float ptpZ = get_peak_to_peak(g_zHistory, g_accelHistoryCount);


  if (ptpX > SHAKE_DETECT_THRESHOLD_G || ptpY > SHAKE_DETECT_THRESHOLD_G || ptpZ > SHAKE_DETECT_THRESHOLD_G) {
    g_shakeOccurred = true;
  }
}

bool is_shake_detected() {
  return g_shakeOccurred;
}

// -------- BLE処理関連関数 -------- (変更なし)
void ble_setup() {
  BLEDevice::init(BLE_DEVICE_NAME_STR);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  pService = pServer->createService(SERVICE_UUID_STR);

  pEventCharacteristic = pService->createCharacteristic(
                         EVENT_CHAR_UUID_STR,
                         BLECharacteristic::PROPERTY_READ |
                         BLECharacteristic::PROPERTY_NOTIFY
                       );
  pEventCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID_STR);
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("BLE setup complete. Advertising started.");
}

void ble_send_signal(const char* signal_str) {
  if (g_bleClientConnected && pEventCharacteristic != nullptr) {
    pEventCharacteristic->setValue(signal_str);
    pEventCharacteristic->notify();
    Serial.println("-----------");
    Serial.println("");
    Serial.println("");
    Serial.print("Signal sent via BLE: ");
    Serial.println(signal_str);
    Serial.println("");
    Serial.println("");
    Serial.println("-----------");
  } else if (!g_bleClientConnected) {
    Serial.println("Cannot send BLE signal, no client connected.");
  }
}