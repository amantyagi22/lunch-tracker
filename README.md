# Lunch Group Tracker

A simple web application for tracking lunch participants in a group setting.

## Features

- Track daily lunch responses (Yes/No)
- Set default responses for users
- Admin panel for managing lunch availability
- Cutoff time enforcement
- Late response handling
- Holiday/unavailability settings
- Daily memes for entertainment (configurable subreddit)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Copy `.env.example` to `.env.local` and update with your Firebase credentials
4. Run the development server
   ```
   npm run dev
   ```

## Environment Variables

### Required

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth Domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase Project ID
- Other Firebase configuration variables

### Optional

- `NEXT_PUBLIC_MEME_SUBREDDIT`: Reddit subreddit to fetch memes from (default: "wholesomememes")
  - Change this to any appropriate subreddit you prefer (e.g., "foodmemes", "programminghumor")

## Usage

### User Features

- Sign in with Google
- Respond "Yes" or "No" for daily lunch
- Set default responses
- View current day's status

### Admin Features

- Toggle lunch availability
- Set reason for unavailability
- Toggle late response acceptance
- View all user responses

## License

MIT
