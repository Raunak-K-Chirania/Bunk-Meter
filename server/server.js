require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');

// Connect Database
connectDB();

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/ai', require('./routes/aiRoutes'));

// Custom Cron Job or Notification routes can be added here

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
