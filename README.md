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
- Stores authentication tokens and username locally for persistent sessions

### Content Import Support
1. **Twitter Posts**
   - Automatically detects Twitter post URLs (`twitter.com/{username}/status/{id}`)
   - Shows an "i" badge when the post is already imported to Myriad
   - Imports posts with their content to Myriad

2. **Reddit Posts**
   - Detects Reddit post URLs (`reddit.com/r/{subreddit}/comments/{id}`)
   - Similar badge notification system as Twitter
   - Enables direct importing of Reddit content

3. **YouTube Integration**
   - Automatically converts YouTube URLs to embedded iframes
   - Supports custom captions
   - Full-width responsive video player integration

4. **Twitch Integration**
   - Converts Twitch channel URLs to embedded players
   - Automatically configures proper parent domain settings
   - Supports channel streaming embeds

### Text Selection Features
- Supports selecting and formatting text from any webpage
- Truncates selections to 1000 characters
- Removes empty lines automatically
- Formats text with italic styling

### UI Components
- Clean, responsive popup interface
- Purple gradient buttons with hover effects
- User feedback system for actions
- Conditional display of import/post options based on current URL
- Embedded post preview iframe for existing content

## Technical Components

- `background.js`: Monitors tab URLs and manages badge notifications
- `contentScript.js`: Handles text selection and formatting
- `popup.js`: Controls the extension's UI, authentication, and API interactions
- Custom styling with Mulish font family
- Secure API integration with Myriad.social endpoints

## API Integration
- Base URL: `https://api.myriad.social`
- Endpoints used:
  - `/authentication/otp/email` - Magic link generation
  - `/authentication/login/otp` - Authentication
  - `/user/posts/import` - Content importing
  - `/user/posts` - Post creation and retrieval
