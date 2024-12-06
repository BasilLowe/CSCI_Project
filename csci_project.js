const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/myDatabase', {  //Choose your own Database
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Input sanitization function
function sanitizeInput(input) {
    return input.replace(/[<>]/g, ''); // Remove angle brackets to prevent XSS
}

// Username and password validation
function isValidUsername(username) {
    const usernamePattern = /^[a-zA-Z0-9_]+$/; // Only allow letters, numbers, and underscores, other symbols are not allowed here
    return usernamePattern.test(username) && username.length <= 20;
}

function isValidPassword(password) {
    const passwordPattern = /^[a-zA-Z0-9_]+$/; // Only allow letters, numbers, and underscores
    return passwordPattern.test(password) && password.length <= 20;
}

// Create default users with hashed passwords
async function createDefaultUsers() {
    await User.deleteMany({}); // Clear existing users

    const adminPassword = await bcrypt.hash('admin123', 10); // Hash the admin password
    const userPassword = await bcrypt.hash('user123', 10);   // Hash the user password

    await User.create([
        { username: 'admin', password: adminPassword, role: 'admin' },
        { username: 'user', password: userPassword, role: 'user' }
    ]);
}

// Call the function to create default users
createDefaultUsers().then(() => {
    console.log('Default users created.');
}).catch(err => {
    console.error('Error creating default users:', err);
});

// Serve the login page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login Page</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h2 {
                margin-bottom: 20px;
            }
            input, select {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ccc;
                border-radius: 5px;
            }
            button {
                width: 100%;
                padding: 10px;
                background-color: #5cb85c;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            button:hover {
                background-color: #4cae4c;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Login</h2>
            <form action="/login" method="POST">
                <input type="text" name="username" placeholder="Username" required>
                <input type="password" name="password" placeholder="Password" required>
                <select name="role">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Login</button>
            </form>
        </div>
    </body>
    </html>
    `);
});

// Login route
app.post('/login', async (req, res) => {
    let { username, password, role } = req.body;

    // Sanitize and validate input
    username = sanitizeInput(username);
    if (!isValidUsername(username) || !isValidPassword(password)) {
        return res.status(400).send('Invalid username or password format');
    }

    try {
        const user = await User.findOne({ username, role });

        // Check if user exists and password matches
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user; // Store user info in session
            // Redirect based on user role
            if (role === 'user') {
                res.redirect('/user-dashboard');
            } else {
                res.redirect('/admin-dashboard');
            }
        } else {
            res.status(401).send('Incorrect username or password');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Internal server error');
    }
});


// User dashboard route
app.get('/user-dashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'user') {
        res.send('<h1>Welcome to User Dashboard!</h1>');           //Put your own code action of User actions here
    } else {
        res.redirect('/'); // Redirect to login if not authorized
    }
});

// Admin dashboard route
app.get('/admin-dashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
        res.send('<h1>Welcome to Admin Dashboard!</h1>');           //Put your Admin actions here
    } else {
        res.redirect('/'); // Redirect to login if not authorized
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
