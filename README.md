# Student Bunk Meter

A full-stack MERN application with a modern, responsive UI designed to help students track their attendance, calculate safe bunks, and predict their attendance percentage.

## Features

- **Authentication:** JWT-based secure Register and Login with a premium UI.
- **Dashboard Overview:** Displays overall attendance, total attended/missed classes, and safe bunks count.
- **Subject Management:** Add, delete, and increment attendance/misses for subjects.
- **Intelligent Calculations:** Automatically calculates the safe amount of bunks or the classes needed to reach a 75% attendance criteria.
- **Visual Analytics:** Interactive charts built with Recharts to visualize attendance trends.
- **Premium UI:** Glassmorphism, smooth animations, and tailored color palettes.

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Router.
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs.

## Setup Instructions

### Prerequisites
- Node.js installed on your machine
- MongoDB instance (local or MongoDB Atlas)

### 1. Clone & Install Dependencies

Open your terminal and navigate to the project directory:

**Backend Setup:**
```bash
cd server
npm install
```

**Frontend Setup:**
```bash
cd client
npm install
```

### 2. Environment Variables

In the `server` directory, ensure your `.env` file contains the following (a default one has been generated):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student-bunk-meter
JWT_SECRET=supersecretjwtkey123
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```
*Note: Make sure your MongoDB server is running locally on the default port, or change the MONGO_URI to your Atlas connection string.*

### 3. Running the Application

**Start the Backend:**
```bash
cd server
npm start
# or use nodemon if installed: nodemon server.js
```
*The server will run on http://localhost:5000*

**Start the Frontend:**
Open a new terminal window:
```bash
cd client
npm run dev
```
*The React app will typically run on http://localhost:5173*

## Deployment Readiness

- **Frontend (Vercel):** The Vite project is ready to be deployed to Vercel directly by pushing to GitHub and importing the project.
- **Backend (Render/Railway):** The Express server is set up with `process.env.PORT` and CORS. You will just need to set the environment variables in your hosting provider's dashboard.
