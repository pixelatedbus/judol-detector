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
            maxAge: 24 * 60 * 60 * 1000 
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));

    app.use('/api/auth', authRoutes);
    app.use('/api/processing', processingRoutes);

    try {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
}

bootstrap();