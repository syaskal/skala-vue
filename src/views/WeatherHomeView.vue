<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'
import { getWeather } from '../api/weather.js'

const weatherList = ref([])

const loading = ref(false)

const error = ref(null)

const router = useRouter()
const route = useRoute()

const loadWeather = async () => {
  loading.value = true
  error.value = null

  // 검색할 도시를 한 곳에서 관리
  const cities = ['Seoul', 'Suwon', 'Busan', 'Copenhagen']
  try {
    // Promise.all을 활용하여 서울, 수원, 부산의 날씨 정보를 동시에 요청하여
    // 모든 응답이 끝나면 배열 형태로 가져옵니다.
    const responses = await Promise.all(cities.map((city) => getWeather(city)))
    weatherList.value = responses.map((response) => response.data)
  } catch (err) {
    error.value = '날씨 정보를 가져오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWeather()
})

const showDetail = (cityName) => {
  router.push({
    name: 'WeatherDetail',
    query: {
      city: cityName,
    },
  })
}

// const weatherList = ref([
//   { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
//   { id: 'city_02', name: '수원', temp: 24, status: '비' },
//   { id: 'city_03', name: '부산', temp: 26, status: '구름' },
// ])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 초기 마운트 시 주소창의 쿼리(?search=) 스트링 읽어서 상태 복원 (KeepAlive를 적용해야만 동작함)
onMounted(() => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
})

// 타이핑될 때마다 주소창의 쿼리 스트링 값을 실시간 푸시 개편 (현재 큰 의미없음)
watch(searchQuery, (newQuery) => {
  router.push({
    path: route.path,
    query: { search: newQuery || undefined },
  })
})

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(query))
})

// 자식 카드 컴포넌트의 상세보기 신호를 받으면 해당 ID 주소로 라우터 점프 실행
const handleDetailJump = (id) => {
  router.push(`/weather/${id}`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
      <!-- <WeatherCard v-for="item in filteredWeatherList" :key="item.id" :city-item="item" @select-card="(msg) => (selectedCityInfo = msg)" @click-detail="handleDetailJump(item.id)" /> -->

      <p v-if="loading">🌤 실시간 날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="error">
        {{ error }}
      </p>

      <WeatherCard
        v-for="item in weatherList"
        :key="item.id"
        :weather="item"
        @click-detail="showDetail"
      />
    </BaseDashboardCard>
    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped>
.status-bar {
  background: #e8f5e9;
  padding: 10px;
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  border-radius: 6px;
}
</style>
