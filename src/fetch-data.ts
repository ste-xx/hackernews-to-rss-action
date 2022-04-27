import {FeedMap} from './types'
import {HttpClient} from '@actions/http-client'

interface HackerNewsResponse {
  hits: {
    title: string
    points: number
    objectID: string
  }[]
}

interface Input {
  minPoints: number
  days: number
}

export const fetchData = async (input: Input): Promise<FeedMap> => {
  const currentTimestampInSeconds = parseInt(
    `${new Date().getTime() / 1000}`,
    10
  )
  const DAY_IN_SECONDS = 86400
  const lastTimestampInSeconds =
    currentTimestampInSeconds - DAY_IN_SECONDS * input.days

  const url = new URL('https://hn.algolia.com/api/v1/search')
  url.searchParams.append('query', '')
  url.searchParams.append('tags', 'story')
  url.searchParams.append('page', '0')
  url.searchParams.append(
    'numericFilters',
    `created_at_i>${lastTimestampInSeconds},points>${input.minPoints}`
  )
  const client = new HttpClient()
  const response = await client.getJson<HackerNewsResponse>(url.toString())
  const result = response.result?.hits ?? []

  return Object.fromEntries(
    result.map(({title, points, objectID}) => [
      objectID,
      {
        id: objectID,
        url: `https://news.ycombinator.com/item?id=${objectID}`,
        created: new Date().getTime(),
        title: `${title} (${points})`,
        content_text: ''
      }
    ])
  )
}
