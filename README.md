<div align="center">

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=45&pause=1000&color=3B82F6&center=true&vCenter=true&width=800&height=80&lines=Welcome+to+SocialWave!+🌊;Share+Your+Best+Moments;Connect+With+Friends;Built+with+the+MERN+Stack)](https://git.io/typing-svg)

**A modern, responsive social media platform for sharing thoughts, images, and connecting with others.**

<br />

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

</div>

---

## ✨ Features

- 🔐 **Authentication:** Secure user registration, login, and JWT-based session management.
- 📝 **Dynamic Feed:** View the latest posts, sort by Most Liked, Most Commented, or filter by your own posts.
- 📸 **Rich Media Posts:** Share text, upload images, or combine both in a single post.
- ❤️ **Interactive Posts:** Like and unlike posts. Click the likes count to instantly see a popup of who liked it!
- 💬 **Comment System:** Engage in conversations directly on user posts.
- 💅 **Modern UI:** Built with raw CSS featuring smooth animations, glassmorphism, and responsive design.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Hooks, Context API)
- **Vite** (Lightning fast build tool)
- **Axios** (API requests)
- **React Router v6** (Client-side routing)

### Backend
- **Node.js & Express** (RESTful API architecture)
- **MongoDB & Mongoose** (NoSQL Database)
- **JWT & bcryptjs** (Authentication & security)
- **Multer** (Handling multipart/form-data for image uploads)

---

## 🚀 Local Development

### Prerequisites
Make sure you have Node.js installed on your machine and a MongoDB Atlas connection string.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/socialmedia.git
cd socialmedia
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```
The app should now be running locally at `http://localhost:5173`.

---

## ☁️ Deployment

This project is configured to run smoothly on cloud platforms:

- **Frontend:** Deployed seamlessly on **Vercel**. Set the `VITE_API_URL` environment variable to your backend domain. The `vercel.json` file handles React routing fallback.
- **Backend:** Hosted on **Render** (Node Web Service). The CORS environment variable `FRONTEND_URL` is used to firmly secure cross-origin requests.

<div align="center">
  <br/>
  Made with ❤️ by Smith
</div>
