
# 🌟 Lumenre Nursing Education Companion 
A comprehensive AI‑powered Nursing Education Companion built for nursing education.  
Designed for students, tutors, and administrators with advanced workflows, quizzes, module delivery, and cloud‑based file previews.

---

## 📸 Screenshots
```
/screenshots/dashboard.png                – Landing Dashboard  
/screenshots/admin_dashboard.png          – Admin Dasboard  
/screenshots/quiz_builder.png             – Quiz Builder  
/screenshots/take_quiz.png                – Student Quiz View  
/screenshots/course_content.png           – Course Content
/screenshots/courses.png                  – Courses
/screenshots/login.png                    – Login
/screenshots/quizzes_attachments.png      – Qizzes and Attachments
/screenshots/tutor_dashboard.png          – Tutor dashboare
```

---

## 🔗 Live Project Links
- **GitHub Link:**         https://github.com/cj7code/lumenre.git
- **Frontend (Vercel):**   https://lumenre.vercel.app/  
- **Backend (Render):**    https://lumenre.onrender.com/ 
- **Pitch Deck:**          https://www.canva.com/design/DAG5Vaym1fc/eKwFoG9Di4q90nH_liEykQ/edit?utm_content=DAG5Vaym1fc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton  

---

## 🧭 Project Overview  
The **Lumenre Nursing Education Companion** enhances learning efficiency with:  
- AI‑generated notes and slides  
- Structured quiz builder for tutors  
- Cloud-based module attachments  
- Inline PDF/image/video previews  
- Role‑based dashboards (Student / Tutor / Admin)  
- Fully mobile‑responsive layouts  
- Secure JWT authentication  
- MongoDB Atlas data persistence  

---

## 🏗️ Folder Structure

```
lumenre/
│
├── client/                       # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level screens
│   │   ├── layouts/             # Admin/Tutor layouts
│   │   ├── styles/              # Global Tailwind styles
│   │   ├── api.js               # Axios API handler
│   │   ├── App.jsx              # Router + Layout
│   │   └── main.jsx             # Entry point
│   ├── public/
│   ├── screenshots/
│   └── package.json
│
├── server/                       # Express backend
│   ├── routes/                  # student.js, admin.js, tutor.js, etc.
│   ├── controllers/             # Quiz, Module, Course, Auth
│   ├── middleware/              # JWT auth, Cloudinary, staffAuth
│   ├── models/                  # Mongoose schemas
│   ├── config/                  # DB + Cloudinary config
│   └── server.js                # API entry
│
├── .env.example                 # Example environment variables
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/cj7code/lumenre.git
cd lumenre
```

### 2. Install Backend
```bash
cd server
npm install
```

### 3. Install Frontend
```bash
cd ../client
npm install
```

---

## 🔑 Environment Variables

### Backend `.env`
```
MONGO_URI=your_mongo_string
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## ▶️ Running the App

### Start Backend
```bash
cd server
npm start
```

### Start Frontend
```bash
cd client
npm run dev
```

---

## 🧩 Core Features

### 👩‍🏫 Tutor  
- Create modules  
- Upload PDF/images/videos  
- AI note/slide generator  
- Build quizzes (MCQ, T/F, Matching, Essay, etc.)  
- Manage drafts  

### 🧑‍🎓 Student  
- View courses & modules  
- Inline PDF viewer  
- Attempt quizzes  
- Track attempts  

### 👨‍💼 Admin  
- Manage users  
- Manage modules  
- Analytics view  
- Role assignment  

---

## 🧪 Quiz Engine Overview  
Supports:  
- Multiple Choice  
- True/False  
- Sentence Completion  
- Matching Items  
- Short Answer  
- Essay Items  
- Auto‑scoring for objective types  

---

## 👨‍⚕️ Author  
**Joseph Charles Jolofan Sakala, RN BSc Nursing**  
Nurse Educator • Full‑stack Developer (in training)
PLP - ACADEMY

---

## 📜 License  
MIT License.
