const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const processingRoutes = require('./routes/processing');
const passport = require('passport');
require('dotenv').config();  

require('./strategies/google'); 

async function bootstrap(){
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'none',
            secure: true
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
    });

    app.use(cors({
    origin: process.env.CLIENT_HOME_PAGE_URL || 'https://localhost:3000',
    credentials: true,
}));

    app.use('/api/auth', authRoutes);
    app.use('/api/processing', processingRoutes);

    try {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
}

bootstrap();