// Location: /frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                govt: {
                    blue: '#0a1a3a',
                    lightBlue: '#1a3a6a',
                    gold: '#d4a847',
                    cream: '#f5f0e8',
                    red: '#c41e3a',
                    green: '#2e7d32',
                }
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'shake': 'shake 0.5s',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-10px)' },
                    '75%': { transform: 'translateX(10px)' },
                },
            },
        },
    },
    plugins: [],
};