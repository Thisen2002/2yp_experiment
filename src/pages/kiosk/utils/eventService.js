// Get all events from backend API
export async function getAllEvents() {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3036'
    const response = await fetch(`${apiUrl}/api/events`, {
      credentials: 'include', // Include cookies for session management
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📋 API Response:', data)
    
    return data
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

// Get events for today
export async function getTodayEvents() {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3036'
    const allEvents = await getAllEvents()
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Filter events for today
    const todayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate >= startOfDay && eventDate < endOfDay
    })
    
    // Sort by start time
    todayEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    
    return todayEvents
  } catch (error) {
    console.error('Error fetching today events:', error)
    throw error
  }
}

// Get upcoming events
export async function getUpcomingEvents(limit = 10) {
  try {
    const allEvents = await getAllEvents()
    const now = new Date()
    
    // Filter upcoming events
    const upcomingEvents = allEvents.filter(event => {
      const eventStart = new Date(event.start_time)
      return eventStart > now
    })
    
    // Sort by start time and limit results
    upcomingEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    
    return upcomingEvents.slice(0, limit)
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    throw error
  }
}

// Get events that are ongoing or will start within an hour from current time
export async function getEventsWithinHour() {
  try {
    const allEvents = await getAllEvents()
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000))
    
    // Filter events that are ongoing or starting within an hour
    const eventsWithinHour = allEvents.filter(event => {
      const eventStart = new Date(event.start_time)
      const eventEnd = new Date(event.end_time)
      
      // Event is ongoing (started but not ended) OR will start within an hour
      return (eventStart <= now && eventEnd >= now) || 
             (eventStart > now && eventStart <= oneHourFromNow)
    })
    
    // Sort by start time
    eventsWithinHour.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    
    return eventsWithinHour
  } catch (error) {
    console.error('Error fetching events within hour:', error)
    throw error
  }
}

// Get a specific event by ID
export async function getEventById(eventId) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3036'
    const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching event by ID:', error)
    throw error
  }
}

// Get event status (Upcoming, Ongoing, Ended)
export async function getEventStatus(eventId) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3036'
    const response = await fetch(`${apiUrl}/api/events/${eventId}/status`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching event status:', error)
    throw error
  }
}

// Mark event as interested
export async function markEventAsInterested(eventId) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3036'
    const response = await fetch(`${apiUrl}/api/interested`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: eventId })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error marking event as interested:', error)
    throw error
  }
}

// Remove event from interested
export async function removeEventFromInterested(eventId) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3036'
    const response = await fetch(`${apiUrl}/api/interested`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_id: eventId })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error removing event from interested:', error)
    throw error
  }
}