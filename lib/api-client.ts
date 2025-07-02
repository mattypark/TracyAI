import { supabase } from './supabase'

// Helper function to make authenticated API calls
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw new Error('Authentication failed')
    }
    
    if (!session?.access_token) {
      throw new Error('No active session')
    }
    
    // Add authentication headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    return response
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Helper function for GET requests
export async function apiGet(url: string) {
  return makeAuthenticatedRequest(url, { method: 'GET' })
}

// Helper function for POST requests
export async function apiPost(url: string, data: any) {
  return makeAuthenticatedRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Helper function for PUT requests
export async function apiPut(url: string, data: any) {
  return makeAuthenticatedRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Helper function for DELETE requests
export async function apiDelete(url: string) {
  return makeAuthenticatedRequest(url, { method: 'DELETE' })
} 