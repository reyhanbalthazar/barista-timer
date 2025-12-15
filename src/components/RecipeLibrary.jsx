import React, { useState } from 'react';
import { Clock, Edit2, Trash2, Coffee } from 'lucide-react';

const RecipeLibrary = ({ recipes, onSelectRecipe, onDeleteRecipe, onEditRecipe }) => {
    const [search, setSearch] = useState('');

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(search.toLowerCase())
    );

    // Default recipes for baristas
    const defaultRecipes = [
        {
            id: 'v60-standard',
            name: 'V60 - Standard',
            type: 'Pour Over',
            totalTime: 225,
            steps: [
                { id: 1, name: 'Bloom', duration: 30, alertAt: 5, description: 'Pour 50g, gentle swirl' },
                { id: 2, name: 'Second Pour', duration: 60, alertAt: 5, description: 'Pour to 150g total' },
                { id: 3, name: 'Third Pour', duration: 60, alertAt: 5, description: 'Pour to 250g total' },
                { id: 4, name: 'Final Pour', duration: 45, alertAt: 5, description: 'Pour to 300g total' },
                { id: 5, name: 'Drain', duration: 30, alertAt: 5, description: 'Let drain completely' }
            ]
        },
        {
            id: 'v60-hario',
            name: 'V60 - Hario Official',
            type: 'Pour Over',
            totalTime: 180,
            steps: [
                { id: 1, name: 'Bloom', duration: 30, alertAt: 5, description: 'Pour 2x coffee weight' },
                { id: 2, name: 'Main Pour', duration: 90, alertAt: 5, description: 'Steady pour in circles' },
                { id: 3, name: 'Finish', duration: 60, alertAt: 5, description: 'Complete pour and drain' }
            ]
        },
        {
            id: 'kalita-wave',
            name: 'Kalita Wave 155',
            type: 'Pour Over',
            totalTime: 210,
            steps: [
                { id: 1, name: 'Bloom', duration: 30, alertAt: 5, description: 'Pour 50g, gentle stir' },
                { id: 2, name: 'Center Pour', duration: 45, alertAt: 5, description: 'Pour to center only' },
                { id: 3, name: 'Circle Pour', duration: 60, alertAt: 5, description: 'Pour in circles' },
                { id: 4, name: 'Final Pour', duration: 45, alertAt: 5, description: 'Slow center pour' },
                { id: 5, name: 'Drain', duration: 30, alertAt: 5, description: 'Wait for drawdown' }
            ]
        },
        {
            id: 'chemex',
            name: 'Chemex - 6 Cup',
            type: 'Pour Over',
            totalTime: 300,
            steps: [
                { id: 1, name: 'Bloom', duration: 45, alertAt: 5, description: 'Pour 100g, heavy bloom' },
                { id: 2, name: 'First Main', duration: 90, alertAt: 5, description: 'Pour to 400g total' },
                { id: 3, name: 'Second Main', duration: 90, alertAt: 5, description: 'Pour to 700g total' },
                { id: 4, name: 'Finish', duration: 75, alertAt: 5, description: 'Complete and drain' }
            ]
        }
    ];

    const allRecipes = [...filteredRecipes, ...defaultRecipes];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recipe Library</h2>
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search recipes..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Coffee className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allRecipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{recipe.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {recipe.type}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        {Math.floor(recipe.totalTime / 60)}:{String(recipe.totalTime % 60).padStart(2, '0')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {recipe.steps.length} steps
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEditRecipe(recipe)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {!recipe.id?.includes('default') && (
                                    <button
                                        onClick={() => onDeleteRecipe(recipe.id)}
                                        className="p-1 text-red-500 hover:text-red-700"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">Steps:</div>
                            <div className="text-xs text-gray-600 space-y-1">
                                {recipe.steps.map((step, index) => (
                                    <div key={step.id} className="flex justify-between">
                                        <span>{index + 1}. {step.name}</span>
                                        <span className="text-gray-500">
                                            {step.duration}s {step.alertAt > 0 && `(alert ${step.alertAt}s)`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => onSelectRecipe(recipe)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Use This Recipe
                        </button>
                    </div>
                ))}
            </div>

            {allRecipes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Coffee className="mx-auto mb-3 text-gray-300" size={48} />
                    <p>No recipes found</p>
                    <p className="text-sm mt-1">Create your first recipe above</p>
                </div>
            )}
        </div>
    );
};

export default RecipeLibrary;