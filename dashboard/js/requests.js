// Submit user request for bus service
async function submitRequest() {
  const pickupLat = document.getElementById('pickup-lat').value;
  const pickupLng = document.getElementById('pickup-lng').value;
  const destinationLat = document.getElementById('destination-lat').value;
  const destinationLng = document.getElementById('destination-lng').value;
  const preferredTime = document.getElementById('preferred-time').value;

  if (!pickupLat || !pickupLng || !destinationLat || !destinationLng || !preferredTime) {
    alert('Please provide all required information including location data.');
    return;
  }

  // Simulate request submission without server
  alert('Request submitted successfully! (Simulated)');

  // Simulate suggested routes
  const simulatedRoutes = [
    {
      routeName: 'Connaught Place - Red Fort',
      routeNumber: '101',
      pickupStop: 'Connaught Place',
      destinationStop: 'Red Fort',
      estimatedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      walkingDistance: 200,
      totalTime: 45,
      busId: '101A'
    },
    {
      routeName: 'Dwarka - CBD',
      routeNumber: '202',
      pickupStop: 'Dwarka Sector 14',
      destinationStop: 'CBD Belapur',
      estimatedArrival: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      walkingDistance: 150,
      totalTime: 60,
      busId: '202B'
    }
  ];

  displaySuggestedRoutes(simulatedRoutes);
}

// Display suggested routes to user
function displaySuggestedRoutes(routes) {
  const routesList = document.getElementById('routes-list');
  const suggestedRoutesSection = document.getElementById('suggested-routes');
  
  if (routes.length === 0) {
    routesList.innerHTML = '<p>No routes found for your request. Please try different locations or time.</p>';
  } else {
    routesList.innerHTML = routes.map(route => `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: #f9f9f9;">
        <h4>${route.routeName} (Route ${route.routeNumber})</h4>
        <p><strong>From:</strong> ${route.pickupStop}</p>
        <p><strong>To:</strong> ${route.destinationStop}</p>
        <p><strong>Estimated Arrival:</strong> ${new Date(route.estimatedArrival).toLocaleTimeString()}</p>
        <p><strong>Walking Distance:</strong> ${route.walkingDistance} meters</p>
        <p><strong>Total Journey Time:</strong> ${route.totalTime} minutes</p>
        <button onclick="confirmRoute('${route.routeNumber}', '${route.busId}')" 
                style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Select This Route
        </button>
      </div>
    `).join('');
  }
  
  suggestedRoutesSection.style.display = 'block';
}

// Confirm selected route
function confirmRoute(routeNumber, busId) {
  alert(`Route ${routeNumber} confirmed! Bus ${busId} will be assigned for your journey.`);
  // Here you would typically update the request status to confirmed
}

// Load user's previous requests (simulated)
function loadUserRequests() {
  // Simulate loading requests
  const simulatedRequests = [
    {
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
      pickupLocation: { address: 'Connaught Place' },
      destination: { address: 'Red Fort' },
      preferredTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      suggestedRoutes: [
        { routeNumber: '101', totalTime: 45 }
      ]
    },
    {
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      pickupLocation: { address: 'Dwarka Sector 14' },
      destination: { address: 'CBD Belapur' },
      preferredTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      suggestedRoutes: [
        { routeNumber: '202', totalTime: 60 }
      ]
    }
  ];

  displayUserRequests(simulatedRequests);
}

// Display user requests
function displayUserRequests(requests) {
  const requestsContainer = document.getElementById('my-requests');
  
  if (requests.length === 0) {
    requestsContainer.innerHTML = '<p>No requests found. Submit a request above to get started!</p>';
    return;
  }

  requestsContainer.innerHTML = requests.map(request => `
    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: #f9f9f9;">
      <h4>Request from ${new Date(request.createdAt).toLocaleDateString()}</h4>
      <p><strong>Status:</strong> <span style="color: ${
        request.status === 'confirmed' ? 'green' : 
        request.status === 'pending' ? 'orange' : 'gray'
      }">${request.status}</span></p>
      <p><strong>From:</strong> ${request.pickupLocation.address || 'Unknown location'}</p>
      <p><strong>To:</strong> ${request.destination.address || 'Unknown location'}</p>
      <p><strong>Preferred Time:</strong> ${new Date(request.preferredTime).toLocaleString()}</p>
      
      ${request.suggestedRoutes && request.suggestedRoutes.length > 0 ? `
        <div style="margin-top: 10px;">
          <strong>Suggested Routes:</strong>
          ${request.suggestedRoutes.map(route => `
            <div style="margin: 5px 0; padding: 5px; background: #fff; border-radius: 4px;">
              Route ${route.routeNumber} - ${route.totalTime} minutes total
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Logout function (no-op since no login)
function logout() {
  alert('Logout not applicable in demo mode.');
}

// Load user requests on page load
document.addEventListener('DOMContentLoaded', function() {
  loadUserRequests();
});
