# Barista Timer

A specialized coffee brewing timer application designed for baristas and coffee enthusiasts who want precision and consistency in their brewing process. This app provides detailed timing controls with customizable alerts for different coffee brewing methods.

## Features

### Recipe Library
- **Pre-configured Recipes**: Comes with standard coffee brewing recipes including:
  - V60 - Standard (225s)
  - V60 - Hario Official (180s)
  - Kalita Wave 155 (210s)
  - Chemex - 6 Cup (300s)
- **Custom Recipe Creation**: Create and save your own brewing recipes with multiple steps
- **Recipe Search**: Quickly find recipes using the search functionality
- **Edit/Delete Recipes**: Modify or remove custom recipes as needed

### Custom Recipe Creation (TimerRecipe)
- **Flexible Step Configuration**: Define multiple brewing steps with custom names and descriptions
- **Duration Control**: Set exact duration for each step in seconds
- **Alert Timing**: Configure alert notifications before step completion
- **Step Reordering**: Move steps up or down to adjust the brewing sequence
- **Real-time Summary**: View total brew time and alert schedules as you create

### Advanced Timer Display (TimerDisplay)
- **Visual Progress Tracking**: Clear progress bars showing overall and step-by-step progress
- **Multi-step Timers**: Navigate through complex brewing processes with step-by-step guidance
- **Intelligent Alerts**: Visual and audible warnings before important transitions
  - Different beep frequencies for different alert phases (urgent, medium, slow)
  - Visual pulsing alerts when approaching next step
  - Countdown display for precise timing awareness
- **Sound Controls**: Toggle audio alerts on/off with volume control options
- **Interactive Controls**:
  - Play/Pause functionality to pause brewing when needed
  - Reset option to restart the process
  - Skip to next step without completing current step
- **Detailed Step Information**: Real-time display of current step, time remaining, and upcoming steps
- **Completion Notification**: Special audio and visual cues when brewing is complete

### User Experience
- **Responsive Design**: Works well on different screen sizes
- **Dark Mode Interface**: Easy-to-read display with high contrast visuals
- **Coffee-focused UI**: Intuitive interface designed specifically for brewing workflows
- **Quick Access**: Easy navigation between recipe library and timer functions

## Tech Stack

Built with:
- React for component-based UI architecture
- Vite for fast development and builds
- Lucide React for intuitive iconography
- Web Audio API for high-quality alert sounds
- Modern CSS for responsive styling

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone or download the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the displayed address (typically http://localhost:5173)

## Usage

1. **Select or Create Recipe**:
   - Choose from the pre-configured recipes in the library
   - Or create a custom recipe using the "Create Brew Recipe" section

2. **Configure Alerts** (for custom recipes):
   - Set alert times for each brewing step
   - Alerts will notify you when it's time to prepare for the next step

3. **Start Brewing**:
   - Select your recipe and begin the timer
   - Follow the visual and audio cues

4. **Monitor Progress**:
   - Watch the progress bar and step indicators
   - Pay attention to alert notifications

5. **Complete Brew**:
   - Receive completion notification when brewing is finished

## Development

This project follows modern JavaScript development practices:

- ESLint for code quality
- React hooks for state management
- Component-based architecture
- Responsive CSS design

## Customization

### Adding New Recipes
Add new default recipes by modifying the defaultRecipes array in RecipeLibrary.jsx with the following structure:
```javascript
{
  id: 'unique-id',
  name: 'Recipe Name',
  type: 'Brew Method Type',
  totalTime: total_time_in_seconds,
  steps: [
    {
      id: unique_step_id,
      name: 'Step Name',
      duration: step_duration_in_seconds,
      alertAt: seconds_before_end_to_alert,
      description: 'What to do in this step'
    }
  ]
}
```

## Audio Features

The application uses Web Audio API to generate audible alerts:
- Different beep tones based on alert proximity
- Three-tier alert system (slow for early alerts, faster for imminent transitions)
- Completion chime sequence for finished brews
- Mute/unmute functionality for sound-sensitive environments

## Contributing

Feel free to fork this repository and submit pull requests for improvements. This project is designed to be community-driven with input from coffee professionals and enthusiasts alike.
