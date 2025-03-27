import L from 'leaflet';
import { getMapConfig, getPointsOfInterest, getRoute } from './api';

// Cache for map configuration
let mapConfig = null;

// Initialize map with configuration
export const initializeMap = async (mapContainerId, options = {}) => {
  try {
    // Get map configuration if not cached
    if (!mapConfig) {
      mapConfig = await getMapConfig();
    }
    
    // Create map with default options
    const map = L.map(mapContainerId, {
      center: options.center || mapConfig.center,
      zoom: options.zoom || mapConfig.zoom,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
      zoomControl: false, // Add custom zoom control below
      ...options
    });
    
    // Add zoom control to the bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);
    
    // Add scale control
    L.control.scale({
      imperial: false,
      position: 'bottomleft'
    }).addTo(map);
    
    // Add default tile layer
    addTileLayer(map, options.layer || mapConfig.defaultLayer);
    
    return map;
  } catch (error) {
    console.error('Failed to initialize map:', error);
    throw error;
  }
};

// Add tile layer to map
export const addTileLayer = (map, layerId) => {
  // Remove existing tile layers
  map.eachLayer(layer => {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer);
    }
  });
  
  // Standard layer (default OSM-style)
  if (layerId === 'standard') {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
  }
  // Satellite layer
  else if (layerId === 'satellite') {
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    }).addTo(map);
  }
  // Transit layer
  else if (layerId === 'transit') {
    L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey={apikey}', {
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      apikey: process.env.REACT_APP_THUNDERFOREST_API_KEY || '',
      maxZoom: 19
    }).addTo(map);
  }
  // Default to standard if layer ID not recognized
  else {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
  }
  
  return map;
};

// Load points of interest on map
export const loadPointsOfInterest = async (map, bounds, types = null) => {
  try {
    const boundsObj = map.getBounds();
    
    // Prepare bounds parameters
    const params = {
      minLat: boundsObj.getSouth(),
      maxLat: boundsObj.getNorth(),
      minLng: boundsObj.getWest(),
      maxLng: boundsObj.getEast()
    };
    
    // Add types if provided
    if (types) {
      params.types = types;
    }
    
    // Get POIs from API
    const poiData = await getPointsOfInterest(params);
    
    // Create markers layer group if not exists
    let markersLayer = map._poiMarkersLayer;
    if (!markersLayer) {
      markersLayer = L.layerGroup().addTo(map);
      map._poiMarkersLayer = markersLayer;
    } else {
      markersLayer.clearLayers();
    }
    
    // Add markers for each POI
    poiData.features.forEach(feature => {
      addPOIMarker(feature, markersLayer);
    });
    
    return poiData;
  } catch (error) {
    console.error('Failed to load points of interest:', error);
    throw error;
  }
};

// Add POI marker to map
export const addPOIMarker = (feature, layerGroup) => {
  const { geometry, properties } = feature;
  
  // Skip if missing coordinates
  if (!geometry || !geometry.coordinates) {
    return null;
  }
  
  const [lng, lat] = geometry.coordinates;
  
  // Create marker with appropriate icon
  const marker = L.marker([lat, lng], {
    icon: getPOIIcon(properties.type, properties.subType)
  });
  
  // Create popup content
  const popupContent = `
    <div class="poi-popup">
      <h4>${properties.name}</h4>
      ${properties.description ? `<p>${properties.description}</p>` : ''}
      ${properties.image ? `
        <div class="poi-image">
          <img src="${properties.image}" alt="${properties.name}" />
        </div>
      ` : ''}
      <div class="poi-footer">
        <span class="poi-type ${properties.type}">${getCategoryLabel(properties.type)}</span>
        <a href="/map?poi=${properties.id}" class="btn btn-sm btn-primary">Details</a>
      </div>
    </div>
  `;
  
  // Bind popup to marker
  marker.bindPopup(popupContent);
  
  // Add marker to layer group
  layerGroup.addLayer(marker);
  
  return marker;
};

// Get icon for POI based on type
export const getPOIIcon = (type, subType) => {
  let iconUrl = '';
  let iconSize = [32, 32];
  
  // Set icon based on POI type
  switch (type) {
    case 'attraction':
      iconUrl = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png';
      break;
    case 'event':
      iconUrl = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png';
      break;
    case 'transportation':
      iconUrl = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png';
      break;
    default:
      iconUrl = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png';
  }
  
  return L.icon({
    iconUrl,
    iconSize,
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Get route between two points
export const getMapRoute = async (map, fromCoords, toCoords, mode = 'walking') => {
  try {
    // Clear existing routes
    if (map._routeLayer) {
      map.removeLayer(map._routeLayer);
    }
    
    // Get route from API
    const routeData = await getRoute(fromCoords, toCoords, mode);
    
    // Check if route data is valid
    if (!routeData || !routeData.features || routeData.features.length === 0) {
      throw new Error('No route found');
    }
    
    // Get the first route feature
    const routeFeature = routeData.features[0];
    
    // Create route layer
    const routeLayer = L.geoJSON(routeFeature, {
      style: {
        color: getRouteColor(mode),
        weight: 5,
        opacity: 0.7
      }
    }).addTo(map);
    
    // Store route layer in map for future reference
    map._routeLayer = routeLayer;
    
    // Fit map to route bounds
    map.fitBounds(routeLayer.getBounds(), {
      padding: [50, 50]
    });
    
    return {
      route: routeFeature,
      distance: routeFeature.properties.distance,
      duration: routeFeature.properties.duration
    };
  } catch (error) {
    console.error('Failed to get route:', error);
    throw error;
  }
};

// Get color for route based on mode
export const getRouteColor = (mode) => {
  switch (mode) {
    case 'walking':
      return '#4285F4'; // Blue
    case 'cycling':
      return '#0F9D58'; // Green
    case 'driving':
      return '#DB4437'; // Red
    case 'transit':
      return '#F4B400'; // Yellow
    default:
      return '#4285F4'; // Default blue
  }
};

// Convert coordinates to address using reverse geocoding
export const reverseGeocode = async (coords) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    return {
      address: data.display_name,
      details: data.address
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {
      address: 'Unknown location',
      details: {}
    };
  }
};

// Helper function to get category label
const getCategoryLabel = (type) => {
  const labels = {
    attraction: 'Attraction',
    event: 'Event',
    transportation: 'Transport'
  };
  
  return labels[type] || type;
};

// Download offline map region
export const downloadOfflineMap = async (regionId) => {
  // This function would handle the download of an offline map region
  // In a real implementation, this would involve:
  // 1. Getting region metadata
  // 2. Downloading tile data within the bounds
  // 3. Storing it in IndexedDB or other client-side storage
  // 4. Tracking download progress
  
  // For now, we return a promise that resolves after a mock "download" time
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        regionId,
        message: `Successfully downloaded map region: ${regionId}`
      });
    }, 2000);
  });
};
