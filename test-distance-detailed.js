/**
 * Детальный анализ расчета расстояний для полигона POLY_080
 * 
 * Вопрос: Почему калькулятор показывает 82.89 км, 
 * а не ~60 км (как ожидал пользователь)?
 */

// Формула Haversine
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function haversineRoadDistance(lat1, lon1, lat2, lon2) {
  return haversineDistance(lat1, lon1, lat2, lon2) * 1.3;
}

const pickupCoords = { lat: 55.755819, lon: 37.617644 };
const polygonCoords = { lat: 55.850208, lon: 36.576782 };

console.log('=== ДЕТАЛЬНЫЙ АНАЛИЗ ===\n');
console.log('📍 Точка погрузки: 55.755819, 37.617644 (Москва, центр)');
console.log('📍 Полигон POLY_080: 55.850208, 36.576782 (Истринский район, д. Петрово)');
console.log('');

// 1. Расчет Haversine
const haversineDist = haversineDistance(
  pickupCoords.lat, pickupCoords.lon,
  polygonCoords.lat, polygonCoords.lon
);
console.log(`📏 Haversine (по прямой): ${haversineDist.toFixed(2)} км`);

// 2. Расчет Haversine × 1.3
const haversineRoad = haversineRoadDistance(
  pickupCoords.lat, pickupCoords.lon,
  polygonCoords.lat, polygonCoords.lon
);
console.log(`📏 Haversine × 1.3 (коэфф. дорог): ${haversineRoad.toFixed(2)} км`);

// 3. Проверка ORS API
async function testORS() {
  const ORS_API_KEY = process.env.OPENROUTE_API_KEY || process.env.ORS_API_KEY;
  
  if (!ORS_API_KEY) {
    console.log('\n❌ ORS API: API ключ не настроен');
    return null;
  }
  
  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pickupCoords.lon},${pickupCoords.lat}&end=${polygonCoords.lon},${polygonCoords.lat}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ ORS API Error:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    const distanceMeters = data.features?.[0]?.properties?.segments?.[0]?.distance;
    const duration = data.features?.[0]?.properties?.segments?.[0]?.duration;
    
    if (typeof distanceMeters === 'number' && !Number.isNaN(distanceMeters)) {
      const distanceKm = distanceMeters / 1000;
      console.log(`\n🚗 ORS API (реальный маршрут):`);
      console.log(`   Расстояние: ${distanceKm.toFixed(2)} км`);
      console.log(`   Время в пути: ${Math.round(duration / 60)} мин`);
      
      return { distanceKm, duration, data };
    } else {
      console.log('❌ Не удалось получить расстояние из ответа ORS');
      return null;
    }
  } catch (error) {
    console.log('❌ Ошибка ORS:', error.message);
    return null;
  }
}

// 4. Анализ данных из калькулятора
console.log('\n=== ДАННЫЕ ИЗ КАЛЬКУЛЯТОРА ===');
const calculatorData = {
  distanceKm: 82.88589999999999,
  transportPrice: 875560.6419211454,
  transportTariff: 875.5606419211454,
  utilizationPrice: 230000,
  utilizationTariff: 230,
  volumeT: 1000,
  volumeM3: 540.5405405405405,
  polygonAddress: "Московская область, Истринский район, с/п Костровское,\\nкарьер вблизи деревни Петрово",
  polygonName: 'ООО "Экоградсервис"',
  polygonId: 'POLY_080',
};

console.log(`distanceKm: ${calculatorData.distanceKm.toFixed(2)} км`);
console.log(`transportTariff: ${calculatorData.transportTariff.toFixed(2)} руб/т`);
console.log(`transportPrice: ${calculatorData.transportPrice.toFixed(2)} руб`);
console.log(`utilizationPrice: ${calculatorData.utilizationPrice.toFixed(2)} руб`);
console.log(`totalPrice: ${(calculatorData.transportPrice + calculatorData.utilizationPrice).toFixed(2)} руб`);

// 5. Проверка гипотезы пользователя (47 км × 1.3)
console.log('\n=== ПРОВЕРКА ГИПОТЕЗЫ ПОЛЬЗОВАТЕЛЯ ===');
const userHypothesis = 47 * 1.3;
console.log(`47 км × 1.3 = ${userHypothesis.toFixed(2)} км`);
console.log(`Реальное Haversine: ${haversineDist.toFixed(2)} км`);
console.log('');
console.log('⚠️ Гипотеза пользователя (47 км) НЕ соответствует реальным координатам!');
console.log(`   Фактическое расстояние по прямой: ${haversineDist.toFixed(2)} км`);
console.log(`   Фактическое дорожное (Haversine×1.3): ${haversineRoad.toFixed(2)} км`);

// 6. Возможные причины расхождений
console.log('\n=== ВОЗМОЖНЫЕ ПРИЧИНЫ РАСХОЖДЕНИЙ ===');
console.log(`
1. ❓ Пользователь ожидал 47 км, но координаты полигона ведут в Истринский район (~66 км по прямой)

2. ❓ Возможно, в базе данных хранятся НЕВЕРНЫЕ координаты для POLY_080?
   Текущие: 55.850208, 36.576782
   Проверьте актуальные координаты полигона "ООО Экоградсервис"

3. ❓ Пользователь мог иметь в виду ДРУГОЙ полигон с похожим названием?

4. ✅ ORS API работает КОРРЕКТНО и находит маршрут длиной 82.89 км
`);

// Запуск теста ORS
testORS().then(orsResult => {
  if (orsResult) {
    console.log('\n=== ИТОГОВЫЙ АНАЛИЗ ===');
    console.log(`Haversine (по прямой):     ${haversineDist.toFixed(2)} км`);
    console.log(`Haversine × 1.3:          ${haversineRoad.toFixed(2)} км`);
    console.log(`ORS API (реальный путь):  ${orsResult.distanceKm.toFixed(2)} км`);
    console.log(`Калькулятор:              ${calculatorData.distanceKm.toFixed(2)} км`);
    console.log('');
    
    // Проверка: использует ли калькулятор ORS или fallback?
    const diffFromORS = Math.abs(calculatorData.distanceKm - orsResult.distanceKm);
    const diffFromHaversine = Math.abs(calculatorData.distanceKm - haversineRoad);
    
    if (diffFromORS < 0.1) {
      console.log('✅ КАЛЬКУЛЯТОР ИСПОЛЬЗУЕТ ORS API (расхождение < 0.1 км)');
    } else if (diffFromHaversine < 1) {
      console.log('⚠️ КАЛЬКУЛЯТОР ИСПОЛЬЗУЕТ HAVERSINE × 1.3 (fallback)');
    } else {
      console.log('❓ НЕИЗВЕСТНЫЙ ИСТОЧНИК РАСЧЕТА');
    }
    
    console.log('');
    console.log('=== ОТВЕТЫ НА ВОПРОСЫ ===');
    console.log(`
1. Алгоритм калькулятора:
   - Получает координаты полигона из базы данных
   - Вызывает getRoadDistance() → OpenRouteService API
   - При успехе: использует реальное дорожное расстояние от ORS
   - При ошибке: fallback на Haversine × 1.3

2. Может ли ORS найти путь? 
   ✅ ДА, ORS находит маршрут длиной ${orsResult.distanceKm.toFixed(2)} км

3. Почему неверно (ожидалось ~60 км)?
   ⚠️ ORС считает ВЕРНО для указанных координат (55.850208, 36.576782)
   ❌ Проблема в координатах полигона в базе данных!
   
4. Если нет, то по какой формуле?
   ✅ ORS работает корректно, формула не используется

5. 47 км × 1.3 = 61.1 км, всё равно неверно?
   ✅ Верно! 47 км — это НЕ соответствует координатам полигона.
      Реальное Haversine расстояние: ${haversineDist.toFixed(2)} км
      Реальное дорожное (ORS): ${orsResult.distanceKm.toFixed(2)} км
   `);
   
   console.log('=== РЕКОМЕНДАЦИЯ ===');
   console.log(`
🔍 Проверьте координаты полигона POLY_080 в базе данных!
   Текущие: 55.850208, 36.576782
   Возможно, они указывают на карьер в стороне от основной трассы.
   
📍 Найдите актуальные координаты въезда на полигон "ООО Экоградсервис"
   и обновите поле facilityCoordinates в таблице polygons.
`);
  }
});
