import React, { useState } from 'react';

const TimerRecipe = ({ onSaveRecipe, onStartTimer }) => {
    const [recipeName, setRecipeName] = useState('My V60 Recipe');
    const [steps, setSteps] = useState([
        { id: 1, name: 'Bloom', duration: 30, alertAt: 5, description: 'Pour 50g water in circles' },
        { id: 2, name: 'Second Pour', duration: 60, alertAt: 5, description: 'Pour to 150g total' },
        { id: 3, name: 'Third Pour', duration: 60, alertAt: 5, description: 'Pour to 250g total' },
        { id: 4, name: 'Final Pour', duration: 45, alertAt: 5, description: 'Pour to 300g total' },
        { id: 5, name: 'Drain', duration: 30, alertAt: 5, description: 'Let coffee drain completely' }
    ]);

    const addStep = () => {
        const newStep = {
            id: steps.length + 1,
            name: `Step ${steps.length + 1}`,
            duration: 30,
            alertAt: 5,
            description: 'Describe this step'
        };
        setSteps([...steps, newStep]);
    };

    const updateStep = (id, field, value) => {
        setSteps(steps.map(step =>
            step.id === id ? { ...step, [field]: value } : step
        ));
    };

    const removeStep = (id) => {
        setSteps(steps.filter(step => step.id !== id));
    };

    const moveStep = (id, direction) => {
        const index = steps.findIndex(step => step.id === id);
        if ((direction === 'up' && index > 0) || (direction === 'down' && index < steps.length - 1)) {
            const newSteps = [...steps];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;
            [newSteps[index], newSteps[swapIndex]] = [newSteps[swapIndex], newSteps[index]];
            setSteps(newSteps);
        }
    };

    const calculateTotalTime = () => {
        return steps.reduce((total, step) => total + step.duration, 0);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Brew Recipe</h2>

            {/* Recipe Name */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipe Name
                </label>
                <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., My Perfect V60"
                />
            </div>

            {/* Steps List */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-700">Brew Steps</h3>
                    <button
                        onClick={addStep}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                    >
                        + Add Step
                    </button>
                </div>

                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-sm text-gray-500 mr-2">#{index + 1}</span>
                                    <input
                                        type="text"
                                        value={step.name}
                                        onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                        className="text-lg font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => moveStep(step.id, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => moveStep(step.id, 'down')}
                                        disabled={index === steps.length - 1}
                                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        onClick={() => removeStep(step.id)}
                                        className="p-1 text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Duration (seconds)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="300"
                                        value={step.duration}
                                        onChange={(e) => updateStep(step.id, 'duration', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Alert Before (seconds)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={step.duration}
                                        value={step.alertAt}
                                        onChange={(e) => updateStep(step.id, 'alertAt', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={step.description}
                                        onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="What to do in this step"
                                    />
                                </div>
                            </div>

                            <div className="mt-3 text-sm text-gray-600">
                                Will beep {step.alertAt} seconds before step ends ({step.duration - step.alertAt}s into step)
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-lg font-medium text-gray-800">Total Brew Time</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {Math.floor(calculateTotalTime() / 60)}:{String(calculateTotalTime() % 60).padStart(2, '0')}
                        </div>
                        <div className="text-sm text-gray-600">
                            {steps.length} steps • {steps.filter(s => s.alertAt > 0).length} alert points
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Alerts at:</div>
                        <div className="text-gray-800 font-medium">
                            {steps.map((step, index) => {
                                const totalSeconds = steps.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
                                const alertTime = totalSeconds + step.duration - step.alertAt;
                                return `${Math.floor(alertTime / 60)}:${String(alertTime % 60).padStart(2, '0')}`;
                            }).join(', ')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => onSaveRecipe({ name: recipeName, steps })}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Save Recipe
                </button>
                <button
                    onClick={() => onStartTimer({ name: recipeName, steps })}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                    Start Brewing
                </button>
            </div>
        </div>
    );
};

export default TimerRecipe;