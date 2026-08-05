<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
// 1. 컴포넌트 파일명 국룰 표기법(PascalCase) 매칭 수입
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    main: { temp: 28, humidity: 55 },
    weather: [{ description: '맑음' }],
  },
  {
    id: 'city_02',
    name: '수원',
    main: { temp: 24, humidity: 85 },
    weather: [{ main: '비', description: 'rain' }],
  },
  {
    id: 'city_03',
    name: '부산',
    main: { temp: 26, humidity: 65 },
    weather: [{ main: '구름', description: 'clouds' }],
  },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 기존 핵심 비즈니스 로직(computed, watch)의 소유권은 안전하게 부모 콘텍스트가 격리 유지
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(query))
})

watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`,
  )
})

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <!-- header Slot에 전달 -->
      <template v-slot:header>
        <h3>🏙️ 지역별 날씨 현황</h3>
      </template>

      <!-- 기본 slot에 전달 -->
      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :weather="item"
        @select-card="(msg) => (selectedCityInfo = msg)"
        @click-detail="showDetail"
      />

      <p
        v-if="filteredWeatherList.length === 0"
        style="text-align: center; color: #e74c3c; padding: 10px 0"
      >
        😭 검색 결과와 일치하는 도시가 없습니다.
      </p>

      <!-- 추가 실습: footer Slot에 현재 표시 도시 수 전달 -->
      <template v-slot:footer> 현재 표시 도시 : {{ filteredWeatherList.length }}개 </template>
    </BaseDashboardCard>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 600px;
  margin: 0 auto;
}
</style>
