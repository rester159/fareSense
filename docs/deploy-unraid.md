# Deploy DOKI backend to Unraid

Run the backend API in a Docker container on your Unraid server (enrico.local).

## One-time setup on Unraid

1. **Create app directory** (optional; default below is `/mnt/user/appdata/dokidoki`):
   ```bash
   mkdir -p /mnt/user/appdata/dokidoki
   cd /mnt/user/appdata/dokidoki
   ```

2. **Create env file** (required — do not commit this):
   ```bash
   nano /mnt/user/appdata/dokidoki/.env
   ```
   Add (replace with your values):
   ```
   PORT=3001
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=your-long-random-secret-at-least-32-chars
   ```
   **Note:** Get `DATABASE_URL` from [Neon](https://neon.tech) → Project → Connection string. Use a strong random string for `JWT_SECRET`.

## Deploy / update

### Option A — Repo is on server (public repo or git credentials on Unraid)

From the server (SSH as root):

```bash
cd /mnt/user/appdata/dokidoki
git clone https://github.com/rester159/dokidoki.git repo   # first time only
cd repo && git pull origin main                             # updates
docker build -t dokidoki-backend .
docker stop dokidoki-api 2>/dev/null; docker rm dokidoki-api 2>/dev/null
docker run -d --name dokidoki-api --restart unless-stopped \
  -p 3001:3001 \
  --env-file /mnt/user/appdata/dokidoki/.env \
  dokidoki-backend
```

### Option B — Private repo: copy files from your machine (SCP), then build on Unraid

From **Windows** (PowerShell), from the project root:

```powershell
$key = "C:\Users\edang\.ssh\unraid_deploy"
$target = "root@enrico.local:/mnt/user/appdata/dokidoki"

# 1. Copy frontend without node_modules/.expo/dist
robocopy frontend frontend-deploy /E /XD node_modules .expo dist /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) { exit $LASTEXITCODE }

# 2. SCP all files (frontend required — Dockerfile COPYs it)
scp -i $key Dockerfile .dockerignore "${target}/"
scp -i $key -r frontend-deploy "${target}/frontend"
scp -i $key -r backend "${target}/"
```

Then SSH to Unraid and build + run:

```bash
cd /mnt/user/appdata/dokidoki
docker build -t dokidoki-backend .
docker stop dokidoki-api 2>/dev/null; docker rm dokidoki-api 2>/dev/null
docker run -d --name dokidoki-api --restart unless-stopped -p 3001:3001 --env-file /mnt/user/appdata/dokidoki/.env dokidoki-backend
```

API will be at `http://enrico.local:3001` (e.g. `GET http://enrico.local:3001/health`).

### Path to the experience (web app on same server)

1. Build the web app locally: from repo root run `npm run build:web` (or `cd frontend && npm run build:web`).
2. Copy `frontend/dist` to the server (e.g. into the same folder as `backend/` so the container can serve it, or add a stage in Docker to build web and copy `frontend/dist` into the image).
3. The backend serves the app at **`/`** when `frontend/dist` exists. So open **http://enrico.local:3001/** (or **http://10.0.5.202:3001/**) for the game.

## From your Windows machine (SSH + deploy)

Using the key from `docs/deploy-ssh.md`:

```powershell
ssh -i "C:\Users\edang\.ssh\unraid_deploy" root@enrico.local
# then run the deploy commands above
```

Or run a one-liner (clone path and env path as above):

```powershell
ssh -i "C:\Users\edang\.ssh\unraid_deploy" root@enrico.local "cd /mnt/user/appdata/dokidoki/repo && git pull origin main && docker build -t dokidoki-backend . && docker stop dokidoki-api 2>/dev/null; docker rm dokidoki-api 2>/dev/null; docker run -d --name dokidoki-api --restart unless-stopped -p 3001:3001 --env-file /mnt/user/appdata/dokidoki/.env dokidoki-backend"
```

Ensure `/mnt/user/appdata/dokidoki/.env` exists on the server before the first deploy.
