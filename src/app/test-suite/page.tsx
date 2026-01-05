'use client'

import {useState, useRef} from 'react'
import Client, {Network, Environment} from '@hgraph.io/sdk'

const client = new Client({
  network: Network.HederaMainnet,
  environment: Environment.Production,
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_HGRAPH_API_KEY || '',
  },
})

export default function TestSuite() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addResult = (testName: string, result: any) => {
    setResults((prev) => ({...prev, [testName]: result}))
    setLoading((prev) => ({...prev, [testName]: false}))
  }

  const addError = (testName: string, error: string) => {
    setErrors((prev) => ({...prev, [testName]: error}))
    setLoading((prev) => ({...prev, [testName]: false}))
  }

  const startTest = (testName: string) => {
    setLoading((prev) => ({...prev, [testName]: true}))
    setErrors((prev) => ({...prev, [testName]: ''}))
  }

  // Test 1: Query latest transaction
  const testLatestTransaction = async () => {
    startTest('latestTransaction')
    try {
      const result = await client.query(`
        query LatestTransaction {
          transaction(limit: 1, order_by: {consensus_timestamp: desc}) {
            consensus_timestamp
            transaction_hash
            charged_tx_fee
          }
        }
      `)
      addResult('latestTransaction', result)
    } catch (error: any) {
      addError('latestTransaction', error.message)
    }
  }

  // Test 2: Query account by ID
  const testAccountQuery = async () => {
    startTest('accountQuery')
    try {
      const result = await client.query(`
        query GetAccount {
          entity(where: {id: {_eq: 98}}, limit: 1) {
            id
            balance
            created_timestamp
            memo
          }
        }
      `)
      addResult('accountQuery', result)
    } catch (error: any) {
      addError('accountQuery', error.message)
    }
  }

  // Test 3: Query tokens
  const testTokensQuery = async () => {
    startTest('tokensQuery')
    try {
      const result = await client.query(`
        query GetTokens {
          token(limit: 5, order_by: {created_timestamp: desc}) {
            token_id
            name
            symbol
            decimals
            initial_supply
          }
        }
      `)
      addResult('tokensQuery', result)
    } catch (error: any) {
      addError('tokensQuery', error.message)
    }
  }

  // Test 4: Query NFTs
  const testNFTsQuery = async () => {
    startTest('nftsQuery')
    try {
      const result = await client.query(`
        query GetNFTs {
          nft(limit: 5, order_by: {created_timestamp: desc}) {
            token_id
            serial_number
            metadata
          }
        }
      `)
      addResult('nftsQuery', result)
    } catch (error: any) {
      addError('nftsQuery', error.message)
    }
  }

  // Test 5: Query contract logs
  const testContractLogsQuery = async () => {
    startTest('contractLogsQuery')
    try {
      const result = await client.query(`
        query GetContractLogs {
          contract_log(limit: 5, order_by: {consensus_timestamp: desc}) {
            consensus_timestamp
            contract_id
            data
            topic0
          }
        }
      `)
      addResult('contractLogsQuery', result)
    } catch (error: any) {
      addError('contractLogsQuery', error.message)
    }
  }

  // Test 6: Query crypto transfers
  const testTopicMessagesQuery = async () => {
    startTest('topicMessagesQuery')
    try {
      const result = await client.query(`
        query GetCryptoTransfers {
          crypto_transfer(limit: 5, order_by: {consensus_timestamp: desc}) {
            consensus_timestamp
            amount
            entity_id
            is_approval
          }
        }
      `)
      addResult('topicMessagesQuery', result)
    } catch (error: any) {
      addError('topicMessagesQuery', error.message)
    }
  }

  // Test 7: Subscription to latest transactions
  const [subActive, setSubActive] = useState(false)
  const [subData, setSubData] = useState<any[]>([])
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const testSubscription = () => {
    if (subActive) {
      unsubscribeRef.current?.()
      setSubActive(false)
      setSubData([])
    } else {
      startTest('subscription')
      try {
        unsubscribeRef.current = client.subscribe(
          `subscription LatestTransactions {
            transaction(limit: 1, order_by: {consensus_timestamp: desc}) {
              consensus_timestamp
              transaction_hash
            }
          }`,
          {
            next: (data) => {
              setSubData((prev) => [...prev, data])
              addResult('subscription', {
                status: 'active',
                messagesReceived: subData.length + 1,
              })
            },
            error: (errors) => {
              addError(
                'subscription',
                errors[0]?.message || 'Subscription error'
              )
              setSubActive(false)
            },
            complete: () => {
              addResult('subscription', {status: 'completed'})
              setSubActive(false)
            },
          }
        ).unsubscribe
        setSubActive(true)
      } catch (error: any) {
        addError('subscription', error.message)
      }
    }
  }

  // Test 8: Multiple queries in parallel
  const testParallelQueries = async () => {
    startTest('parallelQueries')
    try {
      const [txResult, entityResult, tokenResult] = await Promise.all([
        client.query(`query { transaction(limit: 1) { consensus_timestamp } }`),
        client.query(`query { entity(limit: 1) { id } }`),
        client.query(`query { token(limit: 1) { token_id } }`),
      ])
      addResult('parallelQueries', {
        transactions: txResult,
        entities: entityResult,
        tokens: tokenResult,
      })
    } catch (error: any) {
      addError('parallelQueries', error.message)
    }
  }

  // Test 9: Query with variables
  const testQueryWithVariables = async () => {
    startTest('queryWithVariables')
    try {
      const result = await client.query({
        query: `
          query GetTransactions($limit: Int!) {
            transaction(limit: $limit, order_by: {consensus_timestamp: desc}) {
              consensus_timestamp
              transaction_hash
            }
          }
        `,
        variables: {limit: 3},
      })
      addResult('queryWithVariables', result)
    } catch (error: any) {
      addError('queryWithVariables', error.message)
    }
  }

  // Test 10: Error handling (invalid query)
  const testErrorHandling = async () => {
    startTest('errorHandling')
    try {
      await client.query(`query { invalid_table { invalid_field } }`)
      addResult('errorHandling', {
        success: false,
        message: 'Should have thrown error',
      })
    } catch (error: any) {
      addResult('errorHandling', {
        success: true,
        message: 'Error caught correctly',
        error: error.message,
      })
    }
  }

  const runAllTests = async () => {
    await testLatestTransaction()
    await new Promise((r) => setTimeout(r, 500))
    await testAccountQuery()
    await new Promise((r) => setTimeout(r, 500))
    await testTokensQuery()
    await new Promise((r) => setTimeout(r, 500))
    await testNFTsQuery()
    await new Promise((r) => setTimeout(r, 500))
    await testContractLogsQuery()
    await new Promise((r) => setTimeout(r, 500))
    await testTopicMessagesQuery()
    await new Promise((r) => setTimeout(r, 500))
    await testParallelQueries()
    await new Promise((r) => setTimeout(r, 500))
    await testQueryWithVariables()
    await new Promise((r) => setTimeout(r, 500))
    await testErrorHandling()
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
      <h1 style={{color: '#fff'}}>Hgraph SDK Test Suite - Next.js </h1>
      <p style={{marginBottom: '2rem', color: '#ccc'}}>
        Testing @hgraph.io/sdk with Next.js
      </p>

      <div style={{marginBottom: '2rem'}}>
        <button
          onClick={runAllTests}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Run All Tests
        </button>
      </div>

      <div style={{display: 'grid', gap: '1rem'}}>
        {/* Test 1 */}
        <TestCard
          title='1. Latest Transaction Query'
          loading={loading.latestTransaction}
          error={errors.latestTransaction}
          result={results.latestTransaction}
          onRun={testLatestTransaction}
        />

        {/* Test 2 */}
        <TestCard
          title='2. Account Query (by ID)'
          loading={loading.accountQuery}
          error={errors.accountQuery}
          result={results.accountQuery}
          onRun={testAccountQuery}
        />

        {/* Test 3 */}
        <TestCard
          title='3. Tokens Query'
          loading={loading.tokensQuery}
          error={errors.tokensQuery}
          result={results.tokensQuery}
          onRun={testTokensQuery}
        />

        {/* Test 4 */}
        <TestCard
          title='4. NFTs Query'
          loading={loading.nftsQuery}
          error={errors.nftsQuery}
          result={results.nftsQuery}
          onRun={testNFTsQuery}
        />

        {/* Test 5 */}
        <TestCard
          title='5. Contract Logs Query'
          loading={loading.contractLogsQuery}
          error={errors.contractLogsQuery}
          result={results.contractLogsQuery}
          onRun={testContractLogsQuery}
        />

        {/* Test 6 */}
        <TestCard
          title='6. Crypto Transfers Query'
          loading={loading.topicMessagesQuery}
          error={errors.topicMessagesQuery}
          result={results.topicMessagesQuery}
          onRun={testTopicMessagesQuery}
        />

        {/* Test 7 */}
        <div
          style={{
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '1rem',
            backgroundColor: subActive ? '#1a2a1a' : '#1a1a1a',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{margin: 0, color: '#fff'}}>
              7. Real-time Subscription (WebSocket)
            </h3>
            <button
              onClick={testSubscription}
              style={{
                padding: '8px 16px',
                backgroundColor: subActive ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {subActive ? 'Stop' : 'Start'}
            </button>
          </div>
          {errors.subscription && (
            <div style={{color: '#ff6b6b', marginTop: '0.5rem'}}>
              Error: {errors.subscription}
            </div>
          )}
          {subActive && (
            <div style={{marginTop: '1rem'}}>
              <strong style={{color: '#fff'}}>
                Messages received: {subData.length}
              </strong>
              <pre
                style={{
                  background: '#0a0a0a',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontSize: '12px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  color: '#0f0',
                  border: '1px solid #333',
                }}
              >
                {JSON.stringify(subData.slice(-3), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test 8 */}
        <TestCard
          title='8. Parallel Queries'
          loading={loading.parallelQueries}
          error={errors.parallelQueries}
          result={results.parallelQueries}
          onRun={testParallelQueries}
        />

        {/* Test 9 */}
        <TestCard
          title='9. Query with Variables'
          loading={loading.queryWithVariables}
          error={errors.queryWithVariables}
          result={results.queryWithVariables}
          onRun={testQueryWithVariables}
        />

        {/* Test 10 */}
        <TestCard
          title='10. Error Handling'
          loading={loading.errorHandling}
          error={errors.errorHandling}
          result={results.errorHandling}
          onRun={testErrorHandling}
        />
      </div>
    </div>
  )
}

function TestCard({
  title,
  loading,
  error,
  result,
  onRun,
}: {
  title: string
  loading: boolean
  error: string
  result: any
  onRun: () => void
}) {
  return (
    <div
      style={{
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#1a1a1a',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{margin: 0, color: '#fff'}}>{title}</h3>
        <button
          onClick={onRun}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Running...' : 'Run Test'}
        </button>
      </div>

      {loading && (
        <div style={{marginTop: '1rem', color: '#999'}}>Testing...</div>
      )}

      {error && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.5rem',
            backgroundColor: '#2a1515',
            color: '#ff6b6b',
            borderRadius: '4px',
            border: '1px solid #441111',
          }}
        >
          ❌ Error: {error}
        </div>
      )}

      {!loading && !error && result && (
        <div style={{marginTop: '1rem'}}>
          <div style={{color: '#4ade80', marginBottom: '0.5rem'}}>
            ✅ Success
          </div>
          <pre
            style={{
              background: '#0a0a0a',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '12px',
              maxHeight: '300px',
              overflow: 'auto',
              color: '#0f0',
              border: '1px solid #333',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
