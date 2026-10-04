import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [callLogs, setCallLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // Fetch existing call logs from Supabase on load
  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data, error } = await supabase
          .from('call_logs')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching logs:', error.message)
        } else {
          setCallLogs(data || [])
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  // Handle mock call trigger and insert record into Supabase
  const handleTriggerCall = async (e) => {
    e.preventDefault()
    if (!phoneNumber) return

    setStatusMessage('Initiating call...')

    try {
      const { data, error } = await supabase
        .from('call_logs')
        .insert([{ phone_number: phoneNumber, status: 'Initiated' }])
        .select()

      if (error) {
        setStatusMessage(`Error: ${error.message}`)
      } else {
        setStatusMessage('Call successfully logged!')
        setCallLogs([data[0], ...callLogs])
        setPhoneNumber('')
      }
    } catch (err) {
      setStatusMessage(`Unexpected error: ${err.message}`)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Callflow OS Dashboard</h1>
      <p>Your Supabase-connected control panel is live.</p>

      {/* Trigger Call Section */}
      <div style={{ background: '#f4f4f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>Trigger New Call</h3>
        <form onSubmit={handleTriggerCall} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Enter phone number..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#000', color: '#fff', borderRadius: '4px', cursor: 'pointer', border: 'none' }}>
            Trigger Call
          </button>
        </form>
        {statusMessage && <p style={{ fontSize: '0.9rem', marginTop: '8px', color: '#555' }}>{statusMessage}</p>}
      </div>

      {/* Activity Feed Section */}
      <div>
        <h3>Live Call Logs</h3>
        {loading ? (
          <p>Loading logs from Supabase...</p>
        ) : callLogs.length === 0 ? (
          <p style={{ color: '#777' }}>No call logs found in Supabase yet. Try triggering one above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {callLogs.map((log) => (
              <li key={log.id || Math.random()} style={{ background: '#fff', border: '1px solid #e4e4e7', padding: '10px 15px', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{log.phone_number}</span>
                <span style={{ color: '#666', fontSize: '0.85rem' }}>{log.status || 'Active'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
