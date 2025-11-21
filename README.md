Pitchdeck: https://www.canva.com/design/DAG5Vaym1fc/eKwFoG9Di4q90nH_liEykQ/edit?utm_content=DAG5Vaym1fc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
LUMENRE – Nursing e-Learning & Assessment Platform

A Modern MERN-Based Learning Management System (LMS) for Nursing Students, Tutors & Administrators

📘 Project Overview

Lumenre is a full-stack MERN (MongoDB, Express, React, Node.js) e-learning platform designed for Nursing Schools.
It supports:

Course distribution

Tutor content creation

Student learning & quizzes

Admin oversight with dashboards

Offline syncing

Role-based access control (RBAC)

This project was developed as part of the PLP Academy Hackathon (July 2025 Cohort).

🚀 Core Features
👩‍⚕️ Student Features

View nursing courses & modules

Read notes created by tutors

Attempt quizzes

Track progress

Offline learning (PWA-ready)

👨‍🏫 Tutor Features

Create / edit modules

Manage quizzes & questions

Upload content

View class performance

🛠️ Admin Features

Manage users (students, tutors)

Manage courses & modules

Approve/update content

Monitor platform statistics & activity

🌐 General Features

Role-based authentication

Modern React UI with TailwindCSS

API-based modular backend

MongoDB models for Courses, Modules, Quizzes, Users

RESTful architecture

Clean reusable frontend components

Responsive design (mobile-friendly)

Secure JWT authentication

Error boundary handling

Full seeding system for nursing courses

📂 Project Structure
lumenre/
├── server/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── seed/
│   │   └── seedCourses.js
│   ├── server.js
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── App.jsx
│   ├── public/
│   └── package.json
│
└── README.md

🧰 Tech Stack
Frontend

React + Vite

React Router

TailwindCSS

shadcn/ui

Lucide Icons

Axios

Framer Motion

LocalStorage for Auth Persistence

PWA Offline Sync Banner

Backend

Node.js

Express

MongoDB / Mongoose

JWT Authentication

bcrypt Password Hashing

CORS

dotenv

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/lumenre.git
cd lumenre

🗄️ Backend Setup (server)
2️⃣ Install Backend Dependencies
cd server
npm install

3️⃣ Create a .env file in /server
MONGO_URI=mongodb+srv://yourcluster.mongodb.net/lumenre
JWT_SECRET=yourStrongSecretKey
PORT=5000

4️⃣ Start Backend
npm run dev

🎨 Frontend Setup (client)
5️⃣ Install Frontend Dependencies
cd ../client
npm install

6️⃣ Start Frontend
npm run dev

🌱 Seeding the Database

A full nursing curriculum is included in:
server/seed/seedCourses.js

To seed the courses:
cd server
node seed/seedCourses.js


If you want to reseed (clean first):

mongo
db.courses.deleteMany({})
db.modules.deleteMany({})


Then rerun seeding.

🔒 Authentication Flow

User registers → /auth/signup

User logs in → /auth/login

Backend returns JWT token

Token stored in localStorage

Frontend decodes the user role to show the correct dashboard

Roles used:

admin
tutor
student

🧭 Frontend Routing Structure
Route	Page	Role
/	Dashboard	Public
/courses	All Courses	Public
/courses/:id	Single Course	Public
/quiz/:id	Quiz Page	Student
/admin	Admin Dashboard	Admin
/tutor	Tutor Dashboard	Tutor
/student	Student Dashboard	Student
/login	Login	Public
/signup	Signup	Public
🖼️ Screenshots (Placeholders)

(Add images to client/public/screenshots/)

![Login Screen](client/public/screenshots/login.png)
![Chat Room](client/public/screenshots/rooms.png)
![Users List](client/public/screenshots/users.png)
![Course List](client/public/screenshots/chat.png)

🧪 Testing Suggestions

(Not implemented yet, but recommended)

Jest + React Testing Library

Supertest for API endpoints

Mocking MongoDB with In-Memory Server

🧱 Known Issues

Only shows 1 course before reseeding

Some icons require installing:
npm install lucide-react

framer-motion needed:
npm install framer-motion

Admin dashboard breaks when drafts is not an array

CORS must be enabled correctly

/courses route must be added in App.jsx

🤝 Contribution Guidelines

Fork the repository

Create a feature branch:

git checkout -b feature-name


Commit changes:

git commit -m "Add new feature"


Push to branch:

git push origin feature-name


Open a Pull Request

📜 License

MIT License © 2025 Lumenre Development Team

🎯 Final Notes

This project is continuously evolving, with new modules, dashboards, and assessment tools under active development.
It aims to modernize nursing education in Zambia and beyond.