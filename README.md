# Order Management App

A React Native/Expo app for managing products and orders with offline capabilities.

## Features

- 📱 Cross-platform support (Android, iOS, Web)
- 💾 Offline data storage using AsyncStorage
- 🌙 Dark/Light theme support
- 📊 Dashboard with key metrics
  - Total orders and products
  - Revenue tracking
  - Pending orders count
  - Top selling products

### Product Management
- Add, edit, and delete products
- Track product name and price
- Centralized product listing

### Order Management
- Create and manage customer orders
- Select products from inventory
- Track order status (Paid/Pending)
- Mark orders as complete
- View order history
- Calculate total prices automatically

### Data Management
- Export data as JSON file
- Import data from JSON file or text
- Reset data options (Products/Orders/All)
- Data persistence across app restarts

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd raja1
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

### Building for Android

1. Install EAS CLI globally
   ```bash
   npm install -g eas-cli
   ```

2. Login to your Expo account
   ```bash
   eas login
   ```

3. Build APK for testing
   ```bash
   npx eas build -p android --profile preview
   ```

## Development

### Project Structure
- `/app` - Main application code
  - `/(tabs)` - Tab-based navigation screens
    - `index.tsx` - Dashboard screen
    - `products.tsx` - Products management
    - `orders.tsx` - Orders management
    - `settings.tsx` - App settings and data management
- `/components` - Reusable UI components
- `/utils` - Utility functions and type definitions
- `/assets` - Images and fonts

### Running in Development

- Android: Press 'a' in terminal or use Android emulator
- iOS: Press 'i' in terminal (requires macOS)
- Web: Press 'w' in terminal

### Testing on Physical Device

1. Install Expo Go app on your device
2. Scan the QR code shown in terminal
3. The app will load on your device

## Data Management

### Exporting Data
1. Go to Settings tab
2. Tap "Export Data"
3. Choose where to save the JSON file

### Importing Data
1. Go to Settings tab
2. Choose "Import from File" or paste JSON in the text area
3. Confirm import

### Resetting Data
1. Go to Settings tab
2. Choose reset option (Products/Orders/All)
3. Confirm reset action

## Building for Production

### Android APK
```bash
npx eas build -p android --profile preview
```

### Android App Bundle (Play Store)
```bash
npx eas build -p android
```

## Technologies Used

- React Native
- Expo
- React Navigation
- React Native Paper
- AsyncStorage
- TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
