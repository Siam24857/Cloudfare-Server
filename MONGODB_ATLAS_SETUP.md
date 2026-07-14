# MongoDB Atlas Setup Guide (Free Cluster)

Use MongoDB Atlas to host the database for production (Vercel/Render deployments).

## 1. Create a cluster
1. Go to https://www.mongodb.com/atlas and sign up / log in.
2. Click **Create** → choose **FREE** (M0) tier.
3. Pick a Cloud Provider & Region closest to your users (e.g. AWS us-east-1).
4. Name the cluster (e.g. `clodfare`) and click **Create Cluster** (takes ~1–3 min).

## 2. Create a database user
1. In the cluster view, open **Database Access** (left sidebar).
2. Click **Add New Database User**.
3. Choose **Password** authentication.
4. Username: `clodfare` · Password: generate a strong password.
5. Set **Built-in Role** to `readWriteAnyDatabase` (or `Atlas admin` for simplicity).
6. Click **Add User**.

## 3. Allow network access
1. Open **Network Access** (left sidebar).
2. Click **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`).
   - For tighter security, add only your server's static IP.
3. Confirm.

## 4. Get the connection string
1. Go back to **Database** → your cluster → **Connect**.
2. Choose **Drivers** → **Node.js**.
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://<user>:<password>@clodfare.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with the password you created in step 2.

## 5. Wire it into Clodfare
Set this as `MONGODB_URI` in your **server** environment:

- **Local `.env`** (`server/.env`):
  ```
  MONGODB_URI=mongodb+srv://clodfare:<password>@clodfare.xxxxx.mongodb.net/clodfare
  ```
- **Render / Railway**: add the same as an environment variable.
- **Vercel** only needs it if you deploy the server there too.

> The database name (`/clodfare`) is created automatically on first write.

## 6. Verify
Start the server (`npm run dev`). You should see:
```
MongoDB connected successfully
Admin seeded: admin@clodfare.com / Admin@123
Server running on port 5000
```

That's it — your crowdfunding backend is now running on a managed MongoDB cluster.
