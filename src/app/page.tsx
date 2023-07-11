//@ts-nocheck
'use client'

import {useState, useRef} from 'react'
import Client, {ClientOptions, Network, Environment} from '@hgraph.io/sdk'

console.log(Network)

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

const options: ClientOptions = {
  // network: Network.HederaMainnet,
  // environment: Environment.Development,
  network: 'mainnet.hedera',
  environment: 'io',
}

const client = new Client(options)

export default function Home() {
  const [state, setState] = useState()
  const [subscribed, setSubscribed] = useState(false)
  const unsubscribe = useRef(() => {})

  const toggle = () => {
    if (subscribed) {
      unsubscribe.current()
      setSubscribed(false)
    } else {
      unsubscribe.current = client.subscribe(LatestTransactionSubscription, {
        // handle the data
        next: (data: any) => {
          console.log(data)
          setState(data)
        },
        error: (e) => {
          console.error(e)
        },
        complete: () => {
          unsubscribe.current = () => {}
          console.log('Optionally do some cleanup')
        },
      })
      setSubscribed(true)
    }
  }

  return (
    <div>
      <button onClick={toggle}>{subscribed ? 'stop' : 'start'}</button>
      <pre>{JSON.stringify(state)}</pre>
    </div>
  )
}
