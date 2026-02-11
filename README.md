# Ionic Cross-Platform Application

A modern Ionic application that works seamlessly across web, mobile (Android/iOS), and desktop platforms.

## Features

- ✅ **Web Browser Support** - Runs in any modern web browser
- ✅ **Android Support** - Native Android app via Capacitor
- ✅ **iOS Support** - Native iOS app via Capacitor  
- ✅ **Desktop Support** - Electron-based desktop application
- ✅ **Responsive Design** - Adapts to different screen sizes
- ✅ **Modern UI** - Built with Ionic Framework and Angular
- ✅ **Tab Navigation** - Mobile-first navigation system
- ✅ **Form Validation** - Real-time form validation with error messages
- ✅ **Error Handling** - Comprehensive error handling with user-friendly messages
- ✅ **Loading States** - Consistent loading indicators across the app
- ✅ **Platform Detection** - Automatic platform detection and adaptation
- ✅ **Device Features** - Camera, geolocation, notifications support
- ✅ **TypeScript** - Full TypeScript support for type safety

## Tech Stack

- **Frontend**: Angular 21, Ionic 8, TypeScript
- **Cross-Platform**: Capacitor 8
- **Desktop**: Electron
- **Styling**: SCSS with Ionic variables
- **Build Tool**: Angular CLI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- For mobile development: Android Studio / Xcode
- For desktop development: Electron (included)

### Installation

```bash
# Clone the repository
git clone https://github.com/Praveen16-V/ionic-boilerplate.git
cd ionic-boilerplate

# Install dependencies
npm install
```

### Development

```bash
# Start web development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch for changes and rebuild
npm run watch
```

### Platform-Specific Development

#### Web
```bash
npm start
# Opens at http://localhost:4200
```

#### Android
```bash
# Build the web app first
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### iOS
```bash
# Build the web app first
npm run build

# Sync with iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

#### Desktop (Electron)
```bash
# Build the web app first
npm run build

# Sync with Electron project
npx cap sync electron

# Run desktop app
npx cap run electron
```

## Project Structure

```
src/
├── app/                           # Angular application
│   ├── home/                     # Home page module
│   ├── about/                    # About page module
│   ├── contact/                  # Contact page with form validation
│   ├── settings/                 # Settings page
│   ├── tabs/                     # Tab navigation system
│   ├── services/                 # Shared services
│   │   ├── platform.service.ts    # Platform detection service
│   │   ├── error-handler.service.ts # Error handling service
│   │   ├── loading.service.ts     # Loading state management
│   │   └── index.ts             # Service exports
│   ├── app.module.ts             # Root module
│   ├── app.component.ts           # Root component
│   └── app-routing.module.ts     # App routing
├── assets/                       # Static assets
├── environments/                 # Environment configurations
├── theme/                       # Ionic theme variables
├── global.scss                  # Global styles
├── index.html                   # Main HTML file
├── main.ts                     # Application entry point
└── polyfills.ts                # Browser polyfills
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Watch and rebuild on changes
- `npm test` - Run unit tests
- `npx cap sync` - Sync web assets to native platforms
- `npx cap open [platform]` - Open platform-specific IDE
- `npx cap run [platform]` - Run on specific platform

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Web | ✅ Full Support | Modern browsers |
| Android | ✅ Full Support | Android 7+ |
| iOS | ✅ Full Support | iOS 12+ |
| Desktop | ✅ Full Support | Windows, macOS, Linux |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details.
