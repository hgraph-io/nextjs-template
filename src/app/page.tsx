//@ts-nocheck
'use client'

import {useState, useRef} from 'react'
import Client, {Network, Environment} from '@hgraph.io/sdk'

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

const client = new Client({
  network: Network.HederaMainnet,
  environment: Environment.Production,
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_HGRAPH_API_KEY || '',
  },
})

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
      }).unsubscribe
      setSubscribed(true)
    }
  }

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'system-ui',
        backgroundColor: '#000',
        minHeight: '100vh',
        color: '#fff',
      }}
    >
      <h1 style={{color: '#fff'}}>Hgraph SDK + Next.js Demo</h1>

      <h2 style={{color: '#fff'}}>Quick Subscription Demo</h2>
      <p style={{color: '#ccc'}}>
        Click the button to subscribe to latest transactions
      </p>
      <button
        onClick={toggle}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '1rem',
          backgroundColor: subscribed ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        {subscribed ? '⏹ Stop Subscription' : '▶ Start Subscription'}
      </button>
      <div>
        <strong style={{color: '#fff'}}>Latest Data:</strong>
        <pre
          style={{
            background: '#1a1a1a',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
            color: '#0f0',
            border: '1px solid #333',
          }}
        >
          {JSON.stringify(state, null, 2) || 'No data yet...'}
        </pre>
      </div>
      <div style={{marginBottom: '2rem'}}>
        <a
          href='/test-suite'
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            marginRight: '1rem',
          }}
        >
          Explore More Tests
        </a>
      </div>
    </div>
  )
}
