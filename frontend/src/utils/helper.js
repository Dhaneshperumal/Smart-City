/**
 * Helper functions for the Smart City application
 */

// Format date to various formats
export const formatDate = (date, format = 'full') => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }
  
    const options = {
      full: { year: 'numeric', month: 'long', day: 'numeric' },
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      monthDay: { month: 'short', day: 'numeric' },
      yearMonth: { year: 'numeric', month: 'long' },
      weekday: { weekday: 'long', month: 'short', day: 'numeric' },
      monthYear: { month: 'long', year: 'numeric' },
      MMM: { month: 'short' },
      MMMM: { month: 'long' },
      DD: { day: 'numeric' },
      D: { day: 'numeric' },
      YYYY: { year: 'numeric' }
    };
  
    // If format is a predefined option, use it
    if (options[format]) {
      return date.toLocaleDateString('en-US', options[format]);
    }
  
    // If format is a custom string, handle basic formatting
    if (format === 'YYYY-MM-DD') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  
    if (format === 'MM/DD/YYYY') {
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    }
  
    if (format === 'DD/MM/YYYY') {
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  
    // Default to full format
    return date.toLocaleDateString('en-US', options.full);
  };
  
  // Format time (12-hour or 24-hour format)
  export const formatTime = (date, use24Hour = false) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid time';
    }
  
    if (use24Hour) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Format relative time (e.g., "5 minutes ago", "2 days ago")
  export const formatRelativeTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }
  
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    if (diffInSeconds < 60) {
      return diffInSeconds <= 1 ? 'just now' : `${diffInSeconds} seconds ago`;
    }
  
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    }
  
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }
  
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return diffInDays === 1 ? 'yesterday' : `${diffInDays} days ago`;
    }
  
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    }
  
    const diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
  };
  
  // Format duration in minutes to readable format
  export const formatDuration = (durationMinutes) => {
    if (typeof durationMinutes !== 'number' || durationMinutes < 0) {
      return 'Invalid duration';
    }
  
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
  
    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };
  
  // Format distance in meters to readable format
  export const formatDistance = (distanceMeters) => {
    if (typeof distanceMeters !== 'number' || distanceMeters < 0) {
      return 'Invalid distance';
    }
  
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)} m`;
    }
  
    const distanceKm = distanceMeters / 1000;
    return `${distanceKm.toFixed(1)} km`;
  };
  
  // Format currency
  export const formatCurrency = (amount, currency = 'USD') => {
    if (typeof amount !== 'number') {
      return 'Invalid amount';
    }
  
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };
  
  // Get query parameters from URL
  export const getQueryParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const params = {};
  
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  
    return params;
  };
  
  // Truncate text with ellipsis
  export const truncateText = (text, maxLength) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
  
    if (text.length <= maxLength) {
      return text;
    }
  
    return text.substring(0, maxLength) + '...';
  };
  
  // Validate email format
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate password strength
  export const getPasswordStrength = (password) => {
    if (!password) {
      return 0;
    }
  
    let strength = 0;
  
    // Length check
    if (password.length >= 8) {
      strength += 1;
    }
  
    // Contains uppercase
    if (/[A-Z]/.test(password)) {
      strength += 1;
    }
  
    // Contains number
    if (/[0-9]/.test(password)) {
      strength += 1;
    }
  
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    }
  
    return strength;
  };
  
  // Get readable password strength label
  export const getPasswordStrengthLabel = (strength) => {
    const labels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[strength] || 'Weak';
  };
  
  // Generate random color
  export const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  };
  
  // Convert snake_case to camelCase
  export const snakeToCamel = (str) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  };
  
  // Convert camelCase to snake_case
  export const camelToSnake = (str) => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  };
  
  // Get file extension from filename
  export const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };
  
  // Check if device is mobile
  export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // Get user's current location
  export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };
  
  // Calculate distance between two coordinates (Haversine formula)
  export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };
  
  // Convert degrees to radians
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Debounce function for performance optimization
  export const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  // Throttle function for performance optimization
  export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };
  
  // Get initials from name
  export const getInitials = (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  