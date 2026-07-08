// Location: /frontend/src/hooks/useWebSocket.js
import { useEffect, useState, useRef } from 'react';
import { initializeSocket, getSocket, onEvent, offEvent } from '../services/socket';

export const useWebSocket = (event, callback, dependencies = []) => {
    const [isConnected, setIsConnected] = useState(false);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) {
            const token = localStorage.getItem('auth_token');
            if (token) {
                initializeSocket(token);
            }
        }

        const currentSocket = getSocket();
        if (currentSocket) {
            const handleConnect = () => setIsConnected(true);
            const handleDisconnect = () => setIsConnected(false);

            currentSocket.on('connect', handleConnect);
            currentSocket.on('disconnect', handleDisconnect);

            if (event && callbackRef.current) {
                onEvent(event, (data) => {
                    callbackRef.current(data);
                });
            }

            return () => {
                if (event) {
                    offEvent(event, callbackRef.current);
                }
                currentSocket.off('connect', handleConnect);
                currentSocket.off('disconnect', handleDisconnect);
            };
        }
    }, [event, ...dependencies]);

    return { isConnected, socket: getSocket() };
};

export default useWebSocket;