// WebSocket service for real-time communication
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 seconds

// Event handlers
const eventHandlers = {
  message: [],
  notification: [],
  transportation_update: [],
  error: [],
  open: [],
  close: []
};

// Initialize WebSocket connection
export const initializeWebSocket = (token, customHandlers = {}) => {
  // Close existing connection if any
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
  }
  
  try {
    // Connect to WebSocket server with token for authentication
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    socket = new WebSocket(wsUrl);
    
    // Set up event handlers
    socket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0;
      triggerEventHandlers('open');
      
      // Send initial subscription to relevant channels
      subscribeToChannels([
        'notifications',
        'transportation_updates',
        'events_updates'
      ]);
      
      // Custom open handler if provided
      if (customHandlers.onOpen) {
        customHandlers.onOpen();
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Trigger handlers based on message type
        if (data.type) {
          triggerEventHandlers(data.type, data);
        }
        
        // Always trigger 'message' handlers for any message
        triggerEventHandlers('message', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      triggerEventHandlers('error', error);
      
      // Custom error handler if provided
      if (customHandlers.onError) {
        customHandlers.onError(error);
      }
    };
    
    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      triggerEventHandlers('close', event);
      
      // Custom close handler if provided
      if (customHandlers.onClose) {
        customHandlers.onClose(event);
      }
      
      // Auto-reconnect if not closed cleanly and hasn't reached max attempts
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
        reconnectAttempts++;
        
        setTimeout(() => {
          initializeWebSocket(token, customHandlers);
        }, RECONNECT_INTERVAL);
      }
    };
    
    // Return a cleanup function
    return () => {
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    };
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    return () => {}; // Empty cleanup function
  }
};

// Send message to WebSocket server
export const sendMessage = (type, data) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected');
    return false;
  }
  
  try {
    const message = JSON.stringify({
      type,
      ...data
    });
    
    socket.send(message);
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
};

// Subscribe to channels
export const subscribeToChannels = (channels) => {
  return sendMessage('subscribe', { channels });
};

// Unsubscribe from channels
export const unsubscribeFromChannels = (channels) => {
  return sendMessage('unsubscribe', { channels });
};

// Check if WebSocket is connected
export const isConnected = () => {
  return socket && socket.readyState === WebSocket.OPEN;
};

// Add event handler
export const addEventHandler = (eventType, handler) => {
  if (!eventHandlers[eventType]) {
    eventHandlers[eventType] = [];
  }
  
  eventHandlers[eventType].push(handler);
  
  // Return function to remove the handler
  return () => {
    removeEventHandler(eventType, handler);
  };
};

// Remove event handler
export const removeEventHandler = (eventType, handler) => {
  if (!eventHandlers[eventType]) {
    return;
  }
  
  const index = eventHandlers[eventType].indexOf(handler);
  if (index !== -1) {
    eventHandlers[eventType].splice(index, 1);
  }
};

// Trigger event handlers
const triggerEventHandlers = (eventType, data) => {
  if (!eventHandlers[eventType]) {
    return;
  }
  
  eventHandlers[eventType].forEach(handler => {
    try {
      handler(data);
    } catch (error) {
      console.error(`Error in ${eventType} handler:`, error);
    }
  });
};

// Send transportation location update (for drivers)
export const sendLocationUpdate = (vehicleId, coordinates, heading, speed) => {
  return sendMessage('transportation_location', {
    vehicleId,
    location: {
      coordinates,
      heading,
      speed
    },
    timestamp: Date.now()
  });
};

// Send ping to keep connection alive
export const sendPing = () => {
  return sendMessage('ping', { timestamp: Date.now() });
};

// Set up automatic ping to prevent connection timeouts
let pingInterval = null;

export const startAutoPing = (intervalMs = 30000) => {
  // Clear any existing ping interval
  if (pingInterval) {
    clearInterval(pingInterval);
  }
  
  // Set up new ping interval
  pingInterval = setInterval(() => {
    if (isConnected()) {
      sendPing();
    }
  }, intervalMs);
  
  return () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };
};
