const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Variables to store the latest ISS location
let lastLocation = { lat: 0, lon: 0 };

// Function to get ISS location from the API
async function fetchISSLocation() {
  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    const { latitude, longitude } = response.data.iss_position;
    lastLocation = { lat: parseFloat(latitude), lon: parseFloat(longitude) };
    console.log('ISS Location updated:', lastLocation);
  } catch (error) {
    console.error('Error fetching ISS location:', error);
  }
}

async function fetchISSNews() {
  try {
    const apiKey = '16a9b6f766964c2a8a5fe5fb0a70f0e3'; // Replace with your NewsAPI key
    const response = await fetch(`https://newsapi.org/v2/everything?q=ISS&apiKey=${apiKey}`);
    const data = await response.json();
    return data.articles; // Return the articles data
  } catch (error) {
    console.error('Error fetching ISS news:', error);
    return []; // Return an empty array in case of error
  }
}


// Fetch ISS location every 1 0 seconds
fetchISSLocation(); // Fetch once immediately
setInterval(fetchISSLocation, 10000); // Every 10 seconds

// Emit ISS location to clients every 5 seconds
setInterval(() => {
  io.emit('issLocation', lastLocation);
}, 5000);

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Send the current ISS location immediately when a new client connects
  socket.emit('issLocation', lastLocation);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get("/map", (req,res) => {
    res.render("map.ejs");
});

app.get("/update", async (req,res) => {
  const data = await fetchISSNews();
    res.render("updates.ejs", {news: data});
});

app.get("/", (req,res) => {
    res.render("home.ejs");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
