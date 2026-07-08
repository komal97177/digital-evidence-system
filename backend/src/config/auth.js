const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

class AuthService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
        this.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
    }

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
    }

    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        return jwt.sign(payload, this.JWT_SECRET, { 
            expiresIn: this.JWT_EXPIRE 
        });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ 
                    error: 'Authentication required' 
                });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ 
                    error: 'Invalid token format' 
                });
            }

            const decoded = this.verifyToken(token);
            if (!decoded) {
                return res.status(401).json({ 
                    error: 'Invalid or expired token' 
                });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(500).json({ 
                error: 'Authentication error' 
            });
        }
    }

    authorize(...allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Authentication required' 
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    error: 'Access denied. Insufficient permissions.' 
                });
            }

            next();
        };
    }
}

module.exports = new AuthService();