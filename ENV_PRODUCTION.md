# 🚀 Production Environment Variables

Copy and paste these into your hosting provider settings (Render, Railway, Vercel).

## 🖥️ Backend (Render/Railway)
Set these in your Web Service settings:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PORT` | `5051` | Or leave empty (Render assigns automatically) |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas Connection String |
| `JWT_SECRET` | `your_long_random_secure_string_here` | Keep this private! |
| `JWT_EXPIRE` | `7d` | |
| `NODE_ENV` | `production` | |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL |
| `EMAIL_USER` | `mohitbindal106@gmail.com` | |
| `EMAIL_PASS` | `adpqohfgsnemnwbb` | Your Gmail App Password |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your AI API Key |

---

## 🎨 Frontend (Vercel)
Set these in your Vercel Project Settings:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-api.onrender.com/api` | Your Render Backend URL + `/api` |

---

### 🛠️ Post-Deployment Step
Once your Backend is live, remember to run the seed script once to populate your production database:
```bash
cd server
export MONGODB_URI="your_atlas_uri"
node seed.js
```
