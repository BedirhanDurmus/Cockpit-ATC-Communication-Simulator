# 🛩️ Cursor Rules for ATC Communication Training Simulator

## Project Overview
- **Project**: Professional ATC Communication Training Simulator
- **Tech Stack**: Expo (React Native), TypeScript, NativeWind, Zustand, React Query
- **Design Theme**: Professional aviation interface with modern cockpit aesthetics
- **Target**: Aviation professionals, flight students, and ATC training

## Design System & Colors

### Primary Color Palette
- **Primary Blue**: #1E3A8A (Professional Aviation Blue)
- **Secondary Blue**: #3B82F6 (Interactive Blue)
- **Accent Green**: #10B981 (Success/Go Green)
- **Warning Orange**: #F59E0B (Caution/Warning)
- **Error Red**: #EF4444 (Error/Stop Red)
- **Dark Background**: #0F172A (Deep Aviation Blue)
- **Card Background**: #1E293B (Card Blue)
- **Text Primary**: #F8FAFC (White)
- **Text Secondary**: #CBD5E1 (Light Gray)
- **Border**: #334155 (Medium Gray)

### Design Principles
- Use aviation-standard color schemes (blue, green, amber, red)
- Implement professional cockpit aesthetics
- Maintain high contrast for readability in various lighting conditions
- Use rounded corners (8-12px) for modern aviation look
- Implement smooth animations for realistic flight instrument behavior

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces for all aviation data structures
- Use type guards for flight data validation
- Prefer `const` over `let`, avoid `var`
- Use proper aviation terminology in type names

### React Native / Expo
- Use functional components with hooks
- Implement proper error boundaries for flight safety
- Use React.memo for performance-critical flight displays
- Follow React Native best practices for mobile aviation apps

### State Management
- Use Zustand for global aviation state
- Use TanStack Query for server state (future API integration)
- Implement proper loading and error states for flight operations
- Use optimistic updates for immediate pilot feedback

### Styling
- Use NativeWind (Tailwind CSS for React Native)
- Create reusable aviation component classes
- Implement responsive design for various cockpit sizes
- Use consistent spacing scale (4px, 8px, 16px, 24px, 32px)


## Component Guidelines

### Aviation Components
- Implement realistic flight instrument displays
- Use proper aviation symbology and colors
- Include smooth animations for realistic instrument behavior
- Implement proper error states for flight safety

### Training Interface
- Design intuitive pilot training workflows
- Use aviation-standard terminology
- Include proper feedback mechanisms
- Implement realistic ATC communication scenarios

### Flight Displays
- Create professional PFD and ND components
- Use SVG for precise aviation graphics
- Implement smooth real-time updates
- Include proper scaling for different screen sizes

## Aviation-Specific Standards

### Flight Data
- Use proper aviation units (feet, knots, degrees)
- Implement realistic flight envelope limits
- Use aviation-standard coordinate systems
- Include proper altitude and speed restrictions

### ATC Communication
- Use standard aviation phraseology
- Implement proper command validation
- Include realistic response expectations
- Use aviation-standard abbreviations

### Safety Features
- Implement proper error handling for flight operations
- Include validation for flight parameters
- Use aviation-standard warning systems
- Implement proper timeout mechanisms

## Performance Guidelines
- Optimize flight display rendering (target 60 FPS)
- Implement proper audio processing
- Use efficient state updates for real-time data
- Optimize SVG rendering for flight instruments

## Testing Strategy
- Test flight instrument accuracy
- Validate ATC command processing
- Test audio recording and playback
- Verify cross-platform compatibility

## Documentation
- Document all aviation-specific functions
- Include JSDoc comments for complex calculations
- Maintain aviation terminology glossary
- Document flight envelope limitations

## Git Workflow
- Use conventional commit messages with aviation prefixes
- Create feature branches for new training scenarios
- Implement proper PR reviews for safety-critical code
- Use semantic versioning for releases

## Deployment
- Use Expo EAS Build for production builds
- Implement proper environment configuration
- Test on multiple aviation device types
- Implement proper monitoring for training sessions

## Accessibility
- Implement proper screen reader support for pilots
- Use semantic aviation elements
- Maintain proper color contrast for cockpit conditions
- Include proper focus indicators for touch interfaces

## Error Handling
- Implement global error boundary for flight safety
- Use proper error logging for training analysis
- Provide pilot-friendly error messages
- Implement retry mechanisms for critical operations

## Monitoring & Analytics
- Track training session performance
- Monitor ATC command accuracy
- Analyze pilot response patterns
- Track training progression metrics

## Code Quality
- Use ESLint and Prettier
- Implement proper TypeScript strict mode
- Use consistent aviation naming conventions
- Implement proper code documentation

## Mobile-Specific Considerations
- Implement proper keyboard handling for pilot input
- Use safe area insets for cockpit displays
- Implement proper touch targets (44px minimum)
- Test on multiple aviation device sizes
- Handle orientation changes properly

## Aviation Design Elements
- Use professional cockpit aesthetics
- Implement realistic flight instrument behavior
- Use aviation-standard colors and symbology
- Maintain consistent visual hierarchy
- Implement proper loading states for flight operations
- Use premium aviation typography and spacing

## Training-Specific Features
- Implement realistic ATC communication scenarios
- Use proper aviation phraseology
- Include comprehensive command libraries
- Implement proper scoring and feedback systems
- Support multiple difficulty levels
- Include progress tracking and analytics

Remember: This is a professional aviation training application. Prioritize safety, accuracy, and realistic aviation experience while maintaining high code quality and performance standards.
