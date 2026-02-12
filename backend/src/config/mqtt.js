export const mqttConfig = {
  host: process.env.MQTT_HOST,
  port: Number(process.env.MQTT_PORT) || 8883,
  protocol: process.env.MQTT_PROTOCOL || "mqtts",
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  topicBase: process.env.MQTT_TOPIC_BASE || "smartcampus",
  qos: 1,
};