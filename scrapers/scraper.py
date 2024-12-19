import os
import requests
import json
import logging
from pathlib import Path
from datetime import timedelta, datetime
import pandas as pd
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

class ClimateDataScraper:
    def __init__(self) -> None:
        load_dotenv()
        self.logger = logging.getLogger(str(self.__class__))
        self.dataset_dir = "./datasets/"
        self.RAIN_DATA_URL = os.getenv("RAIN_DATA_URL")
        self.RIVER_DATA_URL = os.getenv("RIVER_DATA_URL")
        self.TEMP_DATA_URL = os.getenv("TEMP_DATA_URL")
        self.river_data = None
        self.rain_data = None
        self.temp_data = None
        self.__create_output_folder()

    def __create_output_folder(self):
        Path(self.dataset_dir).mkdir(exist_ok=True)

    def __dump_json_data(self, data: list | dict, filename: str):
        with open(self.dataset_dir + filename, 'w') as w:
            json.dump(data, w)

    def retrieve_weekly_river_data(self, dump: bool = False)-> list:
        if self.river_data is not None:
            return self.river_data

        if self.RIVER_DATA_URL is None:
            self.logger.warning("River Data url is undefined!")
            return []

        timeutils = TimestampUtils()
        data: list[dict] = []

        for date in timeutils.get_week_timestamps():
            res = requests.get(self.RIVER_DATA_URL + str(date)).json()
            self.logger.debug(f"Retrieved data for time {date} - ({datetime.fromtimestamp(date / 1000)})")
            clean_data = {
                "time": res[0]["time"],
                "data": res[1:],
            }

            data.append(clean_data)

        self.river_data = data

        if dump:
            self.__dump_json_data(self.river_data, f"river_data_{timeutils.get_compliant_now_timestamp()}.json")

        return self.river_data

    def retrieve_rainfall_hist_data(self, dump: bool = False)-> list:
        if self.rain_data is not None:
            return self.rain_data

        if self.RAIN_DATA_URL is None:
            self.logger.warning("Rainfall Data url is undefined!")
            return []

        headers = {
            'Pragma': 'no-cache',
            'Accept': '*/*', 'Sec-Fetch-Site': 'same-origin', 'Accept-Language': 'en-GB,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Sec-Fetch-Mode': 'cors',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://apps.arpae.it/widgets/siccita-disponibilita-idrica/',
            'Sec-Fetch-Dest': 'empty',
            'X-Requested-With': 'XMLHttpRequest',
            'Priority': 'u=3,'
        }

        idro_hist = requests.get(self.RAIN_DATA_URL, headers=headers).json()
        clean_rainfall = []
        for date, values in idro_hist['precipitazioni'].items():
            if date == "percentili":
                continue
            ok_values = []
            for zone, rainfall in values.items():
                ok_values.append({
                    "zone": zone,
                    "rainfall": rainfall,
                })
            clean_rainfall.append({
                "year": date,
                "rainfall_data": ok_values,
            })

        self.rain_data = clean_rainfall

        if dump:
            self.__dump_json_data(self.rain_data, "hist_rainfall_zones_hist.json")

        return self.rain_data

    def retrieve_temp_hist_data(self, dump: bool = False)-> list:
        if self.temp_data is not None:
            return self.temp_data

        if self.TEMP_DATA_URL is None:
            self.logger.warning("Temperature Data url is undefined!")
            return []

        raw_data = requests.get(self.TEMP_DATA_URL).json()

        df = pd.DataFrame(raw_data).drop(columns=["_id", "_updated", "_etag", "_created", "_links"])

        temp_data = dict(df['dati_giornalieri'].dropna()['DAILY_TAVG'])
        res = []
        for year, values in temp_data.items():
            res.append({
                "year": year,
                "data": values,
            })
        self.temp_data = res
        if dump:
            self.__dump_json_data(self.temp_data, "temp_data_hist.json")
        return self.temp_data

if __name__ == "__main__":
    scraper = ClimateDataScraper()
    scraper.retrieve_temp_hist_data(dump=True)
    scraper.retrieve_weekly_river_data(dump=True)
    scraper.retrieve_rainfall_hist_data(dump=True)
