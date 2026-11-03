import { useQuery } from '@tanstack/preact-query'
import { fetchForecast, type Place } from '@/lib/openMeteo'
import { placeKey, units } from '@/store/places'

export function useForecast(place: Place | undefined) {
  const currentUnits = units.value
  return useQuery({
    queryKey: ['forecast', place && placeKey(place), currentUnits],
    queryFn: ({ signal }) => fetchForecast(place!, currentUnits, signal),
    enabled: !!place,
    // Open-Meteo updates current conditions every 15 minutes.
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  })
}
