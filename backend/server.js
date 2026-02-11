require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend and uploads directory
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', apiRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 Server is running successfully!\n');
    console.log(`📍 Local:    http://localhost:${PORT}`);

    // Get network IP address
    const networkInterfaces = os.networkInterfaces();

    Object.keys(networkInterfaces).forEach(interfaceName => {
        networkInterfaces[interfaceName].forEach(interface => {
            // Skip internal (loopback) and non-IPv4 addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                console.log(`🌐 Network:  http://${interface.address}:${PORT}`);
            }
        });
    });

    console.log('\n✨ Access from any device on your network using the Network URL!\n');
});
