require('dotenv').config();
const mqtt = require('mqtt');
const fs = require('fs');

const options = {
    key: fs.readFileSync(process.env.PRIVATE_KEY_PATH),
    cert: fs.readFileSync(process.env.CERTIFICATE_PATH),
    ca: fs.readFileSync(process.env.ROOT_CA_PATH),
    protocol: 'mqtts'
};

const client = mqtt.connect(`mqtts://${process.env.AWS_IOT_CORE_ENDPOINT}`, options);
const topic = process.env.TOPIC || "iot/sensor/data";  // Default topic

// mqtt connection to AWS IoT Core
client.on('connect', async () => {
    console.log(`Connected to AWS IoT Core. Publishing to topic: ${topic}`);

    await dummySensor(); // Connect to dummy sensor

});

const dummySensor = async () => {
    let interval = 1;
    setInterval(async () => {
        const sensorData = fetchSensorData(); // Get data from sensor
        // Publish to AWS IoT CORE
        client.publish(topic, sensorData, { qos: 0 }, async (err) => {
            if (err) {
                console.error("Publish error:", err);
            } else {
                console.log(`Data sent: ${interval++}`, sensorData);
            }
        });
    }, 5 * 1000); // Sends data every 5 sec
}

function fetchSensorData() {
    // Dummy sensor data
    const totalSpots = 100; // Fixed total cunt

    // Generate random values while ensuring their sum is 100
    const occupied = Math.floor(Math.random() * 40) + 10; // 10 to 50
    const reserved = Math.floor(Math.random() * (50 - occupied)); // Adjust dynamically
    const faulty_sensors = Math.floor(Math.random() * (50 - occupied - reserved)); // Adjust dynamically
    const available = totalSpots - (occupied + reserved + faulty_sensors); // Ensure sum = 100

    // Assume this is the sensor data
    const sensorData = JSON.stringify({
        id: 'B1PS-001',
        device_name: "B1-parkingSensor",
        occupied,
        reserved,
        available,
        faulty_sensors,
        total: totalSpots,
        timestamp: new Date().toISOString()
    });
    return sensorData
}

client.on('error', (err) => {
    console.error("Connection error:", err);
});
