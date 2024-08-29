var map = L.map('map').setView([0, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var issIcon = L.icon({
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
      iconSize: [50, 32],
    });

    var marker = L.marker([0, 0], {icon: issIcon}).addTo(map);

    let currentLat = 0;
    let currentLon = 0;
    let targetLat = 0;
    let targetLon = 0;

    // Socket.io connection to receive ISS location
    var socket = io();

    socket.on('issLocation', (data) => {
      targetLat = data.lat;
      targetLon = data.lon;
    });

    // Function to smoothly animate ISS between updates using linear interpolation
    function smoothMove() {
      currentLat += (targetLat - currentLat) * 0.01;  // Slower movement between updates
      currentLon += (targetLon - currentLon) * 0.01;

      marker.setLatLng([currentLat, currentLon]);
      map.panTo([currentLat, currentLon], {animate: true});

      requestAnimationFrame(smoothMove);
    }

    // Start the smooth animation
    smoothMove();