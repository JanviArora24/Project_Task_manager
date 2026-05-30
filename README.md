# Project_Task_manager

A full-stack Task Management application designed to streamline daily productivity with secure, multi-step authentication and project-based task organization.

## 🚀 Key Features
* **Secure OTP Authentication:** Passwordless login system using One-Time Password (OTP) verification for enhanced security.
* **Dynamic Task Management:** Organize tasks within dedicated projects with status tracking.
* **Project Architecture:** Robust modular structure for managing multiple project workspaces.
* **Real-time Data:** Integrated with Supabase (PostgreSQL) for reliable data storage.

## 🛠 Tech Stack
* **Frontend:** React Native, Expo, Axios.
* **Backend:** Node.js, Express.js.
* **Database:** Supabase (PostgreSQL).
* **Authentication:** JWT-based sessions with OTP verification.
* **Deployment:** Backend hosted on Render

## 🎥 Demo Video

🔗 **Demo:** https://drive.google.com/drive/folders/1WHZB8tXNvTZLJTMqBTDhKMzOWMEqRitp?usp=sharing

## 📋 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Clone and Install
```bash
git clone [https://github.com/JanviArora24/Project_Task_manager.git](https://github.com/JanviArora24/Project_Task_manager.git)
cd Project_Task_manager

# Setup Backend
cd backend
npm install

# Setup Frontend
cd ../frontend
npm install
```
### 3. Environment Configuration
Create a `.env` file inside the `backend` directory with the following variables:

```env
PORT=5000
DATABASE_URL=your_supabase_connection_string
```
### 4. Running the Project
**Backend:**
```bash
cd backend
node server.js
```
**Frontend:**
```bash
cd frontend
npx expo start
```

## 👤 Author
Developed by Janvi
