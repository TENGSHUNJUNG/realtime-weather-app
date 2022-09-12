import { useState, useEffect, useCallback } from "react";

// 讓 fetchCurrentWeather 可以接收 locationName 作為參數
const fetchCurrentWeather = (locationName) => {
  // 將fetch到的資料 回傳而不是直接setWeatherElement
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-5E182154-1DBC-4430-B876-637D9566A5B8&locationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      // 定義 `locationData` 把回傳的資料中會用到的部分取出來
      const locationData = data.records.location[0];
      // 將風速（WDSD）、氣溫（TEMP）和濕度（HUMD）的資料取出
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );
      // 要使用到react組件中的資料
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD
      };
    });
};

// 讓 fetchWeatherForecast 可以接收 cityName 作為參數
const fetchWeatherForecast = (cityName) => {
  // 將fetch到的資料 回傳而不是直接setWeatherElement
  // 在 API 的網址中可以帶入 cityName 去撈取特定地區的天氣資料
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-5E182154-1DBC-4430-B876-637D9566A5B8&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const location = data.records.location[0];
      const weatherElements = location.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      };
    });
};
const useWeatherApi = (currentLocation) => {
  const { locationName, cityName } = currentLocation;

  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true
  });

  //將fetchData共用 畫面初次渲染 + 點擊更新
  // 使用 useCallback 防止無限迴圈
  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        // locationName 是給「觀測」天氣資料拉取 API 用的地區名稱
        fetchCurrentWeather(locationName),

        // cityName 是給「預測」天氣資料拉取 API 用的地區名稱
        fetchWeatherForecast(cityName)
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false
      });
    };

    // 在 setState 中如果是帶入函式的話，可以取得前一次的資料狀態
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true
    }));

    fetchingData();
  }, [locationName, cityName]);

  // 說明：一但 locationName 或 cityName 改變時，fetchData 就會改變，
  // 此時 useEffect 內的函式就會再次執行，拉取最新的天氣資料
  useEffect(() => {
    //呼叫 fetchData 這個方法
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};
export default useWeatherApi;
