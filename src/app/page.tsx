'use client'

import {useState, useEffect} from 'react'

const query = `
query LatestTransaction {
  transaction(limit: 1, order_by: {consensus_timestamp: desc}) {
    consensus_timestamp
  }
}`

const subscription = `
subscription LatestTransaction {
  transaction(limit: 1, order_by: {consensus_timestamp: desc}) {
    consensus_timestamp
  }
}`

export default function Home() {
  const [state, setState] = useState('')
  useEffect(() => {
    async function fetchData() {
      const {default: hg} = await import('@hgraph.io/sdk')
      const response = await hg(query)
      setState(BigInt(response.data.transaction[0].consensus_timestamp).toString())

      const unsubscribe = await hg(subscription, {
        // The client supports filtering the response date using jmespath -  https://jmespath.org/
        filter: 'data.transaction[0].consensus_timestamp',
        // handle the data
        next: (data: bigint) => {
          const diff = (BigInt(new Date().getTime()) - data / BigInt(1000000)) / BigInt(1000)
          console.log(`consensus_timestamp was about ${diff} seconds ago`)
          console.log(data)
          setState(data.toString())
        },
        error: (e: string) => {
          console.error(e)
        },
        complete: () => {
          console.log('Optionally do some cleanup')
        },
      })

      // clear subscription
      setTimeout(unsubscribe, 10000)
    }
    fetchData()
  }, [])
  return <div>Most recent consensus_timestamp: {state} </div>
}
