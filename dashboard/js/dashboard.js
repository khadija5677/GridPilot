// On page load, initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Set default user name
  document.getElementById('name').textContent = 'Demo User';
  // Display current time
  updateTime();
  setInterval(updateTime, 1000);
  // Initialize dashboard
  initializeDashboard();
});

// Update time function
function updateTime() {
  const now = new Date();
  document.getElementById('time').textContent = now.toLocaleTimeString();
}

// Initialize dashboard with sample data
function initializeDashboard() {
  // Populate bus monitoring data
  populateBusMonitoring();
  // Start real-time updates
  setInterval(updateDashboard, 5000);
}

// Populate bus monitoring data
function populateBusMonitoring() {
  const container = document.getElementById('bus-monitoring');
  container.innerHTML = '';
  
  // Group buses by route
  const routes = {};
  busData.forEach(bus => {
    if (!routes[bus.route]) {
      routes[bus.route] = [];
    }
    routes[bus.route].push(bus);
  });
  
  // Display buses by route
  for (const route in routes) {
    let routeHtml = `<div style="margin-bottom: 10px;"><strong>${route}:</strong> `;
    const buses = routes[route];
    routeHtml += buses.map(bus => `Bus ${bus.id} (${bus.status})`).join(', ');
    routeHtml += '</div>';
    container.innerHTML += routeHtml;
  }
}

// Update dashboard with new data
function updateDashboard() {
  // Update time
  updateTime();
  
  // Simulate changing data
  const delays = ['On-time', '1 min delay', '2 min delay', '3 min delay', '5 min delay'];
  const randomDelay = delays[Math.floor(Math.random() * delays.length)];
  document.getElementById('avg-delay').textContent = randomDelay;
  
  // Update efficiency
  const efficiency = 80 + Math.floor(Math.random() * 15);
  document.getElementById('efficiency').textContent = efficiency + '%';
}

// Adjust bus frequency
function adjustFrequency() {
  const route = document.getElementById('route-select').value;
  const frequency = document.getElementById('frequency-input').value;
  alert(`Adjusted frequency for ${route} to ${frequency} minutes`);
}

// Optimize routes with AI
function optimizeRoutes() {
  alert('Running AI optimization algorithm...\nRoutes have been optimized based on real-time traffic data.');
  // Simulate improvement
  document.getElementById('efficiency').textContent = '92%';
}

// Prevent bus bunching
function preventBunching() {
  alert('Implementing anti-bunching measures...\nAdjusted schedules to maintain optimal headway between buses.');
}

// Refresh data
function refreshData() {
  updateBusPositions();
  alert('Dashboard data refreshed with latest information.');
}

// Generate report
function generateReport() {
  alert('Generating route performance report...\nReport will be downloaded shortly.');
}

// Get current location using browser geolocation
function getCurrentLocation(type) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (type === 'pickup') {
          document.getElementById('pickup-lat').value = lat;
          document.getElementById('pickup-lng').value = lng;
          document.getElementById('pickup-address').value = 'Current Location';
        } else {
          document.getElementById('destination-lat').value = lat;
          document.getElementById('destination-lng').value = lng;
          document.getElementById('destination-address').value = 'Current Location';
        }
        
        // Reverse geocode to get address
        reverseGeocode(lat, lng, type);
      },
      function(error) {
        alert('Unable to get your location: ' + error.message);
      }
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

// Update pickup coordinates when dropdown selection changes
function updatePickupCoordinates(value) {
  if (value) {
    const [lat, lng] = value.split(',');
    document.getElementById('pickup-lat').value = lat;
    document.getElementById('pickup-lng').value = lng;
    document.getElementById('pickup-address').value = document.getElementById('pickup-location').options[document.getElementById('pickup-location').selectedIndex].text;
  }
}

// Update destination coordinates when dropdown selection changes
function updateDestinationCoordinates(value) {
  if (value) {
    const [lat, lng] = value.split(',');
    document.getElementById('destination-lat').value = lat;
    document.getElementById('destination-lng').value = lng;
    document.getElementById('destination-address').value = document.getElementById('destination-location').options[document.getElementById('destination-location').selectedIndex].text;
  }
}

// Reverse geocode coordinates to get address
function reverseGeocode(lat, lng, type) {
  // This would use a geocoding service in production
  // For now, we'll just use the coordinates
  console.log(`Coordinates for ${type}: ${lat}, ${lng}`);
}
