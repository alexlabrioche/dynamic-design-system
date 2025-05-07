import { useEffect, useState } from 'react'
import { getImageHue } from '@/lib/image-hue'

export interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
  hue: number
  theme: string
}
const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

const getQuery = () => {
  const queries = ['Sunny', 'Winter', 'Nature', 'City', 'Abstract']
  return queries[Math.floor(Math.random() * queries.length)]
}

export function useRandomImage() {
  const [data, setData] = useState<UnsplashImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomImage = async () => {
    setLoading(true)
    setError(null)
    try {
      const query = getQuery()
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=${accessKey}`,
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const _data = await response.json()
      const { hue } = await getImageHue(_data.urls.regular)
      _data.hue = hue
      _data.theme = query
      setData(_data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching image:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomImage()
  }, [])

  return { data, loading, error, fetchRandomImage }
}
