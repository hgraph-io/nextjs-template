'use client'

import {useState, useEffect, useRef} from 'react'
import Client from '@hgraph.io/sdk'

const LatestTransaction = `
query LatestTransaction {
  transaction(limit: 1, order_by: {consensus_timestamp: desc}) {
    consensus_timestamp
  }
}`

const LatestTransactionSubscription = LatestTransaction.trim().replace(
  'query',
  'subscription'
)

const client = new Client()

export default function Home() {
  const [state, setState] = useState('')

  useEffect(() => {
    async function fetchData() {
      setState(await client.query(LatestTransaction))

      const unsubscribe = await client.subscribe(LatestTransaction, {
        // handle the data
        next: (data: any) => {
          console.log(data)
          setState(data)
        },
        error: (e: string) => {
          console.error(e)
        },
        complete: () => {
          console.log('Optionally do some cleanup')
        },
      })

      return unsubscribe

      // clear subscription
      // setTimeout(unsubscribe, 20000)
    }
  }, [])
  // useEffect(() => {
  //   console.log('callllled')
  //   async function fetchData() {
  //     setState(await client.query(LatestTransaction))

  //     const unsubscribe = await client.subscribe(LatestTransaction, {
  //       // handle the data
  //       next: (data: any) => {
  //         console.log(data)
  //         setState(data)
  //       },
  //       error: (e: string) => {
  //         console.error(e)
  //       },
  //       complete: () => {
  //         console.log('Optionally do some cleanup')
  //       },
  //     })

  //     return unsubscribe

  //     // clear subscription
  //     // setTimeout(unsubscribe, 20000)
  //   }
  //   fetchData()
  // }, [])
  return (
    <div>
      Most recent consensus_timestamp: <pre>{JSON.stringify(state)}</pre>
    </div>
  )
}
