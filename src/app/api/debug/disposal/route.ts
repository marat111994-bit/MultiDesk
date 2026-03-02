import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { haversineDistance } from '@/lib/calculator/haversine'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pickupCoords, fkkoCode } = body
    
    const [pickupLat, pickupLon] = pickupCoords.split(' ').map(Number)
    
    // 1. Все тарифы для этого ФККО
    const tariffs = await prisma.utilizationTariff.findMany({
      where: { fkkoCode }
    })
    
    // 2. Все активные полигоны
    const allPolygons = await prisma.polygon.findMany({
      where: { isActive: true },
      select: { 
        polygonId: true, 
        receiverName: true, 
        facilityCoordinates: true, 
        isActive: true 
      }
    })
    
    // 3. Для каждого полигона с тарифом — расстояние
    const results = tariffs.map(t => {
      const polygon = allPolygons.find(p => p.polygonId === t.polygonId)
      if (!polygon) return { polygonId: t.polygonId, error: 'polygon not found' }
      
      const coords = polygon.facilityCoordinates?.split(' ').map(Number)
      const dist = coords ? 
        haversineDistance(pickupLat, pickupLon, coords[0], coords[1]) : null
      
      return {
        polygonId: t.polygonId,
        receiverName: polygon.receiverName,
        facilityCoordinates: polygon.facilityCoordinates,
        tariffRubT: t.tariffRubT,
        haversineKm: dist ? Math.round(dist * 10) / 10 : null,
        coordsParsed: coords
      }
    })
    
    return NextResponse.json({
      pickupParsed: { lat: pickupLat, lon: pickupLon },
      fkkoCode,
      tariffsFound: tariffs.length,
      activePolygons: allPolygons.length,
      results
    })
  } catch (error: any) {
    console.error('DEBUG ERROR:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
