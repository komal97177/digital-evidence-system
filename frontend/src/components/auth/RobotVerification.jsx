// Location: /frontend/src/components/auth/RobotVerification.jsx
import React, { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, CheckCircle, RefreshCw, Clock } from 'lucide-react';

const RobotVerification = ({ onComplete, onClose }) => {
    const [puzzle, setPuzzle] = useState([]);
    const [selected, setSelected] = useState([]);
    const [attempts, setAttempts] = useState(0);
    const [status, setStatus] = useState('idle'); // idle, verifying, success, failed
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [isTimeout, setIsTimeout] = useState(false);

    // Government symbols for puzzle
    const symbols = [
        { id: 1, symbol: '🛡️', label: 'Shield' },
        { id: 2, symbol: '⚖️', label: 'Justice' },
        { id: 3, symbol: '🔑', label: 'Security' },
        { id: 4, symbol: '📜', label: 'Constitution' },
        { id: 5, symbol: '🏛️', label: 'Parliament' },
        { id: 6, symbol: '🔐', label: 'Integrity' }
    ];

    // Correct sequence (the order the user must select)
    const correctSequence = ['🛡️', '⚖️', '🔑', '📜', '🏛️', '🔐'];

    // Timer effect
    useEffect(() => {
        if (status === 'idle' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && status === 'idle') {
            setIsTimeout(true);
            setStatus('failed');
            setMessage('⏰ Time expired! Please try again.');
            setTimeout(() => {
                initializePuzzle();
                setTimeLeft(30);
                setIsTimeout(false);
            }, 2000);
        }
    }, [timeLeft, status]);

    useEffect(() => {
        initializePuzzle();
    }, []);

    const initializePuzzle = () => {
        const shuffled = [...symbols].sort(() => Math.random() - 0.5);
        setPuzzle(shuffled.map((item, index) => ({
            ...item,
            position: index,
            isSelected: false,
            isCorrect: false,
            isWrong: false
        })));
        setSelected([]);
        setStatus('idle');
        setMessage('');
        setTimeLeft(30);
        setIsTimeout(false);
    };

    const handleSymbolClick = (symbolId) => {
        if (status === 'success' || status === 'failed' || isTimeout) return;
        
        setPuzzle(prev => {
            const newPuzzle = prev.map(item => {
                if (item.id === symbolId) {
                    if (item.isSelected) {
                        return { ...item, isSelected: false };
                    }
                    return { ...item, isSelected: true };
                }
                return item;
            });
            
            const selectedSymbols = newPuzzle.filter(item => item.isSelected);
            setSelected(selectedSymbols);
            
            if (selectedSymbols.length === 6) {
                verifySequence(selectedSymbols);
            }
            
            return newPuzzle;
        });
    };

    const verifySequence = (selectedSymbols) => {
        setStatus('verifying');
        
        const selectedSequence = selectedSymbols.map(item => item.symbol);
        const isCorrect = selectedSequence.every((symbol, index) => 
            symbol === correctSequence[index]
        );

        if (isCorrect) {
            setStatus('success');
            setMessage('✓ Verification successful! You are human.');
            
            setPuzzle(prev => 
                prev.map(item => ({
                    ...item,
                    isCorrect: true,
                    isWrong: false
                }))
            );
            
            setTimeout(() => {
                onComplete(true);
            }, 1500);
        } else {
            setStatus('failed');
            setAttempts(prev => prev + 1);
            setMessage(`✗ Incorrect sequence. Attempt ${attempts + 1}/3`);
            
            setPuzzle(prev => 
                prev.map(item => ({
                    ...item,
                    isWrong: item.isSelected && !item.isCorrect,
                    isSelected: false
                }))
            );
            
            setTimeout(() => {
                setPuzzle(prev => 
                    prev.map(item => ({
                        ...item,
                        isWrong: false,
                        isSelected: false
                    }))
                );
                setSelected([]);
                setStatus('idle');
                setMessage('');
                
                if (attempts + 1 >= 3) {
                    setMessage('❌ Too many failed attempts. Please refresh and try again.');
                    setTimeout(() => {
                        onComplete(false);
                    }, 2000);
                }
            }, 1500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-8 relative animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-50 p-4 rounded-full border-2 border-blue-200">
                            <Shield className="w-12 h-12 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                        Human Verification
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Please select the symbols in the correct order
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                        <span className="inline-block bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            Correct Sequence: 🛡️ ⚖️ 🔑 📜 🏛️ 🔐
                        </span>
                    </div>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center mb-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                        timeLeft < 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                        <Clock className="w-4 h-4" />
                        <span className="font-mono font-bold">{timeLeft}s</span>
                    </div>
                </div>

                {/* Puzzle Grid */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
                    {puzzle.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleSymbolClick(item.id)}
                            disabled={status === 'success' || status === 'failed' || isTimeout}
                            className={`
                                relative aspect-square rounded-lg border-2 
                                text-4xl font-bold flex items-center justify-center
                                transition-all duration-300 transform
                                ${!item.isSelected && !item.isCorrect && !item.isWrong && 'hover:scale-105 hover:border-blue-400'}
                                ${item.isSelected && !item.isCorrect && !item.isWrong && 'border-blue-600 bg-blue-50 scale-105'}
                                ${item.isCorrect && 'border-green-500 bg-green-50 text-green-600 scale-105'}
                                ${item.isWrong && 'border-red-500 bg-red-50 text-red-600 animate-shake'}
                                ${status === 'success' ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                                disabled:cursor-not-allowed
                            `}
                        >
                            {item.symbol}
                            {item.isCorrect && (
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                    ✓
                                </span>
                            )}
                            {item.isWrong && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                    ✗
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Progress */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">
                        Selected: {selected.length}/6
                    </span>
                    <span className="text-sm text-gray-600">
                        Attempts: {attempts}/3
                    </span>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`
                        text-center p-3 rounded-lg mb-4
                        ${status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                        ${status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                        ${status === 'verifying' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                    `}>
                        {message}
                    </div>
                )}

                {/* Instructions */}
                <div className="text-xs text-gray-500 text-center">
                    <p>Click the symbols in this order:</p>
                    <p className="font-medium text-blue-600 mt-1">
                        🛡️ → ⚖️ → 🔑 → 📜 → 🏛️ → 🔐
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-center space-x-4">
                    <button
                        onClick={initializePuzzle}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Reset Puzzle
                    </button>
                </div>

                {/* Security Note */}
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center">
                        <Shield className="w-3 h-3 mr-1" />
                        This helps us prevent automated access
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RobotVerification;