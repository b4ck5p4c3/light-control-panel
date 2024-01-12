import express from "express";
import path from "path";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mqtt from "mqtt";
import fs from "fs";

dotenv.config();

const CA_CERTIFICATE_PATH = process.env.CA_CERTIFICATE_PATH ?? 'ca-cert.pem';
const MQTT_URL = process.env.MQTT_URL ?? 'mqtts://b4ck:b4ck@mqtt.internal.0x08.in';

const client = mqtt.connect(MQTT_URL, {
    ca: [fs.readFileSync(CA_CERTIFICATE_PATH)]
});

interface MappingItem {
    target: string;
    values: Record<string, string>;
}

const mapping: Record<string, MappingItem> = JSON.parse(fs.readFileSync(
    path.join(__dirname, "mapping.json")).toString());

interface UpdateRequestBody {
    id?: unknown;
    value?: unknown;
}

function update(data: UpdateRequestBody) {
    const map = mapping[String(data.id)];
    if (mapping === undefined) {
        throw new Error('id not found');
    }

    const value = map.values[String(data.value)];
    if (value === undefined) {
        throw new Error('value not found');
    }

    console.info(`Sent ${value} to ${map.target}`);
    client.publish(map.target, value);
}

const app = express();

app.use(bodyParser.json());

app.get('/', (_, res) =>
    res.sendFile(path.join(__dirname, 'index.html')));

app.post('/update', (req, res) => {
    update(req.body);
    res.status(200).end('ok');
});

app.listen(parseInt(process.env.PORT ?? '8080'), () => {
    console.info('Started');
});