// Hukumikuji.ino

// グローバル変数 (loop制御用)
unsigned long g_lastReadTime = 0;
const long READ_INTERVAL_MS = 100;

// シェイク信号送信のクールダウン用グローバル変数と定数
unsigned long g_lastShakeSignalSentTime = 0; // 最後にシェイク信号を送信した時刻
const unsigned long SHAKE_SIGNAL_COOLDOWN_MS = 5000; // 5秒 (5000ミリ秒)

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing Hukumikuji System (Functional Approach - No Deque with Cooldown)..."); // メッセージ変更

  accelerometer_setup();
  ble_setup();

  Serial.println("System initialized. Waiting for BLE connection...");
}

void loop() {
  unsigned long currentTime = millis(); // 現在時刻を一度だけ取得

  // センサーデータの読み取りとシェイク検出ロジック (0.1秒ごと)
  if (currentTime - g_lastReadTime >= READ_INTERVAL_MS) {
    g_lastReadTime = currentTime;

    float xG, yG, zG;
    accelerometer_read_gs(xG, yG, zG);

    shake_detector_update(xG, yG, zG);

    if (is_shake_detected()) {
      // シェイクが検出された場合、クールダウンタイムを確認
      if (currentTime - g_lastShakeSignalSentTime >= SHAKE_SIGNAL_COOLDOWN_MS) {
        Serial.println("Shake detected! Sending BLE signal.");
        ble_send_signal("shake");
        g_lastShakeSignalSentTime = currentTime; // 信号を送信した時刻を更新
      } else {
        // Serial.println("Shake detected, but in cooldown. Signal not sent."); // デバッグ用
      }
    }
  }
}