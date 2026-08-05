<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// const mockDetails = {
//   city_01: { name: '대한민국 서울특별시', temp: 28, status: '맑음', humidity: '55%', wind: '2.5m/s' },
//   city_02: { name: '경기도 수원시 영통구', temp: 24, status: '비', humidity: '85%', wind: '4.1m/s' },
//   city_03: { name: '부산광역시 해운대구', temp: 26, status: '구름', humidity: '65%', wind: '5.0m/s' },
// }

const cityData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

const fetchWeatherDetail = async () => {
  const cityName = route.query.city

  console.log('조회 도시: ', cityName)

  if (!cityName) {
    errorMessage.value = '도시 정보가 없습니다.'
    return
  }

  isLoading.value = true

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: cityName,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })
    cityData.value = response.data
  } catch (error) {
    console.error('날씨 상세 정보 가져오기 실패:', error)
    errorMessage.value = '날씨 상세 정보를 가져오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

// onMounted(() => {
//   const id = route.params.cityId
//   if (mockDetails[id]) {
//     cityData.value = mockDetails[id]
//   }
// })
onMounted(() => {
  fetchWeatherDetail()
})
</script>

<template>
  <div class="detail-container">
    <h3>📊 지역별 상세 기상 관측 정보</h3>
    <hr />

    <div v-if="cityData" class="info-card">
      <h4>📍 지정 지역: {{ cityData.name }}</h4>
      <p>
        실시간 기온: <strong>{{ cityData.main.temp }}°C</strong>
      </p>
      <p>기상 현황: {{ cityData.weather[0].description }}</p>
      <p>대기 습도: {{ cityData.main.humidity }}%</p>
      <p>현재 풍속: {{ cityData.wind.speed }}m/s</p>
    </div>
    <div v-else>
      <p>해당 지역의 상세 데이터 장부가 존재하지 않습니다.</p>
    </div>

    <button @click="router.push('/')" class="back-btn">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
