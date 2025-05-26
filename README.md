# ER-Climate Monitor

## Requirements

- python>=3.8
- docker (tested with version 27.3.1)

## Set-Up

1. Clone this repository:
```bash
git clone --recurse-submodules https://github.com/MatteoIorio11/er-climate-monitor.git
```

2a. Install python requirements through `pip install -r requirements.txt`
2b. Start docker services (sometimes a timout can occurr, please, retry running
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
Prerequisites: install python dependencies found in `./sensor/requirements.txt` and
having a working version of the package `requests` (tested with version 2.32.3).

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

## Tear Down

1. All sensors can be teared down with `<ctrl>-C`, make sure to press it only
   once in order to let the sensor tog gracefully stop.
2. `<ctrl>-C` on the API-Gateway
3. You can either run:
   - `./deploy-services.py down` to stop services
   - `./deploy-services.py downrmi` to stop services and release resource
   (remove docker images and networks)

## Building you own sensor

Refer to the [sensors instructions](https://github.com/S-furi/er-climate-monitor-sensors/blob/52041e406134269e0d36c579f1c20ec24299a139/README.md)
