/**
 * Тестовый скрипт для проверки расчета расстояний
 * 
 * Точка погрузки: 55.755819 37.617644 (Москва, центр)
 * Полигон: 55.850208 36.576782 (Истринский район)
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

// Дорожное расстояние (Haversine × 1.3)
function haversineRoadDistance(lat1, lon1, lat2, lon2) {
  return haversineDistance(lat1, lon1, lat2, lon2) * 1.3;
}

// Тестовые данные
const pickupCoords = { lat: 55.755819, lon: 37.617644 };
const polygonCoords = { lat: 55.850208, lon: 36.576782 };

console.log('=== ТЕСТ РАСЧЕТА РАССТОЯНИЙ ===\n');
console.log('Точка погрузки:', pickupCoords);
console.log('Полигон:', polygonCoords);
console.log('');

// 1. Haversine (по прямой)
const haversineDist = haversineDistance(
  pickupCoords.lat,
  pickupCoords.lon,
  polygonCoords.lat,
  polygonCoords.lon
);
console.log(`1. Haversine (по прямой): ${haversineDist.toFixed(2)} км`);

// 2. Haversine × 1.3 (дорожное с коэффициентом)
const roadDist = haversineRoadDistance(
  pickupCoords.lat,
  pickupCoords.lon,
  polygonCoords.lat,
  polygonCoords.lon
);
console.log(`2. Haversine × 1.3: ${roadDist.toFixed(2)} км`);

// 3. Проверка ORS API
async function testORS() {
  const ORS_API_KEY = process.env.OPENROUTE_API_KEY || process.env.ORS_API_KEY;
  
  if (!ORS_API_KEY) {
    console.log('\n3. ORS API: API ключ не настроен');
    return;
  }
  
  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pickupCoords.lon},${pickupCoords.lat}&end=${polygonCoords.lon},${polygonCoords.lat}`;
    
    console.log('\n3. Тест ORS API:');
    console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      },
    });
    
    console.log('Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error:', errorText);
      return;
    }
    
    const data = await response.json();
    const distanceMeters = data.features?.[0]?.properties?.segments?.[0]?.distance;
    
    if (typeof distanceMeters === 'number' && !Number.isNaN(distanceMeters)) {
      const distanceKm = distanceMeters / 1000;
      console.log(`✅ ORS расстояние: ${distanceKm.toFixed(2)} км`);
      
      // Маршрут
      const route = data.features?.[0]?.geometry?.coordinates;
      console.log(`Точек в маршруте: ${route?.length || 0}`);
    } else {
      console.log('❌ Не удалось получить расстояние из ответа ORS');
      console.log('Ответ:', JSON.stringify(data, null, 2).slice(0, 500));
    }
  } catch (error) {
    console.log('❌ Ошибка ORS:', error.message);
  }
}

// 4. Проверка альтернативных координат
console.log('\n=== ПРОВЕРКА АЛЬТЕРНАТИВНЫХ КООРДИНАТ ===');

// Возможно, в базе хранятся другие координаты для этого полигона?
// Полигон POLY_080 - ООО "Экоградсервис"
// Московская область, Истринский район, с/п Костровское, карьер вблизи деревни Петрово

// Проверяем разные варианты координат деревни Петрово (Истринский район)
const alternativeCoords = [
  { name: 'Деревня Петрово (Истра)', lat: 55.850208, lon: 36.576782 },
  { name: 'Деревня Петрово (центр)', lat: 55.852, lon: 36.580 },
  { name: 'Карьер near Петрово', lat: 55.848, lon: 36.575 },
];

console.log('\nРасстояния до альтернативных точек:');
for (const coord of alternativeCoords) {
  const dist = haversineDistance(
    pickupCoords.lat,
    pickupCoords.lon,
    coord.lat,
    coord.lon
  );
  const road = dist * 1.3;
  console.log(`${coord.name}: Haversine=${dist.toFixed(2)} км, Road=${road.toFixed(2)} км`);
}

// Запуск теста ORS
testORS();

// 5. Анализ полученных данных из калькулятора
console.log('\n=== АНАЛИЗ ДАННЫХ ИЗ КАЛЬКУЛЯТОРА ===');
const calculatorData = {
  distanceKm: 82.88589999999999,
  transportPrice: 875560.6419211454,
  transportTariff: 875.5606419211454,
  utilizationPrice: 230000,
  utilizationTariff: 230,
  volumeT: 1000,
  volumeM3: 540.5405405405405,
};

console.log('distanceKm из калькулятора:', calculatorData.distanceKm.toFixed(2), 'км');
console.log('transportTariff:', calculatorData.transportTariff.toFixed(2), 'руб/т');
console.log('');

// Проверка: как рассчитывается transportPrice
const calculatedTransportPrice = calculatorData.transportTariff * calculatorData.volumeT;
console.log(`Проверка transportPrice: ${calculatorData.transportTariff} × ${calculatorData.volumeT} = ${calculatedTransportPrice.toFixed(2)}`);
console.log('transportPrice из калькулятора:', calculatorData.transportPrice.toFixed(2));
console.log('Совпадает:', Math.abs(calculatedTransportPrice - calculatorData.transportPrice) < 0.01);

console.log('\n=== ВЫВОДЫ ===');
console.log(`Haversine расстояние: ${haversineDist.toFixed(2)} км`);
console.log(`Haversine × 1.3: ${roadDist.toFixed(2)} км`);
console.log(`Расстояние из калькулятора: ${calculatorData.distanceKm.toFixed(2)} км`);
console.log('');
console.log(`Разница между калькулятором и Haversine: ${(calculatorData.distanceKm - haversineDist).toFixed(2)} км`);
console.log(`Разница между калькулятором и Haversine×1.3: ${(calculatorData.distanceKm - roadDist).toFixed(2)} км`);
