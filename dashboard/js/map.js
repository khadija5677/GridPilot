// Global variables for map and markers
let map;
let busMarkers = [];
let busInfoWindows = [];
let googleMapsLoaded = false;
let routePolylines = [];

// Sample bus data with routes
const busData = [
  { id: '101A', route: 'Route 101', lat: 28.6139, lng: 77.2090, status: 'On-time', delay: 0 }, // Connaught Place
  { id: '101B', route: 'Route 101', lat: 28.6312, lng: 77.2150, status: '5 min delay', delay: 5 },
  { id: '101C', route: 'Route 101', lat: 28.6450, lng: 77.2200, status: 'On-time', delay: 0 },
  { id: '202A', route: 'Route 202', lat: 28.5850, lng: 77.0350, status: 'On-time', delay: 0 }, // Dwarka
  { id: '202B', route: 'Route 202', lat: 28.5920, lng: 77.0500, status: '2 min delay', delay: 2 },
  { id: '202C', route: 'Route 202', lat: 28.6000, lng: 77.0700, status: 'On-time', delay: 0 },
  { id: '303A', route: 'Route 303', lat: 28.7100, lng: 77.1200, status: 'On-time', delay: 0 }, // Rohini
  { id: '303B', route: 'Route 303', lat: 28.6950, lng: 77.1350, status: 'On-time', delay: 0 },
  { id: '303C', route: 'Route 303', lat: 28.6800, lng: 77.1500, status: '3 min delay', delay: 3 },
  { id: '404A', route: 'Route 404', lat: 28.5500, lng: 77.2250, status: 'On-time', delay: 0 }, // South Delhi
  { id: '404B', route: 'Route 404', lat: 28.5300, lng: 77.2400, status: 'On-time', delay: 0 },
  { id: '404C', route: 'Route 404', lat: 28.5100, lng: 77.2550, status: '1 min delay', delay: 1 }
];

// Route path coordinates (accurate optimal routes following major roads)
const routePaths = {
  '101': [
    { lat: 28.6139, lng: 77.2090 }, // Connaught Place (start)
    { lat: 28.6200, lng: 77.2120 },
    { lat: 28.6280, lng: 77.2140 },
    { lat: 28.6350, lng: 77.2160 },
    { lat: 28.6420, lng: 77.2180 },
    { lat: 28.6450, lng: 77.2200 }  // End point (North Delhi)
  ],
  '202': [
    { lat: 28.5850, lng: 77.0350 }, // Dwarka Sector 9 (start)
    { lat: 28.5880, lng: 77.0420 },
    { lat: 28.5920, lng: 77.0500 },
    { lat: 28.5960, lng: 77.0580 },
    { lat: 28.6000, lng: 77.0700 }  // End point (Dwarka Sector 21)
  ],
  '303': [
    { lat: 28.7100, lng: 77.1200 }, // Rohini Sector 8 (start)
    { lat: 28.7050, lng: 77.1250 },
    { lat: 28.7000, lng: 77.1300 },
    { lat: 28.6950, lng: 77.1350 },
    { lat: 28.6900, lng: 77.1400 },
    { lat: 28.6850, lng: 77.1450 },
    { lat: 28.6800, lng: 77.1500 }  // End point (Rohini Sector 24)
  ],
  '404': [
    { lat: 28.5500, lng: 77.2250 }, // South Extension (start)
    { lat: 28.5450, lng: 77.2300 },
    { lat: 28.5400, lng: 77.2350 },
    { lat: 28.5350, lng: 77.2400 },
    { lat: 28.5300, lng: 77.2450 },
    { lat: 28.5250, lng: 77.2500 },
    { lat: 28.5200, lng: 77.2550 },
    { lat: 28.5150, lng: 77.2600 },
    { lat: 28.5100, lng: 77.2650 }  // End point (Mehrauli)
  ]
};

// Load Google Maps with provided API key
function loadGoogleMaps() {
  const apiKey = 'AIzaSyBSH_18E5exLx8KFGtcly7fCq_amUOhxkI';
  if (!apiKey) {
    alert('Please enter a valid Google Maps API key');
    return;
  }
  
  // Remove any existing Google Maps script
  const existingScript = document.getElementById('google-maps-script');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create new script element
  const script = document.createElement('script');
  script.id = 'google-maps-script';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
  script.async = true;
  script.defer = true;
  script.onerror = function() {
    console.error('Failed to load Google Maps. Please check your API key.');
    alert('Failed to load Google Maps. Please check the console for more details.');
    // Show simulated bus positions as fallback
    generateBusPositions();
  };
  
  // Add script to document
  document.head.appendChild(script);
}

// Automatically load Google Maps when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadGoogleMaps();
});

// Initialize Google Map
function initMap() {
  // Hide the placeholder
  document.querySelector('.map-placeholder').style.display = 'none';
  
  // Center map on Delhi
  const delhi = { lat: 28.6139, lng: 77.2090 };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: delhi,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  
  // Add bus markers to map
  updateBusMarkers();
  
  // Start real-time updates
  setInterval(updateBusPositions, 5000);
  
  googleMapsLoaded = true;
}

// Update bus markers on map
function updateBusMarkers() {
  if (!googleMapsLoaded) {
    // Update CSS-based visualization if Google Maps is not loaded
    generateBusPositions();
    return;
  }
  
  // Clear existing markers
  busMarkers.forEach(marker => marker.setMap(null));
  busMarkers = [];
  busInfoWindows = [];
  
  // Only add markers for the highlighted route
  const highlightedRoute = document.getElementById('route-select-highlight').value;
  const routeBuses = busData.filter(bus => bus.route === `Route ${highlightedRoute}`);
  
  routeBuses.forEach(bus => {
    const marker = new google.maps.Marker({
      position: { lat: bus.lat, lng: bus.lng },
      map: map,
      title: `Bus ${bus.id} - ${bus.status}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF0000",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2
      }
    });
    
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="margin: 10px;">
          <h3>Bus ${bus.id}</h3>
          <p><strong>Route:</strong> ${bus.route}</p>
          <p><strong>Status:</strong> ${bus.status}</p>
          <p><strong>Delay:</strong> ${bus.delay} min</p>
        </div>
      `
    });
    
    marker.addListener('click', () => {
      busInfoWindows.forEach(iw => iw.close());
      infoWindow.open(map, marker);
    });
    
    busMarkers.push(marker);
    busInfoWindows.push(infoWindow);
  });
  
  // Update bus monitoring data
  populateBusMonitoring();
}

// Generate sample bus positions on map (fallback for when Google Maps is not available)
function generateBusPositions() {
  const mapContainer = document.getElementById('map');
  // Clear only bus and route elements, keep placeholder
  const elements = mapContainer.querySelectorAll('.bus, .route');
  elements.forEach(el => el.remove());
  
  // Don't create any visual elements - just show the placeholder text
  // This removes both orange spots (buses) and green lines (routes)
}

// Update bus positions (simulate movement)
function updateBusPositions() {
  busData.forEach(bus => {
    // Simulate movement by slightly changing position
    bus.lat += (Math.random() - 0.5) * 0.01;
    bus.lng += (Math.random() - 0.5) * 0.01;
    
    // Randomly update status
    const statuses = ['On-time', '1 min delay', '2 min delay', '3 min delay', '5 min delay'];
    bus.status = statuses[Math.floor(Math.random() * statuses.length)];
    bus.delay = parseInt(bus.status) || 0;
  });
  
  // Update markers on map
  updateBusMarkers();
  
  // Update dashboard data
  updateDashboard();
}

// Highlight a specific route
function highlightRoute(routeNumber) {
  if (!routeNumber) return;
  
  // Filter buses by route
  const routeBuses = busData.filter(bus => bus.route === `Route ${routeNumber}`);
  
  if (googleMapsLoaded) {
    // Clear all markers and polylines
    busMarkers.forEach(marker => marker.setMap(null));
    busMarkers = [];
    busInfoWindows = [];
    
    // Clear existing route polylines
    routePolylines.forEach(polyline => polyline.setMap(null));
    routePolylines = [];
    
    // Draw route path as polyline
    const routePath = routePaths[routeNumber];
    if (routePath) {
      const polyline = new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
      
      polyline.setMap(map);
      routePolylines.push(polyline);
    }
    
    // Add markers only for the selected route
    routeBuses.forEach(bus => {
      const marker = new google.maps.Marker({
        position: { lat: bus.lat, lng: bus.lng },
        map: map,
        title: `Bus ${bus.id} - ${bus.status}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10, // Larger scale for highlighted buses
          fillColor: "#FF0000",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2
        }
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="margin: 10px;">
            <h3>Bus ${bus.id}</h3>
            <p><strong>Route:</strong> ${bus.route}</p>
            <p><strong>Status:</strong> ${bus.status}</p>
            <p><strong>Delay:</strong> ${bus.delay} min</p>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        busInfoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
      });
      
      busMarkers.push(marker);
      busInfoWindows.push(infoWindow);
    });
  } else {
    // Update CSS visualization for highlighted route
    generateBusPositions(routeBuses);
  }
  
  // Update bus monitoring to show only highlighted route
  const container = document.getElementById('bus-monitoring');
  container.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong>Route ${routeNumber}:</strong> 
      ${routeBuses.map(bus => `Bus ${bus.id} (${bus.status})`).join(', ')}
    </div>
  `;
}

// Show all routes
function showAllRoutes() {
  // Clear existing route polylines
  routePolylines.forEach(polyline => polyline.setMap(null));
  routePolylines = [];
  
  // Reset to show all buses
  updateBusMarkers();
  
  // Update bus monitoring to show all routes
  populateBusMonitoring();
  
  // Reset the route selection dropdown
  document.getElementById('route-select-highlight').value = '';
}
