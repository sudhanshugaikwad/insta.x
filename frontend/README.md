# insta.X

<div align="center">
  <img src="./public/insta02.png" alt="insta.X logo" width="200" />
</div>

## Project Information

insta.X is a modern Instagram-style social media web application built with React, Node.js, Express, and MongoDB. It includes a polished social feed, user discovery, posts, follow system, messaging, notifications, responsive layouts, and an admin dashboard.

**Developer:** Sudhanshu Gaikwad  
**Portfolio:** [Sudhanshu Gaikwad](https://sudhanshugaikwad.netlify.app/)  
**Live preview:** [insta.x](https://instagramwebapp.onrender.com)

---

## Overview

insta.X brings together the core social media experience in one responsive app:

- User sign up and sign in with JWT authentication
- Beautiful welcome/landing page for new visitors
- Feed with posts, likes, comments, and engagement
- Explore and suggested users section
- User profiles and follow/unfollow functionality
- Real notifications and messaging system
- Admin login and dashboard for user management
- Fully responsive design for mobile, tablet, laptop, and desktop

---

## Features

### Social Experience
- Create and view posts
- Like and unlike posts
- Comment on posts
- Follow and unfollow users
- View public and personal profiles
- Search users from the database
- Suggested users and trending user sections

### Messaging & Notifications
- Real-time notification generation for likes, comments, and follows
- Mark notifications as read or delete them
- Clear all notifications
- Send and view private messages
- Conversation list with unread indicators

### Admin Dashboard
- Admin sign-in flow from the app
- Admin dashboard overview
- User management tools
- Search, edit, activate/suspend, and delete users
- Post moderation and useful admin insights

### Responsive UI
- Mobile-first responsive layout
- Navigation that adapts across devices
- Clean modern styling with Tailwind CSS
- Professional welcome page with branding

---

## Tech Stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- JavaScript / JSX
- Lucide React icons
- React Toastify

### Backend
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Cloudinary

---

## Project Structure

```text
insta/
├── backend/
│   ├── App.js
│   ├── package.json
│   ├── middleware/
│   ├── models/
│   ├── modules/
│   └── routus/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── README.md
└── COMPLETION_SUMMARY.md
```

---

## Local Development

### Backend

```powershell
cd D:\React_2025\insta\backend
npm install
npm start
```

The backend runs on `http://localhost:8000` unless the `PORT` value is changed in the environment configuration.

### Frontend

```powershell
cd D:\React_2025\insta\frontend
npm install
npm start
```

The frontend runs on the default React development port, usually `http://localhost:3000`.

---

## Environment Variables

Create a backend `.env` file with variables like:

```dotenv
MONGO_URL=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
PORT=8000
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
ADMIN_EMAIL=your-admin-email
```

For the frontend, create a `.env` file:

```dotenv
REACT_APP_API_URL=http://localhost:8000
```

Keep all secrets private and never commit real credentials to version control.

---

## Admin Access

The app includes an admin sign-in flow. From the sign-in screen, users can access the admin login option and then land on the dashboard after successful authentication.

Admin-related routes are configured to show the admin dashboard without requiring normal user auth flow.

---

## Key API Areas

- Authentication: `/signup`, `/signin`, `/profile`
- Posts: `/allposts`, `/createPost`, `/like`, `/unlike`, `/comment`
- Users: `/user/:userId`, `/myprofile`, `/follow`, `/unfollow`
- Search: `/search`, `/suggestedUsers`, `/trendingUsers`
- Notifications: `/notifications`
- Messages: `/message`, `/messages/:userId`, `/conversations`
- Administration: `/admin/login`, `/admin/overview`, `/admin/users/:userId`

---

## Production Build

```powershell
cd D:\React_2025\insta\frontend
npm install
npm run build
```

The generated production build can then be deployed to hosting services such as Render, Netlify, or Vercel, with the backend deployed separately as a Node.js service.

---

## Notes

This project includes the following major improvements:

- Welcome page for first-time visitors
- Admin dashboard with user management
- Search-driven user discovery
- Responsive UI across devices
- Modern branding and logo integration
- Better overall app polish and user experience

---

## Developer

Created and maintained by **Sudhanshu Gaikwad**.

---

<div align="center">
  <img src="./public/insta02.png" alt="insta.X brand logo" width="120" />
</div>

