# Ionic Cross-Platform Application

A modern Ionic application that works seamlessly across web, mobile (Android/iOS), and desktop platforms with internationalization, theming, and authentication support.

## Features

- ✅ **Web Browser Support** - Runs in any modern web browser
- ✅ **Android Support** - Native Android app via Capacitor
- ✅ **iOS Support** - Native iOS app via Capacitor
- ✅ **Desktop Support** - Electron-based desktop application
- ✅ **Responsive Design** - Adapts to different screen sizes with mobile-first approach
- ✅ **Modern UI** - Built with Ionic Framework and Angular
- ✅ **Router-based Navigation** - Clean URL-based navigation system
- ✅ **Mobile Tab Navigation** - Bottom tab bar for mobile devices
- ✅ **Internationalization** - Multi-language support with ngx-translate
- ✅ **Dark/Light Theme** - Dynamic theme switching with system preference detection
- ✅ **Authentication System** - User authentication with profile management
- ✅ **Error Handling** - Comprehensive error handling with user-friendly messages
- ✅ **Loading States** - Consistent loading indicators across the app
- ✅ **Platform Detection** - Automatic platform detection and adaptation
- ✅ **Device Features Ready** - Camera, geolocation, notifications plugins installed
- ✅ **TypeScript** - Full TypeScript support for type safety

## Tech Stack

- **Frontend**: Angular 21, Ionic 8, TypeScript
- **Cross-Platform**: Capacitor 8
- **Desktop**: Electron
- **Styling**: SCSS with Ionic variables
- **Internationalization**: ngx-translate
- **Error Tracking**: Sentry
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
│   ├── core/                      # Core application functionality
│   │   ├── config/                # Configuration files
│   │   ├── guards/                # Route guards
│   │   ├── interceptors/          # HTTP interceptors
│   │   ├── interfaces/            # TypeScript interfaces
│   │   └── services/              # Core services (auth, theme, translation)
│   ├── pages/                     # Page components
│   │   ├── home/                  # Home page
│   │   └── about/                 # About page
│   ├── shared/                    # Shared components
│   │   ├── components/            # Reusable components
│   │   │   ├── app-header/        # Desktop/web header
│   │   │   ├── mobile-tabs/       # Mobile bottom navigation
│   │   │   └── language-popover/  # Language selection popover
│   │   └── pipes/                 # Custom pipes
│   ├── services/                  # Shared services
│   │   ├── platform.service.ts    # Platform detection service
│   │   ├── error-handler.service.ts # Error handling service
│   │   ├── loading.service.ts     # Loading state management
│   │   └── index.ts             # Service exports
│   ├── app.component.ts           # Root component
│   ├── app.config.ts              # Application configuration
│   └── app.routes.ts              # App routing
├── assets/                       # Static assets
│   └── i18n/                     # Internationalization files
├── environments/                 # Environment configurations
├── theme/                       # Ionic theme variables
├── global.scss                  # Global styles
├── index.html                   # Main HTML file
└── main.ts                     # Application entry point
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Watch and rebuild on changes
- `npm test` - Run unit tests
- `npm run android` - Build and open Android Studio
- `npm run ios` - Build and open Xcode
- `npm run electron` - Build and run desktop app
- `npx cap sync` - Sync web assets to native platforms
- `npx cap open [platform]` - Open platform-specific IDE
- `npx cap run [platform]` - Run on specific platform

## Key Features

### Navigation

- **Desktop/Web**: Top header navigation with clean routing
- **Mobile**: Bottom tab navigation with quick access to main features
- **Router-based**: Clean URLs with proper route guards

### User Experience

- **Internationalization**: Support for multiple languages with dynamic switching
- **Theming**: Dark/light mode toggle with system preference detection
- **Responsive**: Adaptive layout for different screen sizes
- **Authentication**: Complete auth system with login/logout and profile management

### Development Features

- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Centralized error handling with Sentry integration
- **Loading States**: Consistent loading indicators throughout the app
- **Platform Detection**: Automatic adaptation to different platforms

## Platform Support

| Platform | Status          | Notes                 |
| -------- | --------------- | --------------------- |
| Web      | ✅ Full Support | Modern browsers       |
| Android  | ✅ Full Support | Android 7+            |
| iOS      | ✅ Full Support | iOS 12+               |
| Desktop  | ✅ Full Support | Windows, macOS, Linux |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

# How to do Hot reload ?

1. npm run add-android
2. npm run android-sync
3. npm run android-hotreload

# Make sure avast or any other antivirus is not blocking the hot reload. (Laptop IP)
