<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// OpenWeather API 인증 키
// .env 파일의 VITE_WEATHER_API_KEY 값을 가져옴
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

// 사용자가 검색창에 입력하는 도시명 저장
// 예) "Paris", "Tokyo"
const searchCity = ref('')

// 현재 선택한 도시명 저장
// 예) "Seoul", "Sydney"
// 화면 표시 및 선택 상태 관리 용도
const selectedCityInfo = ref('')

// OpenWeather API에서 받은 날씨 데이터 저장
// 초기값은 null이며 API 호출 성공 후 객체 형태로 저장
const weather = ref(null)

// API 요청 중인지 여부 관리
// true  → Skeleton 로딩 표시
// false → 날씨 정보 표시
const loading = ref(false)

// API 오류 메시지 저장
// 오류 발생 시 사용자에게 Alert 표시
const error = ref('')

// 사용자가 도시명을 입력하면 실행되는 자동완성 검색 함수
// Element Plus el-autocomplete의 fetch-suggestions 속성과 연결
const searchCities = async (queryString, callback) => {
  // 검색어가 없으면 추천 목록을 비우고 종료
  if (!queryString) {
    callback([])
    return
  }

  try {
    // OpenWeather Geocoding API 호출
    // 도시명을 입력하면 해당 도시의 위치 정보 반환
    const res = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: queryString, // 사용자가 입력한 도시명
        limit: 5, // 검색 결과 최대 개수
        appid: API_KEY, // API 인증 키
      },
    })

    // API 응답 데이터를 화면에서 사용할 형태로 변환
    // OpenWeather 응답:
    // [{ name, country, lat, lon }]
    //
    // Element Plus AutoComplete 형식:
    // [{ value, name, country, lat, lon }]
    const result = res.data.map((city) => ({
      // 검색 결과 목록에 표시되는 텍스트
      value: `${city.name}, ${city.country}`,

      // 선택 이후 날씨 조회에 사용할 데이터
      name: city.name, // 도시명
      country: city.country, // 국가 코드
      lat: city.lat, // 위도
      lon: city.lon, // 경도
    }))

    // 변환한 검색 결과를 el-autocomplete에 전달
    // 전달된 데이터가 추천 목록으로 표시됨
    callback(result)
  } catch (e) {
    // 도시 검색 API 실패 시 오류 확인
    console.log(e)

    // 검색 결과 초기화
    callback([])
  }
}

// 날씨 상태에 맞는 아이콘 URL 생성
// weather 데이터가 변경되면 자동으로 다시 계산
const weatherIcon = computed(() => {
  // 아직 날씨 데이터가 없으면 빈 문자열 반환
  if (!weather.value) return ''

  // OpenWeather에서 제공하는 날씨 아이콘 코드
  const icon = weather.value.weather[0].icon

  // 아이콘 이미지 URL 반환
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
})

// 선택한 도시의 위도와 경도를 이용해 현재 날씨를 조회하는 함수
// 도시명 대신 좌표를 사용하는 이유:
// 같은 이름의 도시가 여러 국가에 존재할 수 있기 때문
const fetchWeatherByLocation = async (city) => {
  // API 요청 시작 → 로딩 화면 표시
  loading.value = true

  try {
    // OpenWeather Current Weather API 호출
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: city.lat, // 조회할 도시 위도
        lon: city.lon, // 조회할 도시 경도
        appid: API_KEY, // API 인증 키
        units: 'metric', // 온도 단위를 섭씨로 변경
        lang: 'kr', // 날씨 설명을 한국어로 반환
      },
    })

    // API 응답 데이터를 저장
    // weather.value 변경 → Vue가 자동으로 화면 업데이트
    weather.value = res.data
  } catch (e) {
    // 날씨 조회 실패 시 오류 출력
    console.log(e)

    // 사용자에게 보여줄 에러 메시지 저장
    error.value = '날씨 정보를 가져오지 못했습니다.'
  } finally {
    // 성공/실패 여부와 관계없이 로딩 종료
    loading.value = false
  }
}

// 초기 화면 진입 시 표시할 기본 도시
// 검색하기 전에 서울 날씨를 먼저 보여주기 위한 기본값
const defaultCity = {
  name: 'Seoul',
  country: 'KR',
  lat: 37.5665,
  lon: 126.978,
}

// 자동완성 목록에서 도시를 선택했을 때 실행
const selectCity = (city) => {
  // 선택한 도시 전체 정보 저장
  selectedCityInfo.value = city

  // 선택한 도시의 위치 정보로 날씨 조회
  fetchWeatherByLocation(city)
}

// 컴포넌트가 화면에 표시될 때 최초 실행
// 초기 화면에서는 서울 날씨를 자동으로 조회
onMounted(() => {
  fetchWeatherByLocation(defaultCity)
})
</script>

<template>
  <!-- 전체 날씨 대시보드 영역 -->
  <div class="dashboard">
    <!-- 페이지 제목 -->
    <h1>🔎👀 검색을 통한 날씨 대시보드</h1>

    <!--
      도시 검색 입력창

      동작 흐름:
      1. 사용자가 도시명 입력
      2. searchCities 함수 실행
      3. OpenWeather Geocoding API로 도시 검색
      4. 검색 결과 자동완성 표시
    -->
    <el-autocomplete
      v-model="searchCity"
      :fetch-suggestions="searchCities"
      placeholder="도시 검색 (예: Paris)"
      @select="selectCity"
      class="city-search"
    />

    <p class="search-info">
      OpenWeather Geocoding API는 입력한 검색어와 일치하는 다양한 위치 정보를 제공합니다. <br />
      따라서 도시명뿐 아니라 구역명(예: Marunouchi)도 검색 결과에 포함될 수 있으며, <br />
      선택한 위치의 위도·경도를 기준으로 실시간 날씨를 조회합니다.
    </p>

    <!--
      날씨 API 요청 중 표시되는 로딩 UI
      loading이 true이면 Skeleton 표시
    -->
    <el-skeleton v-if="loading" :rows="5" animated />

    <!--
      날씨 정보 카드

      API 응답 데이터를 저장한 weather가 존재할 때 표시
      weather.value 변경 시 Vue가 화면 자동 업데이트
    -->
    <el-card v-if="weather" class="weather-card">
      <!-- 카드 상단 영역 -->
      <template #header>
        <div class="header">
          <!-- 선택한 도시 정보 -->
          <div>
            <!-- OpenWeather에서 반환한 도시명 -->
            <h2>{{ weather.name }}</h2>

            <!--
              선택한 도시 국가 코드 표시

              selectedCityInfo 구조:
              {
                name,
                country,
                lat,
                lon
              }

              ?. 사용 이유:
              초기에는 값이 null일 수 있기 때문
            -->
            <p>{{ selectedCityInfo?.country }}</p>
          </div>

          <!-- 현재 날씨 상태 표시 -->
          <!-- 예: 맑음, 흐림, 비 -->
          <el-tag type="success">
            {{ weather.weather[0].description }}
          </el-tag>
        </div>
      </template>

      <!-- 현재 온도와 날씨 아이콘 영역 -->
      <div class="main-weather">
        <!--
          computed weatherIcon에서 생성한 날씨 아이콘 URL 표시
        -->
        <img :src="weatherIcon" class="weather-icon" />

        <!-- 현재 온도 표시 -->
        <!-- Math.round()로 소수점 제거 -->
        <div class="temperature">{{ Math.round(weather.main.temp) }}℃</div>
      </div>

      <!--
        상세 날씨 정보 표시

        weather.main
        - feels_like : 체감온도
        - humidity   : 습도
        - pressure   : 기압

        weather.wind
        - speed      : 풍속
      -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="체감온도">
          {{ weather.main.feels_like }}℃
        </el-descriptions-item>

        <el-descriptions-item label="습도"> {{ weather.main.humidity }}% </el-descriptions-item>

        <el-descriptions-item label="풍속"> {{ weather.wind.speed }} m/s </el-descriptions-item>

        <el-descriptions-item label="기압"> {{ weather.main.pressure }} hPa </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- API 요청 실패 시 에러 메시지 표시 -->
    <el-alert v-if="error" :title="error" type="error" show-icon />
  </div>
</template>

<style scoped>
.dashboard {
  padding: 40px;
}

.city-search {
  width: 250px;
}

.search-info {
  margin-top: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #888;
  line-height: 1.6;
}

.weather-card {
  max-width: 600px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-weather {
  display: flex;
  justify-content: center;
  align-items: center;
}

.temperature {
  font-size: 60px;

  font-weight: bold;
}

.weather-icon {
  width: 100px;
}
</style>
