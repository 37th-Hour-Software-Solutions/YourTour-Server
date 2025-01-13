var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var MemoryStore = require('memorystore')(session)
var process = require('process');
var cors = require('cors');
var crypto = require('crypto');
var dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Helpers

// async function initialize() {
//   try {
//     await database.init();
//   } catch (error) {
//     // If there is an error initializing the services, log the error and exit the process
//     console.error(error);
//     process.exit(1);
//   }
// }

var app = express();

// Routes
var authRouter = require('./routes/auth')

// Initialize the database
// initialize();

// Enable CORS
app.use(cors());

// Don't need this since this is only a backend API
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// Enable sessions with memory store to prevent memory leaks
sess = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(20).toString('hex'),
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    maxAge: 30*24*60*60*1000, // 30 days
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  }
}

if (process.env.NODE_ENV === 'production') {
  console.log('Using production settings')
  // app.set('trust proxy', 1) // trust nginx proxy
} else {
  console.log('Using development settings')
}

app.use(session(sess))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    res.status(err.status || 500);
    res.json({ error: err.message });
  } else {
    res.status(err.status || 500);
    res.json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});

module.exports = app;