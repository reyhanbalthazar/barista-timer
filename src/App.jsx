import React, { useState, useEffect } from 'react';
import TimerRecipe from './components/TimerRecipe';
import TimerDisplay from './components/TimerDisplay';
import RecipeLibrary from './components/RecipeLibrary';
import { Timer, BookOpen, Coffee } from 'lucide-react';
import './index.css';

const App = () => {
  const [view, setView] = useState('library'); // 'library', 'create', 'timer'
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Load saved recipes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('baristaTimer_recipes');
    if (saved) {
      try {
        setSavedRecipes(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recipes:', error);
      }
    }
  }, []);

  // Save recipes to localStorage
  useEffect(() => {
    localStorage.setItem('baristaTimer_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const handleSaveRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setSavedRecipes([...savedRecipes, newRecipe]);
    setView('library');
  };

  const handleStartTimer = (recipe) => {
    setCurrentRecipe(recipe);
    setView('timer');
  };

  const handleDeleteRecipe = (recipeId) => {
    setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
  };

  const handleEditRecipe = (recipe) => {
    setCurrentRecipe(recipe);
    setView('create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Coffee className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Barista Timer</h1>
                <p className="text-sm text-gray-600">Never miss a pour again</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setView('library')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${view === 'library'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <BookOpen size={18} />
                Recipes
              </button>
              <button
                onClick={() => setView('create')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${view === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Coffee size={18} />
                Create
              </button>
              {currentRecipe && (
                <button
                  onClick={() => setView('timer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${view === 'timer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Timer size={18} />
                  Timer
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'library' && (
          <RecipeLibrary
            recipes={savedRecipes}
            onSelectRecipe={handleStartTimer}
            onDeleteRecipe={handleDeleteRecipe}
            onEditRecipe={handleEditRecipe}
          />
        )}

        {view === 'create' && (
          <TimerRecipe
            onSaveRecipe={handleSaveRecipe}
            onStartTimer={handleStartTimer}
          />
        )}

        {view === 'timer' && currentRecipe && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Brew Timer</h2>
              <button
                onClick={() => setView('library')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
              >
                Back to Recipes
              </button>
            </div>
            <TimerDisplay
              recipe={currentRecipe}
              onReset={() => setView('library')}
            />
          </>
        )}

        {/* Quick Tips */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Barista Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800 mb-1">Alert Timing</div>
              <div className="text-sm text-blue-700">
                Set alerts 5-10 seconds before step ends. This gives you time to prepare for the next pour.
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800 mb-1">Bloom Phase</div>
              <div className="text-sm text-green-700">
                Most recipes start with a 30-second bloom. This allows coffee to degas and prepare for extraction.
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="font-medium text-amber-800 mb-1">Step Duration</div>
              <div className="text-sm text-amber-700">
                Each pour phase is typically 30-60 seconds. Adjust based on your grind size and coffee freshness.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t pt-8 pb-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>☕ Barista Timer v1.0 • Built for precision brewing</p>
          <p className="mt-1">No account needed • All data stored locally • Works offline</p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <span>Perfect for: V60 • Kalita Wave • Chemex • Other pour overs</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;