# Lunch Tracker

A simple web application for tracking lunch preferences in an office setting.

## Features

- **Google OAuth Authentication**: One-click sign in
- **Simple User Interface**: Easily respond "Yes" or "No" to daily lunch
- **Default Preferences**: Set your common lunch preference to minimize daily input
- **Admin Panel**: For the office manager to track attendance and manage lunch availability
- **Mobile-Friendly**: Works well on all devices

## Tech Stack

- **Frontend**: React.js with Next.js, Tailwind CSS
- **Backend**: Firebase (Authentication & Firestore Database)
- **Hosting**: Vercel (recommended)

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd lunch-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a Firebase project**

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Set up Authentication with Google provider
- Create a Firestore database

4. **Configure environment variables**

Create a `.env.local` file in the project root with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000) with your browser**

## Setting Admin Privileges

By default, all users are created with `isAdmin: false`. To make a user an admin (Jakir):

1. Sign in as the user you want to make an admin
2. Go to Firebase Console > Firestore Database
3. Find the user document in the "users" collection
4. Update the `isAdmin` field to `true`

## Deployment

The easiest way to deploy this application is using Vercel:

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Configure the environment variables
4. Deploy

## License

MIT
