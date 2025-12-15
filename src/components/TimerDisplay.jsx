import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, AlertCircle } from 'lucide-react';

const TimerDisplay = ({ recipe, onReset }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [alertTriggered, setAlertTriggered] = useState({});
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [alertActive, setAlertActive] = useState(false);

    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const beepIntervalRef = useRef(null);
    const lastAlertTimeRef = useRef(0);

    // Calculate total time
    const totalTime = useCallback(() => {
        return recipe.steps.reduce((sum, step) => sum + step.duration, 0);
    }, [recipe.steps]);

    // Get current step info
    const getStepInfo = useCallback((stepIndex) => {
        if (!recipe.steps[stepIndex]) return null;

        const step = recipe.steps[stepIndex];
        const stepStartTime = recipe.steps
            .slice(0, stepIndex)
            .reduce((sum, s) => sum + s.duration, 0);

        const timeInThisStep = time - stepStartTime;
        const timeRemainingInStep = step.duration - timeInThisStep;
        const inAlertZone = timeRemainingInStep <= step.alertAt && timeRemainingInStep > 0;
        const alertSecondsLeft = timeRemainingInStep;

        return {
            step,
            stepStartTime,
            timeInThisStep,
            timeRemainingInStep,
            inAlertZone,
            alertSecondsLeft
        };
    }, [time, recipe.steps]);

    // Initialize audio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.log('Audio not supported');
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
        };
    }, []);

    // Create beep sound - LOUDER VERSION
    const playBeep = useCallback((frequency = 800, duration = 0.1) => {
        if (!soundEnabled || !audioContextRef.current) return;

        try {
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            const oscillator = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            // LOUDER: Increased from 0.1 to 0.3
            gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);

            oscillator.start();
            oscillator.stop(audioContextRef.current.currentTime + duration);

        } catch (error) {
            console.log('Could not play sound');
        }
    }, [soundEnabled]);

    // Create countdown beep pattern
    const playCountdownBeep = useCallback((secondsLeft) => {
        if (!soundEnabled || !audioContextRef.current) return;

        const now = Date.now();
        // Prevent multiple beeps in same second
        if (now - lastAlertTimeRef.current < 900) return;
        lastAlertTimeRef.current = now;

        if (secondsLeft <= 3) {
            // Fast, urgent beeps for last 3 seconds
            playBeep(1000, 0.05);
        } else if (secondsLeft <= 5) {
            // Medium pace for last 5 seconds
            playBeep(900, 0.08);
        } else {
            // Slower beeps for earlier alert zone
            playBeep(800, 0.1);
        }
    }, [soundEnabled, playBeep]);

    // Handle alert zone
    useEffect(() => {
        const stepInfo = getStepInfo(currentStepIndex);

        if (!stepInfo || !stepInfo.inAlertZone) {
            setAlertActive(false);
            if (beepIntervalRef.current) {
                clearInterval(beepIntervalRef.current);
                beepIntervalRef.current = null;
            }
            return;
        }

        const secondsLeft = stepInfo.alertSecondsLeft;

        // Set alert active
        if (!alertActive) {
            setAlertActive(true);
            // Initial beep when entering alert zone
            playCountdownBeep(secondsLeft);
        }

        // Start repeating beeps
        if (!beepIntervalRef.current) {
            beepIntervalRef.current = setInterval(() => {
                const currentStepInfo = getStepInfo(currentStepIndex);
                if (currentStepInfo && currentStepInfo.inAlertZone) {
                    playCountdownBeep(currentStepInfo.alertSecondsLeft);
                }
            }, 1000); // Beep every second
        }

    }, [time, currentStepIndex, getStepInfo, alertActive, playCountdownBeep]);

    // Update current step
    useEffect(() => {
        let elapsed = 0;
        let foundStep = false;

        for (let i = 0; i < recipe.steps.length; i++) {
            const stepEnd = elapsed + recipe.steps[i].duration;

            if (time >= elapsed && time < stepEnd) {
                if (i !== currentStepIndex) {
                    setCurrentStepIndex(i);
                    setAlertTriggered(prev => ({ ...prev, [i]: false }));
                    setAlertActive(false);
                    if (beepIntervalRef.current) {
                        clearInterval(beepIntervalRef.current);
                        beepIntervalRef.current = null;
                    }
                }
                foundStep = true;
                break;
            }
            elapsed = stepEnd;
        }

        // Timer complete
        if (!foundStep && time >= totalTime() && time > 0) {
            setIsComplete(true);
            setIsRunning(false);
            setAlertActive(false);
            clearInterval(timerRef.current);
            if (beepIntervalRef.current) {
                clearInterval(beepIntervalRef.current);
                beepIntervalRef.current = null;
            }
            // Final completion beep (different pattern)
            if (soundEnabled) {
                playBeep(600, 0.2);
                setTimeout(() => playBeep(800, 0.2), 300);
                setTimeout(() => playBeep(1000, 0.2), 600);
            }
        }
    }, [time, recipe.steps, currentStepIndex, totalTime, soundEnabled, playBeep]);

    // Timer controls
    const toggleTimer = () => {
        if (isComplete) {
            resetTimer();
            return;
        }

        if (isRunning) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (beepIntervalRef.current) {
                clearInterval(beepIntervalRef.current);
                beepIntervalRef.current = null;
            }
        } else {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setTime(prev => {
                    if (prev >= totalTime()) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        setIsComplete(true);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        if (beepIntervalRef.current) {
            clearInterval(beepIntervalRef.current);
            beepIntervalRef.current = null;
        }
        setTime(0);
        setIsRunning(false);
        setCurrentStepIndex(0);
        setAlertTriggered({});
        setIsComplete(false);
        setAlertActive(false);
        lastAlertTimeRef.current = 0;
    };

    const skipToNextStep = () => {
        const stepInfo = getStepInfo(currentStepIndex);
        if (stepInfo && currentStepIndex < recipe.steps.length - 1) {
            const timeToSkip = stepInfo.step.duration - stepInfo.timeInThisStep;
            setTime(prev => prev + timeToSkip);
            setAlertTriggered(prev => ({ ...prev, [currentStepIndex + 1]: false }));
        }
    };

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentStepInfo = getStepInfo(currentStepIndex);
    const totalSeconds = totalTime();

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">{recipe.name}</h2>
                        <p className="text-gray-400">
                            {isComplete ? 'Complete!' : `Step ${currentStepIndex + 1} of ${recipe.steps.length}`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 rounded-lg ${soundEnabled ? 'bg-green-900 hover:bg-green-800' : 'bg-red-900 hover:bg-red-800'}`}
                            title={soundEnabled ? "Sound On" : "Sound Off"}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                        <div className={`p-2 rounded-lg ${alertActive ? 'bg-yellow-900 animate-pulse' : 'bg-gray-800'}`}>
                            <AlertCircle size={20} className={alertActive ? 'text-yellow-300' : 'text-gray-400'} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Timer Display */}
            <div className="p-8 text-center">
                {/* Alert Banner */}
                {alertActive && currentStepInfo && (
                    <div className="mb-6 p-4 bg-yellow-900 bg-opacity-50 border-2 border-yellow-600 rounded-lg animate-pulse">
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-4 w-4 bg-yellow-400 rounded-full animate-ping"></div>
                            <div className="text-xl font-bold text-yellow-300">
                                ALERT: {currentStepInfo.alertSecondsLeft} SECONDS LEFT
                            </div>
                            <div className="h-4 w-4 bg-yellow-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="text-yellow-200 mt-2">
                            Prepare for next step: {recipe.steps[Math.min(currentStepIndex + 1, recipe.steps.length - 1)]?.name}
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <div className={`text-5xl md:text-7xl font-bold font-mono mb-2 ${isComplete ? 'text-green-400' : alertActive ? 'text-yellow-300' : ''}`}>
                        {formatTime(time)}
                    </div>
                    <div className="text-gray-400">
                        {isComplete ? 'Brew Complete!' : `/ ${formatTime(totalSeconds)}`}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : alertActive ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((time / totalSeconds) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>Start</span>
                        <span>Complete</span>
                    </div>
                </div>

                {/* Current Step Info or Completion */}
                {isComplete ? (
                    <div className="mb-8 p-6 bg-green-900 bg-opacity-30 border-2 border-green-600 rounded-lg">
                        <div className="text-2xl font-bold text-green-300 mb-2">🎉 Brew Complete!</div>
                        <div className="text-gray-300">
                            Your {recipe.name} is ready to enjoy
                        </div>
                        <button
                            onClick={resetTimer}
                            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                        >
                            Start New Brew
                        </button>
                    </div>
                ) : currentStepInfo && (
                    <>
                        <div className="mb-8">
                            <div className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                                {currentStepInfo.step.name}
                                {alertActive && (
                                    <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                )}
                            </div>
                            <div className="text-gray-300 mb-2">
                                {currentStepInfo.step.description}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <div className="text-sm text-gray-400">Step Time</div>
                                    <div className="text-xl font-bold">
                                        {formatTime(currentStepInfo.timeInThisStep)}
                                    </div>
                                </div>
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <div className="text-sm text-gray-400">Step Remaining</div>
                                    <div className={`text-xl font-bold ${alertActive ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
                                        {formatTime(currentStepInfo.timeRemainingInStep)}
                                    </div>
                                </div>
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <div className="text-sm text-gray-400">Alert Zone</div>
                                    <div className="text-xl font-bold">
                                        {currentStepInfo.step.alertAt > 0
                                            ? `Last ${currentStepInfo.step.alertAt}s`
                                            : 'Off'
                                        }
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${alertActive ? 'bg-yellow-900' : 'bg-gray-800'}`}>
                                    <div className="text-sm text-gray-400">Alert Status</div>
                                    <div className={`text-xl font-bold ${alertActive ? 'text-yellow-300' : 'text-gray-400'}`}>
                                        {alertActive ? `ACTIVE (${currentStepInfo.alertSecondsLeft}s)` : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            {/* Countdown Display */}
                            {alertActive && (
                                <div className="mt-6">
                                    <div className="text-lg font-medium text-yellow-300 mb-2">
                                        Countdown to Next Step:
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        {[...Array(currentStepInfo.step.alertAt).keys()].reverse().map((second) => (
                                            <div
                                                key={second}
                                                className={`w-12 h-12 flex items-center justify-center rounded-lg text-lg font-bold ${currentStepInfo.alertSecondsLeft > second
                                                        ? 'bg-gray-800 text-gray-400'
                                                        : 'bg-yellow-600 text-yellow-100'
                                                    }`}
                                            >
                                                {second + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Control Buttons */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={toggleTimer}
                                className={`p-4 rounded-full ${isRunning
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    } transition-colors`}
                            >
                                {isRunning ? <Pause size={24} /> : <Play size={24} />}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                            >
                                <RotateCcw size={24} />
                            </button>
                            <button
                                onClick={skipToNextStep}
                                disabled={currentStepIndex >= recipe.steps.length - 1}
                                className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors"
                            >
                                <SkipForward size={24} />
                            </button>
                        </div>

                        {/* Steps Progress */}
                        <div className="mt-8">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span>Steps Progress</span>
                                <span>{currentStepIndex + 1}/{recipe.steps.length}</span>
                            </div>
                            <div className="flex overflow-x-auto pb-2">
                                {recipe.steps.map((step, index) => {
                                    const isCurrent = index === currentStepIndex;
                                    const isPast = index < currentStepIndex;

                                    return (
                                        <div
                                            key={step.id}
                                            className={`flex flex-col items-center min-w-[100px] p-3 rounded-lg mx-1 ${isCurrent
                                                    ? alertActive
                                                        ? 'border-2 border-yellow-500 bg-yellow-900'
                                                        : 'border border-blue-700 bg-blue-900'
                                                    : isPast
                                                        ? 'border border-green-700 bg-green-900'
                                                        : 'border border-gray-700 bg-gray-800'
                                                }`}
                                        >
                                            <div className={`text-sm font-medium ${isCurrent
                                                    ? alertActive ? 'text-yellow-300' : 'text-blue-300'
                                                    : isPast
                                                        ? 'text-green-300'
                                                        : 'text-gray-400'
                                                }`}>
                                                {step.name}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {step.duration}s
                                            </div>
                                            {step.alertAt > 0 && (
                                                <div className="text-xs text-yellow-400 mt-1">
                                                    Alert: {step.alertAt}s
                                                </div>
                                            )}
                                            {isCurrent && (
                                                <div className={`h-2 w-2 rounded-full mt-2 animate-pulse ${alertActive ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Next Step Preview (if not complete) */}
                {!isComplete && currentStepIndex < recipe.steps.length - 1 && (
                    <div className={`p-6 border-t ${alertActive ? 'border-yellow-700 bg-yellow-900 bg-opacity-20' : 'border-gray-700 bg-gray-800 bg-opacity-50'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-400">Next Up</div>
                                <div className="font-medium">
                                    {recipe.steps[currentStepIndex + 1].name}
                                </div>
                                <div className="text-sm text-gray-300">
                                    {recipe.steps[currentStepIndex + 1].description}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-400">Starts In</div>
                                <div className="text-2xl font-bold">
                                    {currentStepInfo ?
                                        formatTime(currentStepInfo.step.duration - currentStepInfo.timeInThisStep) :
                                        '0:00'
                                    }
                                </div>
                                {alertActive && (
                                    <div className="text-xs text-yellow-400 mt-1">
                                        Get ready!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sound Test Button */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
                <div className="text-center">
                    <button
                        onClick={() => {
                            playBeep(800, 0.2);
                            setTimeout(() => playBeep(1000, 0.2), 300);
                        }}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-sm"
                    >
                        🔊 Test Alert Sound
                    </button>
                    <div className="text-xs text-gray-500 mt-2">
                        {soundEnabled ? 'Sound is ENABLED' : 'Sound is DISABLED'} • Volume: LOUD
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimerDisplay;