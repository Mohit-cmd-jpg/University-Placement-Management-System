# Deployment Guide: University Placement & Preparation Portal

This guide provides step-by-step instructions for deploying the portal to production environments.

## 1. Database (MongoDB Atlas)
1.  Create a free account on [MongoDB Atlas](https://www.mongodb.com/atlas/cloud).
2.  Create a new Cluster and an Database User.
3.  In "Network Access", add `0.0.0.0/0` (for initial testing) or the specific IPs of your hosting providers.
4.  Get your Connection String (URI). It should look like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/placement_portal?retryWrites=true&w=majority`

## 2. Backend (Railway or Render)
### Via Railway (Recommended)
1.  Connect your GitHub repository to [Railway.app](https://railway.app).
2.  Select the `server` directory as the root.
3.  Add the following Environment Variables:
    - `MONGODB_URI`: Your Atlas URI
    - `JWT_SECRET`: A long secure string
    - `JWT_EXPIRE`: `7d`
    - `NODE_ENV`: `production`
    - `FRONTEND_URL`: Your Vercel URL (once created)
4.  Deploy.

### Via Render
1.  Create a new "Web Service" on [Render.com](https://render.com).
2.  Connect your GitHub repo.
3.  Set "Build Command": `npm install`
4.  Set "Start Command": `node server.js`
5.  Set Environment Variables as above.

## 3. Frontend (Vercel)
1.  Connect your GitHub repo to [Vercel](https://vercel.com).
2.  Set the Framework Preset to `Vite`.
3.  Set the "Root Directory" to `client`.
4.  Add the following Environment Variable:
    - `VITE_API_URL`: Your Backend URL (e.g., `https://api.yourdomain.com`).
5.  Deploy.

## 4. Final Configuration
Once both are deployed:
1.  Update the Backend `FRONTEND_URL` environment variable with the actual Vercel URL.
2.  Redeploy the Backend to apply the CORS change.
3.  Visit the Vercel URL and test the login using the demo buttons!

---

> [!TIP]
> **Post-Deployment**: Run the `node seed.js` script once against your production MongoDB Atlas cluster to populate the initial demo data and the primary Admin account.
