# Cockpit-ATC Communication Simulator

A comprehensive flight training application designed to improve pilot communication skills and attention management through realistic ATC (Air Traffic Control) communication scenarios.

## 🚁 Overview

The Cockpit-ATC Communication Simulator is an interactive training platform that simulates real-world aviation communication scenarios. Pilots can practice responding to ATC commands, improve their radio communication skills, and enhance their situational awareness in a safe, controlled environment.

## ✨ Features

### 🎯 Core Training Features
- **Real-time ATC Communication Simulation**: Practice with authentic air traffic control commands
- **Voice Recognition**: Speech-to-text functionality for hands-free operation
- **Interactive Flight Displays**: Primary Flight Display (PFD) and Navigation Display (ND)
- **Command Categories**: Altitude, heading, speed, frequency, and clearance instructions
- **Performance Tracking**: Monitor accuracy, response time, and overall performance

### 🎮 User Experience
- **Intuitive Interface**: Clean, aviation-focused design with easy navigation
- **Session Management**: Start, pause, and resume training sessions
- **Progress Statistics**: Track improvement over time with detailed analytics
- **Cross-platform Support**: Works on iOS, Android, and web platforms

### 🔧 Technical Features
- **React Native & Expo**: Modern, cross-platform development framework
- **Real-time Audio Processing**: Advanced audio recording and transcription
- **State Management**: Efficient state handling with Zustand
- **TypeScript**: Full type safety and better development experience

## 🛠️ Technology Stack

- **Frontend**: React Native 0.79.1, Expo SDK 53
- **Language**: TypeScript 5.8.3
- **State Management**: Zustand 5.0.2
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Audio**: Expo AV, Expo Speech
- **Navigation**: Expo Router 5.0.3
- **Icons**: Expo Vector Icons
- **Data Management**: React Query (TanStack Query)

## 📱 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Bun package manager (recommended) or npm
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ATC_COMMUNICATION_TRAINING_PROJE_RORK
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   bun start
   # or
   npm start
   ```

4. **Run on your preferred platform**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal or use `bun start-web`

## 🎯 Usage Guide

### Starting a Training Session
1. Open the app and navigate to the main training screen
2. Tap "Start Training" to begin a new session
3. Listen for ATC commands through the audio interface
4. Respond verbally to the commands using the microphone

### Understanding Commands
- **Altitude Commands**: Instructions to change aircraft altitude
- **Heading Commands**: Directions to change aircraft heading
- **Speed Commands**: Instructions to adjust airspeed
- **Frequency Commands**: Radio frequency changes
- **Clearance Commands**: Takeoff, landing, and approach clearances

### Monitoring Performance
- View real-time statistics during training sessions
- Check session history and improvement trends
- Analyze response accuracy and timing

## 📊 Project Structure

```
ATC_COMMUNICATION_TRAINING_PROJE_RORK/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                  # Tab-based navigation
│   │   ├── index.tsx            # Main training screen
│   │   ├── settings.tsx         # App settings
│   │   └── stats.tsx            # Statistics and analytics
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   ├── PrimaryFlightDisplay.tsx # PFD component
│   └── NavigationDisplay.tsx    # ND component
├── hooks/                       # Custom React hooks
│   ├── useSettings.tsx          # Settings management
│   └── useTrainingSession.tsx   # Training session logic
├── types/                       # TypeScript type definitions
│   └── training.ts              # Training-related types
├── utils/                       # Utility functions
│   └── atcCommands.ts           # ATC command utilities
└── assets/                      # Images and static assets
```

## 🔧 Configuration

### Environment Variables
The app uses Rork for development tunneling. Update the following in `package.json`:
- `--p xpia5yw6wa61hoit7lfso` - Your Rork project ID

### App Configuration
Key settings can be modified in `app.json`:
- App name and slug
- Bundle identifiers
- Permissions
- Platform-specific configurations

## 🚀 Development

### Available Scripts
- `bun start` - Start development server with tunnel
- `bun start-web` - Start web development server
- `bun start-web-dev` - Start web server with debug logging
- `bun lint` - Run ESLint for code quality

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Maintain consistent naming conventions

## 📱 Platform Support

- **iOS**: Full support with native audio capabilities
- **Android**: Full support with adaptive icons
- **Web**: Responsive web interface with MediaRecorder API

## 🔒 Permissions

The app requires the following permissions:
- **Microphone Access**: For voice recording and speech recognition
- **Audio Background Modes**: For continuous audio processing (iOS)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For technical support or questions:
- Check the documentation
- Review existing issues
- Contact the development team

## 🔮 Future Enhancements

- **Multiplayer Mode**: Real-time pilot-ATC interaction
- **Advanced Scenarios**: Complex weather and emergency situations
- **AI Integration**: Intelligent ATC simulation
- **Performance Analytics**: Detailed performance insights
- **Custom Scenarios**: User-created training scenarios

---

**Built with ❤️ for the aviation community**

*Improve your pilot communication skills with realistic ATC training scenarios.*
