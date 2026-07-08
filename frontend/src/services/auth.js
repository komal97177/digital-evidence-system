// Location: /frontend/src/services/auth.js
import api from './api';
import storage from './storage';

class AuthService {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'auth_user';
        this.permissionsKey = 'auth_permissions';
        this.refreshTimeout = null;
    }

    // Get stored token
    getToken() {
        return storage.get(this.tokenKey);
    }

    // Get stored user
    getUser() {
        return storage.get(this.userKey);
    }

    // Get stored permissions
    getPermissions() {
        return storage.get(this.permissionsKey) || [];
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken() && !!this.getUser();
    }

    // Login user
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user, permissions } = response.data;

            this.setSession(token, user, permissions);
            
            // Set axios default header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return {
                success: true,
                user,
                token,
                permissions
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    }

    // Set session data
    setSession(token, user, permissions = []) {
        storage.set(this.tokenKey, token);
        storage.set(this.userKey, user);
        storage.set(this.permissionsKey, permissions);
        
        // Set axios header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Start refresh timer
        this.startRefreshTimer(token);
    }

    // Clear session
    clearSession() {
        storage.remove(this.tokenKey);
        storage.remove(this.userKey);
        storage.remove(this.permissionsKey);
        
        delete api.defaults.headers.common['Authorization'];
        
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
    }

    // Logout user
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
        }
    }

    // Register new user
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            await api.post('/auth/forgot-password', { email });
            return {
                success: true,
                message: 'Password reset link sent to your email'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to send reset link'
            };
        }
    }

    // Reset password
    async resetPassword(token, newPassword) {
        try {
            await api.post('/auth/reset-password', { token, password: newPassword });
            return {
                success: true,
                message: 'Password reset successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to reset password'
            };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return {
                success: true,
                message: 'Password changed successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to change password'
            };
        }
    }

    // Update profile
    async updateProfile(userData) {
        try {
            const response = await api.put('/auth/profile', userData);
            const updatedUser = response.data.user;
            
            // Update stored user
            storage.set(this.userKey, updatedUser);
            
            return {
                success: true,
                user: updatedUser
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to update profile'
            };
        }
    }

    // Validate token
    async validateToken() {
        try {
            const response = await api.get('/auth/validate');
            return {
                success: true,
                valid: response.data.valid
            };
        } catch (error) {
            return {
                success: false,
                valid: false
            };
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh-token');
            const { token } = response.data;
            
            storage.set(this.tokenKey, token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Reset refresh timer
            this.startRefreshTimer(token);
            
            return {
                success: true,
                token
            };
        } catch (error) {
            this.clearSession();
            return {
                success: false,
                error: 'Failed to refresh token'
            };
        }
    }

    // Start refresh timer (refresh 5 minutes before expiry)
    startRefreshTimer(token) {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            const now = Date.now();
            const timeToExpiry = expiry - now;
            
            // Refresh 5 minutes before expiry
            const refreshTime = Math.max(timeToExpiry - 5 * 60 * 1000, 0);
            
            if (refreshTime > 0) {
                this.refreshTimeout = setTimeout(() => {
                    this.refreshToken();
                }, refreshTime);
            }
        } catch (error) {
            console.error('Failed to parse token:', error);
        }
    }

    // Check if user has specific role
    hasRole(role) {
        const user = this.getUser();
        if (!user) return false;
        
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    }

    // Check if user has specific permission
    hasPermission(permission) {
        const permissions = this.getPermissions();
        return permissions.includes(permission);
    }

    // Get user roles
    getRoles() {
        const user = this.getUser();
        return user ? user.roles : [];
    }
}

export default new AuthService();