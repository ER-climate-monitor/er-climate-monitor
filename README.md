# ER-Climate Monitor

## Requirements

- python>=3.8
- docker (tested with version 27.3.1)

## Set-Up

1. Clone this repository:
```bash
git clone --recurse-submodules https://github.com/MatteoIorio11/er-climate-monitor.git
```

2. Start docker services (sometimes a timout can occurr, please, retry running
   the command):
```bash
./deploy-services.py up
```

3. Once all services are up and running, build and run the api-gateway:
```bash
cd api-gateway/
npm install
npm run build
npm run start
```

### Setting up sensors

> Note: this step requires that the previous steps have been successful

In this section we'll discuss how to build some predefined sensors (choosen
randomly from the sensors available in Emilia Romagna territory). If you would
like to build your own sensor, [jump to section](#building-you-own-sensor).

#### Running predefined sensors

First, go to sensors submodule inside `sensor` directory and run the script for
building mockup sensors:
``` bash
cd ./er-climate-monitor-sensors/sensor
./build_mockup_sensors.py create
```

Now, inside this folder around 37 sensors scripts of 5 different categories
will be created. When you have choosen a sensor (with the name of the form
`sensor_<SensorType>_<SensorName>.py`), you can run it with:
```bash
cd ..
python -m sensor.sensor_<SensorName>_<SensorType>
```
> Note: do not include `.py` when running python module

If everything worked as expected, the sensor should start and it registers and starts its cronjob.

---
You can repeat this process of building sensors as long as you want (meaning
that you could even run all 37 sensors locally).

## Running the frontend

In the main repository root, go to the frontend submodule, install dependencies
and run the project:

```bash
cd ./er-climate-monitor-frontend
npm install
npm run dev
```

Now, visit the prompted host and port in your browser (typically:
`[localhost:5173](http://localhost:5173/)`).

## Building you own sensor

Refer to the [sensors instructions](./er-climate-monitor-sensors/README.md)
