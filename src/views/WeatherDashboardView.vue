<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// API Key
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

// OpenWeather에서 반환하는 영문 도시명을 한글로 변환하기 위한 매핑
const cityNameKo = {
  Seoul: "서울",
  Tokyo: "도쿄",
  London: "런던",
  Paris: "파리",
  Sydney: "시드니",
  Singapore: "싱가포르",
  Dubai: "두바이",
  Berlin: "베를린",
  Shanghai: "상하이",
  "New York": "뉴욕", // 공백이 포함되어 따옴표 처리
};

// 세계 주요 도시
const cities = [
  {
    label: '서울',
    name: 'Seoul',
    country: 'KR',
  },

  {
    label: '도쿄',
    name: 'Tokyo',
    country: 'JP',
  },

  {
    label: '뉴욕',
    name: 'New York',
    country: 'US',
  },

  {
    label: '런던',
    name: 'London',
    country: 'GB',
  },

  {
    label: '파리',
    name: 'Paris',
    country: 'FR',
  },

  {
    label: '싱가포르',
    name: 'Singapore',
    country: 'SG',
  },

  {
    label: '두바이',
    name: 'Dubai',
    country: 'AE',
  },

  {
    label: '시드니',
    name: 'Sydney',
    country: 'AU',
  },

  {
    label: '베를린',
    name: 'Berlin',
    country: 'DE',
  },

  {
    label: '상하이',
    name: 'Shanghai',
    country: 'CN',
  },
]

// 기본 도시
const selectedCity = ref(cities[0])

const weather = ref(null)
const loading = ref(false)
const error = ref('')

// 날씨 조회
const fetchWeather = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: `${selectedCity.value.name},${selectedCity.value.country}`,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })
    weather.value = res.data
  } catch (e) {
    console.error(e)
    error.value = '날씨 정보를 가져오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

// 날씨 아이콘
const weatherIcon = computed(() => {
  if (!weather.value) return ''

  const icon = weather.value.weather[0].icon

  return `
  https://openweathermap.org/img/wn/${icon}@2x.png
  `
})

// 시작
// 처음 화면 진입 시 기본 도시(서울)의 날씨를 자동 조회
onMounted(() => {
  fetchWeather()
})
</script>

<template>
  <div class="dashboard">
    <h1>🌍🛜 글로벌 날씨 대시보드</h1>

    <!-- 도시 선택 -->
    <el-select
      v-model="selectedCity"
      value-key="name"
      placeholder="도시 선택"
      @change="fetchWeather"
      class="city-select"
    >
      <el-option
        v-for="city in cities"
        :key="city.name"
        :label="`${city.label} (${city.country})`"
        :value="city"
      />
    </el-select>

    <el-skeleton v-if="loading" :rows="5" animated />

    <el-card v-if="weather" class="weather-card">
      <template #header>
        <div class="header">
          <div>
            <h2>{{ cityNameKo[weather.name] || weather.name }}</h2>
            <p>{{ selectedCity.country }}</p>
          </div>

          <el-tag type="success">{{ weather.weather[0].description }}</el-tag>
        </div>
      </template>

      <div class="main-weather">
        <img :src="weatherIcon" class="weather-icon" />
        <div class="temperature">{{ Math.round(weather.main.temp) }}℃</div>
      </div>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="체감온도">{{ weather.main.feels_like }}℃</el-descriptions-item>
        <el-descriptions-item label="습도">{{ weather.main.humidity }}%</el-descriptions-item>
        <el-descriptions-item label="풍속">{{ weather.wind.speed }} m/s</el-descriptions-item>
        <el-descriptions-item label="기압">{{ weather.main.pressure }} hPa</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-alert v-if="error" :title="error" type="error" show-icon />
  </div>
</template>

<style scoped>
.dashboard {
  padding: 40px;
}

.city-select {
  width: 250px;

  margin-bottom: 30px;
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
