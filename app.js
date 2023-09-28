const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Create the user model
const mysql = require('mysql2'); // Import the mysql2 library
const flash = require('express-flash'); // Import express-flash
const amqp = require('amqplib');
const axios = require('axios');

const path = require('path');

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(flash()); // Add the express-flash middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("./views"));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',        // MySQL server host
  user: 'root',    // MySQL username
  password: 'root', // MySQL password
  database: 'leisa', // MySQL database name
  waitForConnections: true,
  connectionLimit: 10,      // Maximum number of connections in the pool
  queueLimit: 0             // Unlimited queueing
});

// Passport Local Strategy for user authentication
passport.use(new LocalStrategy((username, password, done) => {
  // Check if the user exists in the database
  pool.promise().query('SELECT * FROM users WHERE username = ?', [username])
    .then(([rows]) => {
      if (rows.length === 0) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const user = rows[0];

      // Compare the hashed password
      if (bcrypt.compareSync(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    })
    .catch((err) => {
      return done(err);
    });
}));

// Passport Serialization and Deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Retrieve the user by ID from the database
  pool.promise().query('SELECT * FROM users WHERE id = ?', [id])
    .then(([rows]) => {
      if (rows.length === 0) {
        return done(new Error('User not found'));
      }

      const user = rows[0];
      return done(null, user);
    })
    .catch((err) => {
      return done(err);
    });
});

// Define routes for registration and login
app.get('/', (req, res) => {
  if (req.isAuthenticated())
    res.redirect('/dashboard');
  else
    res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash('error', 'Invalid username or password'); // Set an error flash message
      return res.redirect('/login');
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.redirect('/dashboard');
    });
  })(req, res, next);
});


app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password, rabbitmq_username, rabbitmq_password } = req.body;

    // Validate user input (you can add more validation as needed)
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
    }

    // Check if the user already exists in the database
    const existingUser = await pool.promise().query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

    if (existingUser[0].length > 0) {
      req.flash('error', 'User already exists');
      return res.redirect('/register');
    }

    // Hash the user's password (you should use a secure hashing library like bcrypt)
    const hashedPassword = bcrypt.hashSync(password, 10);

    // RabbitMQ connection information
    const rabbitmqUsername = 'guest';
    const rabbitmqPassword = 'guest';
    const rabbitmqHost = 'localhost'; // Replace with your RabbitMQ server host
    const rabbitmqPort = 5672;
    // Generate a random queue name for the user
    const randomQueueName = generateRandomQueueName();



    // Create a connection to RabbitMQ with credentials
    const connection = await amqp.connect(`amqp://${rabbitmqUsername}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}`);

    // Create a channel
    const channel = await connection.createChannel();

    // Declare the random queue
    await channel.assertQueue(randomQueueName);

    // Close the RabbitMQ connection and channel
    await channel.close();
    await connection.close();



    // Insert the user data into the database with the randomQueueName
    const sql = 'INSERT INTO users (username, email, password, queueName,rabbitmq_username,rabbitmq_password) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [username, email, hashedPassword, randomQueueName, rabbitmq_username, rabbitmq_password];


    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        req.flash('error', 'Registration failed');
        return res.redirect('/register');
      }

      // Registration successful, you can redirect the user to a success page or login page
      req.flash('success', 'Registration successful');
      createUser(randomQueueName, rabbitmq_username, rabbitmq_password);
      res.redirect('/login');
    });
  } catch (err) {
    console.error('Error during user registration:', err);
    res.status(500).send('Internal Server Error');
  }
});






const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // Proceed to the next middleware or route handler if the user is authenticated.
  }
  res.redirect('/login'); // Redirect unauthenticated users to the login page.
};

app.get('/dashboard', isAuthenticated, (req, res) => {
  // Assuming you have the authenticated user object available in req.user
  const user = req.user;

  res.render('dashboard', { user: user });
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      // Handle the error, e.g., redirect to an error page or display a message
      return res.redirect('/error');
    }

    res.redirect('/'); // Redirect to the login page after successful logout
  });
});

app.get('/update', isAuthenticated, (req, res) => {
  res.render('update'); // Render the update page
});

app.post('/update', isAuthenticated, (req, res) => {
  const { username, email, oldPassword, newPassword } = req.body;

  // Validate the form data (you can add more validation as needed)
  if (!username || !email || !oldPassword || !newPassword) {
    req.flash('error', 'All fields are required');
    return res.redirect('/update'); // Redirect back to the update page
  }

  // Check if the old password matches the user's current password
  pool.promise()
    .query('SELECT * FROM users WHERE id = ?', [req.user.id])
    .then(([rows]) => {
      if (rows.length === 0) {
        req.flash('error', 'User not found');
        return res.redirect('/update'); // Redirect back to the update page
      }

      const user = rows[0];

      // Compare the hashed old password
      if (!bcrypt.compareSync(oldPassword, user.password)) {
        req.flash('error', 'Old password is incorrect');
        return res.redirect('/update'); // Redirect back to the update page
      }

      // Hash the new password
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      // Update the user's details in the database
      pool.query(
        'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
        [username, email, hashedPassword, req.user.id],
        (err, result) => {
          if (err) {
            console.error('Error updating user:', err);
            req.flash('error', 'Update failed');
            return res.redirect('/update'); // Redirect back to the update page
          }

          // Redirect to the dashboard or update page with a success message
          req.flash('success', 'Update successful');
          return res.redirect('/dashboard'); // Redirect to the dashboard
        }
      );
    })
    .catch((err) => {
      console.error('Error during user update:', err);
      req.flash('error', 'Internal Server Error');
      res.redirect('/update'); // Redirect back to the update page
    });
});

app.get('/consume', async (req, res) => {
  try {
    rabbitmqQueue = '';
    rabbitmqUsername = '';
    rabbitmqPassword = '';
    const rabbitmqHost = 'localhost'; // Replace with your RabbitMQ server host
    const rabbitmqPort = 5672;

    pool.promise()
      .query('SELECT * FROM users WHERE id = ?', [req.user.id])
      .then(([rows]) => {
        if (rows.length === 0) {
          req.flash('error', 'User not found');
          return res.redirect('/'); // Redirect back to the / page
        }

        const user = rows[0];
        rabbitmqQueue = user.queueName;
        rabbitmqUsername = user.rabbitmq_username;
        rabbitmqPassword = user.rabbitmq_password;

      })
    const connection = await amqp.connect(`amqp://${rabbitmqUsername}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}`);
    const channel = await connection.createChannel();

    await channel.assertQueue(rabbitmqQueue);

    // Consume messages from the queue
    const messages = [];
    channel.consume(rabbitmqQueue, (message) => {
      if (message !== null) {
        messages.push(message.content.toString()); // Assuming messages are in plain text
        channel.ack(message);

      }
    });

    // Close the channel and connection when all messages are consumed
    setTimeout(() => {
      channel.close();
      connection.close();
      res.render('consume', { queueName: rabbitmqQueue, messages });
    }, 1000); // Adjust the timeout as needed to allow sufficient time for message consumption
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving messages from RabbitMQ.');
  }
});





// Render the EJS template for publishing a message
app.get('/publish', async (req, res) => {

  pool.query('SELECT username, queueName FROM users WHERE id != ?', [req.user.id], (error, results) => {
    if (error) throw error;
    const queues = results;

    res.render('publish', { message: null, queues }); // Pass 'queues' to the template
  });
});



// Handle the form submission to publish a message
app.post('/publish', async (req, res) => {
  const queueName = req.body.queueName;
  const message = req.body.message;

  try {

    rabbitmqUsername = '';
    rabbitmqPassword = '';
    const rabbitmqHost = 'localhost'; // Replace with your RabbitMQ server host
    const rabbitmqPort = 5672;

    pool.promise()
      .query('SELECT * FROM users WHERE id = ?', [req.user.id])
      .then(([rows]) => {
        if (rows.length === 0) {
          req.flash('error', 'User not found');
          return res.redirect('/'); // Redirect back to the / page
        }

        const user = rows[0];
        rabbitmqUsername = user.rabbitmq_username;
        rabbitmqPassword = user.rabbitmq_password;

      })
    const connection = await amqp.connect(`amqp://${rabbitmqUsername}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}`);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName);

    // Publish the message to the queue
    channel.sendToQueue(queueName, Buffer.from(message));

    console.log(`Message published to queue '${queueName}': ${message}`);

    await channel.close();
    await connection.close();

    // Render the EJS template with a success message
    pool.query('SELECT username, queueName FROM users WHERE id != ?', [req.user.id], (error, results) => {
      if (error) throw error;
      const queues = results;

      res.render('publish', { message: 'Message published successfully!', queues }); // Pass 'queues' to the template
    });

  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).send('Error publishing message to RabbitMQ.');
  }
});





/******************************************** */
function generateRandomQueueName() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let queueName = '';

  // Generate a random 10-character queue name
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    queueName += characters.charAt(randomIndex);
  }

  return queueName;
}
/******************************************* */
async function createUser(randomQueueName, rabbitmq_username, rabbitmq_password) {
  const rabbitmqApiBaseUrl = 'http://127.0.0.1:15672/api'; // Update with your RabbitMQ server's URL
  const rabbitmqApiCredentials = {
    username: 'guest',
    password: 'guest',
  };

  const newUsername = rabbitmq_username;
  const newPassword = rabbitmq_password;

  try {
    // Create the user using PUT method
    const createUserResponse = await axios.put(
      `${rabbitmqApiBaseUrl}/users/${newUsername}`,
      {
        password: newPassword,
        tags: 'management',
      },
      {
        auth: rabbitmqApiCredentials,
      }
    );

    if (createUserResponse.status === 201) {
      console.log(`User ${newUsername} created successfully.`);
    } else {
      console.error(`Failed to create user ${newUsername}.`);
    }

    // Set permissions (replace with your desired permissions)
    const setPermissionsResponse = await axios.put(
      `${rabbitmqApiBaseUrl}/permissions/${encodeURIComponent('/')}/${newUsername}`,
      {
        configure: '',
        write: '.*',
        read: `^${randomQueueName}$`,
      },
      {
        auth: rabbitmqApiCredentials,
      }
    );

    if (setPermissionsResponse.status === 201) {
      console.log(`Permissions set for user ${newUsername}.`);
    } else {
      console.error(`Failed to set permissions for user ${newUsername}`);
    }
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
  }
}


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
