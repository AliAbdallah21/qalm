const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com'
const BASE_URL = 'https://jsearch.p.rapidapi.com'

if (!RAPIDAPI_KEY) {
  console.warn('[JSearch] RAPIDAPI_KEY is not set')
}

export interface JSearchJob {
  job_id: string
  job_title: string
  employer_name: string
  job_description: string
  job_required_skills: string[] | null
  job_highlights: {
    Qualifications?: string[]
    Responsibilities?: string[]
  } | null
  job_posted_at_datetime_utc: string
  job_country: string
  job_is_remote: boolean
}

export interface JSearchResponse {
  status: string
  data: JSearchJob[]
}

export async function searchJobs(
  query: string,
  options: {
    page?: number
    numPages?: number
    datePosted?: 'all' | 'today' | '3days' | 'week' | 'month'
    country?: string
    remoteOnly?: boolean
  } = {}
): Promise<JSearchJob[]> {
  if (!RAPIDAPI_KEY) return []

  const params = new URLSearchParams({
    query,
    page: String(options.page ?? 1),
    num_pages: String(options.numPages ?? 1),
    date_posted: options.datePosted ?? 'month',
    country: options.country ?? 'EG',
  })

  if (options.remoteOnly) {
    params.append('remote_jobs_only', 'true')
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search?${params.toString()}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        next: { revalidate: 3600 } // cache for 1 hour
      }
    )

    if (!response.ok) {
      console.error('[JSearch] API error:', response.status)
      return []
    }

    const json: JSearchResponse = await response.json()
    return json.status === 'OK' ? json.data : []
  } catch (error) {
    console.error('[JSearch] fetch failed:', error)
    return []
  }
}
