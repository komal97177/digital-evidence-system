import { useNotification } from '../contexts/NotificationContext';

const MyComponent = () => {
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead,
        addNotification,
        soundEnabled,
        setSoundEnabled
    } = useNotification();

    return (
        <div>
            <span>Unread: {unreadCount}</span>
            <button onClick={markAllAsRead}>Mark All Read</button>
            <label>
                <input 
                    type="checkbox" 
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                Sound
            </label>
            {notifications.map(notif => (
                <div key={notif.id} onClick={() => markAsRead(notif.id)}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                </div>
            ))}
        </div>
    );
};