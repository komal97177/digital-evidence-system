// Location: /frontend/src/services/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
    if (!socket) {
        socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:5000', {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true
        });

        socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });
    }
    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const emitEvent = (event, data) => {
    if (socket) {
        socket.emit(event, data);
    }
};

export const onEvent = (event, callback) => {
    if (socket) {
        socket.on(event, callback);
    }
};

export const offEvent = (event, callback) => {
    if (socket) {
        socket.off(event, callback);
    }
};

export default {
    initializeSocket,
    getSocket,
    disconnectSocket,
    emitEvent,
    onEvent,
    offEvent
};