const authService = require('../config/auth');

// Alias for authenticate
const authenticate = authService.authenticate.bind(authService);

// Alias for authorize
const authorize = authService.authorize.bind(authService);

module.exports = {
    authenticate,
    authorize
};