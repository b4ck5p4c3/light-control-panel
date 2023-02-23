const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mqtt = require('mqtt')

dotenv.config('.env.production');
dotenv.config('.env');

const app = express();

app.use(bodyParser.json());

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'index.html')));

const client = mqtt.connect(process.env.MQTT_URI);

client.on('connect', () => {
    console.info('connected to mqtt');
});

const mapping = {
    'light-11': {
        target: 'modbus/endpointint/set/light_11',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'light-12': {
        target: 'modbus/endpointint/set/light_12',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'light-21': {
        target: 'modbus/endpointint/set/light_21',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'light-22': {
        target: 'modbus/endpointint/set/light_22',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'traffic-big-red': {
        target: 'modbus/endpointint/set/red_traffic',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'traffic-big-yellow': {
        target: 'modbus/endpointint/set/yellow_traffic',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'traffic-big-green': {
        target: 'modbus/endpointint/set/green_traffic',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'red-alert-lamp': {
        target: 'modbus/endpointint/set/red_space_light',
        values: {
            '0': 'False',
            '1': 'True'
        }
    },
    'traffic-small-red': {
        target: 'bus/devices/traffic-light/red',
        values: {
            '0': 'off',
            '1': 'on'
        }
    },
    'traffic-small-green': {
        target: 'bus/devices/traffic-light/green',
        values: {
            '0': 'off',
            '1': 'on'
        }
    },
    'hack-light': {
        target: 'modbus/endpointint/set/hack_light_220',
        values: {
            '0': 'False',
            '1': 'True'
        }
    }
};

async function update(data) {
    const map = mapping[data.id];
    if (mapping === undefined) {
        throw new Error('id not found');
    }

    const value = map.values[data.value];
    if (value === undefined) {
        throw new Error('value not found');
    }

    console.info(`sent ${value} to ${map.target}`);
    client.publish(map.target, value);
}

app.post('/update', (req, res) => {
    update(req.body)
        .then(() => {
            res.status(200).end('ok');
        })
        .catch(e => {
            res.status(500).end(e.toString());
        });
});


app.listen(parseInt(process.env.PORT ?? '8080'), () => {
    console.info('started');
});