# Myriad Importer Extension

A browser extension that enables seamless content importing and cross-posting from various social media platforms to Myriad.social.

## Official Links
This extension is LIVE at:
- https://myriad.social/extension
- https://chrome.google.com/webstore/detail/myriad-extension/caafifipbilmonkndcpppfehkhappcci

## Technical Overview

The extension provides several key functionalities:

### Authentication
- Uses a magic link authentication system via email
- Authenticates through the Myriad.social API (`api.myriad.social/authentication`)
- Stores authentication tokens and username in local storage for persistent sessions
- Includes logout functionality with confirmation dialog

### Content Import Support
1. **Twitter Posts**
   - Automatically detects Twitter post URLs
   - Imports posts directly to selected Myriad Experience
   - Shows preview of imported posts in embedded iframe

2. **Reddit Posts**
   - Detects Reddit post URLs
   - Direct importing to selected Myriad Experience
   - Shows preview of imported posts in embedded iframe

3. **YouTube Integration**
   - Automatically converts YouTube URLs to embedded iframes
   - Supports optional captions
   - Full-width responsive video player integration

4. **Twitch Integration**
   - Converts Twitch channel URLs to embedded players
   - Automatically configures proper parent domain settings
   - Supports channel streaming embeds

5. **Facebook Integration**
   - Supports embedding of Facebook posts and videos
   - Automatic conversion of mobile/web URLs to proper embed format
   - Responsive iframe implementation

### Experience Management
- Automatic creation of default Experience if none exists
- Experience selector with refresh capability
- Stores selected Experience as default in local storage
- Direct links to selected Experience page

### UI Components
- Clean, responsive popup interface
- Purple gradient buttons with hover effects
- Loading spinner for async operations
- User feedback system with timed messages
- Conditional display of import/post options based on current URL
- Embedded post preview iframe for existing content
- Logout confirmation dialog

## Technical Components

- `background.js`: Manages Experience data and background tasks
- `contentScript.js`: Handles text grabbing from pages
- `popup.js`: Controls the extension's UI, authentication, and API interactions
- Custom styling with Mulish font family
- Secure API integration with Myriad.social endpoints

## API Integration
- Base URL: `https://api.myriad.social`
- Key endpoints:
  - `/authentication/otp/email` - Magic link generation
  - `/authentication/login/otp` - Authentication
  - `/user/posts/import` - Content importing
  - `/user/experiences` - Experience management
  - `/experiences/post` - Adding posts to experiences

## Building and Packaging

### Development Build
To test the extension locally:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your extension directory

### Production Build
To package the extension for the Chrome Web Store:

1. Clean the build directory:
```bash
rm -rf build/
mkdir -p build
```

2. Create the distribution package:
```bash
zip -r build/extension_store.zip \
  manifest.json \
  popup.html \
  popup.js \
  background.js \
  contentScript.js \
  myriadlogo16.png \
  myriadlogo48.png \
  myriadlogo128.png
```

3. Create the Chrome extension package (optional):
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Pack extension"
- Select your extension directory
- Click "Pack Extension"
- Move the generated files:
```bash
mv extension.crx build/extension_store.crx
mv extension.pem build/extension.pem
```

The `build/extension_store.zip` file can be submitted to the Chrome Web Store for publication.
