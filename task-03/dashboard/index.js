const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', true);

const BACKEND_URL = 'http://backend:3000';

// Function to handle dashboard rendering
const renderDashboard = async (req, res) => {
    try {
        const dateFilter = req.query.date || new Date().toISOString().split('T')[0];
        const statsResponse = await axios.get(`${BACKEND_URL}/api/stats?date_filter=${dateFilter}`);
        const stats = statsResponse.data;

        res.render('dashboard', { stats, basePath: req.baseUrl || '' });
    } catch (error) {
        console.error('Failed to fetch statistics:', error.message);
        res.status(500).render('error', {
            message: 'Failed to fetch statistics',
            error: error.message,
            basePath: req.baseUrl || '',
        });
    }
};

// Route handlers for the dashboard
app.get('/', renderDashboard);
app.get('/dashboard', renderDashboard);

// API endpoint to fetch stats data
app.get('/api/dashboard-data', async (req, res) => {
    try {
        const dateFilter = req.query.date || new Date().toISOString().split('T')[0];

        const statsResponse = await axios.get(`${BACKEND_URL}/api/stats?date_filter=${dateFilter}`);

        const transformedData = {
            totalTasks: statsResponse.data[0].total,
            completedTasks: statsResponse.data[0].completed,
            completionRate: statsResponse.data[0].completion_rate,
            avgTaskLength: statsResponse.data[0].avg_length,
        };

        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Dashboard running on port ${PORT}`);
    // Connection test to backend on startup
    axios
        .get(`${BACKEND_URL}/api/stats`)
        .then(() => console.log('Successfully connected to backend API'))
        .catch((err) => console.error('Failed to connect to backend API:', err.message));
});
