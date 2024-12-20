import os
import requests
import json
import logging
from pathlib import Path
from datetime import timedelta, datetime
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)

class TimestampUtils:
    def __init__(self) -> None:
        self.now = datetime.now()

    def get_compliant_now_timestamp(self):
        return self.get_compliant_timestamp(self.now)

    def get_compliant_timestamp(self, date: datetime)-> int:
        return int((date.replace(minute=0, second=0, microsecond=0).timestamp() / 1000) * 1000000)

    def get_week_timestamps(self):
        now = self.get_compliant_now_timestamp()
        dates = [now]
        base = datetime.fromtimestamp(now / 1000)
        for i in range(6):
            old_date = base - timedelta(days=i+1)
            aligned_date = self.get_compliant_timestamp(old_date)
            dates.append(aligned_date)
        return dates

class WeeklyScraper:
    def __init__(self):
        load_dotenv()
        self.logger = logging.getLogger(str(self.__class__))
        self.timeutils = TimestampUtils()
        self.dataset_dir = "./weekly_data/"

        self.SENSOR_DATA_URL = os.getenv("SENSOR_DATA_URL") or ""
        self.RAIN_VARIABLE_ID = os.getenv("RAIN_VARIABLE_ID") or ""
        self.IDRO_LEVEL_VARIABLE_ID = os.getenv("IDRO_LEVEL_VARIABLE_ID") or ""
        self.TEMP_VARIABLE_ID = os.getenv("TEMP_VARIABLE_ID") or ""
        self.WIND_VARIABLE_ID = os.getenv("WIND_VARIABLE_ID") or ""
        self.HUMIDITY_VARIABLE_ID = os.getenv("HUMIDITY_VARIABLE_ID") or ""

        self.sensors_names = {
            self.RAIN_VARIABLE_ID: "rain_sensor",
            self.IDRO_LEVEL_VARIABLE_ID: "idro_level_sensor",
            self.TEMP_VARIABLE_ID: "temp_sensor",
            self.WIND_VARIABLE_ID: "wind_sensor",
            self.HUMIDITY_VARIABLE_ID: "humidity_sensor",
        }

        self.sensors_units = {
            self.RAIN_VARIABLE_ID: "mm",
            self.IDRO_LEVEL_VARIABLE_ID: "m",
            self.TEMP_VARIABLE_ID: "K",
            self.WIND_VARIABLE_ID: "m/s",
            self.HUMIDITY_VARIABLE_ID: "%",
        }

        self.sensors_ids = [
            self.RAIN_VARIABLE_ID,
            self.IDRO_LEVEL_VARIABLE_ID,
            self.TEMP_VARIABLE_ID,
            self.WIND_VARIABLE_ID,
            self.HUMIDITY_VARIABLE_ID,
        ]

        self.__create_output_folder()

    def __create_output_folder(self):
        Path(self.dataset_dir).mkdir(exist_ok=True)

    def scrape_all(self, dump: bool = False):
        data: list[dict] = []
        timestamps = self.timeutils.get_week_timestamps()

        for sensor in self.sensors_ids:
            sensor_weekly_data = []
            for timestamp in timestamps:
                res = requests.get(self.SENSOR_DATA_URL, params={
                    "variabile": sensor,
                    "time": timestamp,
                }).json()
                self.logger.info(f"Retrieved data for sensor {self.sensors_names[sensor]} for date: {datetime.fromtimestamp(timestamp / 1000)}")
                sensor_weekly_data.append({
                    "date": str(datetime.fromtimestamp(timestamp / 1000)),
                    "timestamp": res[0]["time"],
                    "data": res[1:],
                })

            data.append({
                "sensor_id": sensor,
                "sensor_name": self.sensors_names[sensor],
                "unit": self.sensors_units[sensor],
                "weekly_data": sensor_weekly_data,
            })

            sensor_weekly_data = {
                "sensor_id": sensor,
                "sensor_name": self.sensors_names[sensor],
                "unit": self.sensors_units[sensor],
                "weekly_data": sensor_weekly_data,
            }

            if dump:
                with open(self.dataset_dir + f'{self.sensors_names[sensor]}_weekly_data.json', 'w') as w:
                    json.dump(sensor_weekly_data, w, indent=2)

        return data

if __name__ == "__main__":
    scraper = WeeklyScraper()
    data = scraper.scrape_all(dump=True)

    with open("./agg.json", 'w') as w:
        json.dump(data, w, indent=2)
