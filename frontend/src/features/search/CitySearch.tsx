import { useEffect, useRef, useState } from 'preact/hooks'
import { keepPreviousData, useQuery } from '@tanstack/preact-query'
import { searchPlaces } from '@/lib/openMeteo'
import { placeHref } from '@/store/places'

function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

export default function CitySearch() {
  const [input, setInput] = useState('')
  const query = useDebounced(input.trim(), 250)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  const {
    data: results,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['places', query.toLowerCase()],
    queryFn: ({ signal }) => searchPlaces(query, signal),
    // The geocoder needs at least two characters to return anything.
    enabled: query.length >= 2,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })

  return (
    <div class="animate-rise">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label for="city-search" class="sr-only">
          City name
        </label>
        <input
          id="city-search"
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Search for a city…"
          value={input}
          onInput={(e) => setInput(e.currentTarget.value)}
          class="w-full border border-void-line bg-void-raised px-4 py-3 text-lg text-ink placeholder:text-ink-dim focus:border-lime focus:outline-none"
        />
      </form>

      <div class="mt-2 h-4 font-mono text-[0.65rem] uppercase tracking-widest text-ink-dim">
        {isFetching && 'Searching…'}
      </div>

      {error ? (
        <p class="text-sm text-flame">Search failed: {error.message}</p>
      ) : query.length >= 2 && results?.length === 0 && !isFetching ? (
        <p class="text-sm text-ink-dim">No places match “{query}”.</p>
      ) : (
        query.length >= 2 &&
        results && (
          <ul class="divide-y divide-void-line border border-void-line bg-void-raised/80">
            {results.map((place) => (
              <li key={`${place.latitude},${place.longitude}`}>
                <a
                  href={placeHref(place)}
                  class="block px-4 py-3 transition-colors hover:bg-void-line/50"
                >
                  <span class="text-ink">{place.name}</span>
                  {place.detail && <span class="block text-sm text-ink-dim">{place.detail}</span>}
                </a>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
