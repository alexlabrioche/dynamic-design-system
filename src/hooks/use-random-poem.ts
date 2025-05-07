import { useEffect, useState } from 'react'

export interface Poem {
  title: string
  author: string
  lines: Array<string>
  linecount: string
}

export function useRandomPoem() {
  const [data, setData] = useState<Poem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRandomPoem = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://poetrydb.org/random')

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const _data = await response.json()
      setData(_data[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching poem:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomPoem()
  }, [])

  return { data, loading, error, fetchRandomPoem }
}
