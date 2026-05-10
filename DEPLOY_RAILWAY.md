## Railway Deploy Checklist

### 1) Backend service variables
- `DATABASE_URL` (recommended) or `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME`
- `ALLOWED_ORIGINS=https://<frontend-domain>.up.railway.app`

### 2) Frontend service variables
- `VITE_API_URL=https://<backend-domain>.up.railway.app`

### 3) Important note about `/uploads`
- Railway filesystem is ephemeral between deploys/restarts.
- If you save uploaded images only to local disk (`backend/uploads`), images can disappear after redeploy.
- For production, move uploads to object storage (Cloudinary, S3, Supabase Storage), or re-seed `backend/uploads` on deploy.

### 4) Quick verify
- Open `https://<backend-domain>.up.railway.app/` => backend text response
- Open `https://<backend-domain>.up.railway.app/uploads/...` => image responds
- Frontend login/register calls should hit `https://<backend-domain>.up.railway.app/api/...`
