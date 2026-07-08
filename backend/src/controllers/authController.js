const db = require('../config/database');
const authService = require('../config/auth');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role, full_name, badge_number, department } = req.body;

        // Check if user exists
        const existingUser = await db.executeQuery(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const passwordHash = await authService.hashPassword(password);

        // Insert user
        const result = await db.executeQuery(
            `INSERT INTO users (username, email, password_hash, role, full_name, badge_number, department) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, email, passwordHash, role, full_name, badge_number, department]
        );

        // Log registration
        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [result.insertId, 'register', 'user', result.insertId, 
             JSON.stringify({ username, role }), req.ip]
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId 
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const users = await db.executeQuery(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isValid = await authService.comparePassword(password, user.password_hash);
        
        if (!isValid) {
            await db.executeQuery(
                `INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address, status) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [user.id, 'login_failed', 'user', JSON.stringify({ username }), req.ip, 'failure']
            );
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        await db.executeQuery(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        const token = authService.generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });

        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.id, 'login', 'user', user.id, JSON.stringify({ username }), req.ip, 'success']
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const users = await db.executeQuery(
            'SELECT id, username, email, role, full_name, badge_number, department, last_login, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: users[0] });

    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

exports.logout = async (req, res) => {
    try {
        await db.executeQuery(
            `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.id, 'logout', 'user', req.user.id, 
             JSON.stringify({ username: req.user.username }), req.ip]
        );

        res.json({ message: 'Logout successful' });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};