# 🚀 Hostinger Auto-Deploy Setup Guide

## Your Hostinger Details:
- **User:** u122886170
- **Domain:** compressify.gujjugarba.com
- **Site URL:** http://compressify.gujjugarba.com
- **Node.js Path:** /opt/alt/alt-nodejs24/root/usr/bin/npm
- **Site Directory:** /home/u122886170/domains/compressify.gujjugarba.com

---

## 🎯 Option 1: Auto-Deploy Setup (Recommended)

### Step 1: SSH into Hostinger
```bash
ssh u122886170@compressify.gujjugarba.com
```

### Step 2: Navigate to your site
```bash
cd /home/u122886170/domains/compressify.gujjugarba.com
```

### Step 3: Initialize Git (if not already done)
```bash
git init
git remote add origin YOUR_GIT_REPO_URL
git pull origin main
```

### Step 4: Create post-receive hook
```bash
mkdir -p .git/hooks
nano .git/hooks/post-receive
```

### Step 5: Paste this into post-receive:
```bash
#!/bin/bash
cd /home/u122886170/domains/compressify.gujjugarba.com
git pull origin main

# Get latest build directory
LATEST=$(ls -t hbuilds/versions/ 2>/dev/null | head -1)
if [ -n "$LATEST" ]; then
    cd hbuilds/versions/$LATEST/nodejs/server
fi

# Install and build
/opt/alt/alt-nodejs24/root/usr/bin/npm install --production --ignore-scripts
/opt/alt/alt-nodejs24/root/usr/bin/npm run build

echo "Deployment completed!"
```

### Step 6: Make it executable
```bash
chmod +x .git/hooks/post-receive
```

### Step 7: Test it
```bash
# From your local machine
git push origin main
```

---

## 🔧 Option 2: Manual Deploy Command

If auto-deploy doesn't work, SSH into Hostinger and run:

```bash
cd /home/u122886170/domains/compressify.gujjugarba.com
git pull origin main
LATEST=$(ls -t hbuilds/versions/ | head -1)
cd hbuilds/versions/$LATEST/nodejs/server
/opt/alt/alt-nodejs24/root/usr/bin/npm install --production --ignore-scripts
/opt/alt/alt-nodejs24/root/usr/bin/npm run build
```

Or use the script:
```bash
bash manual-deploy.sh
```

---

## 🎪 Option 3: Hostinger Git Panel (Easiest)

1. **Login to Hostinger hPanel**
2. Go to **"Git"** section
3. Connect your repository
4. Set **Build Command:**
   ```bash
   /opt/alt/alt-nodejs24/root/usr/bin/npm install --production --ignore-scripts && /opt/alt/alt-nodejs24/root/usr/bin/npm run build
   ```
5. Enable **"Auto Deploy"**
6. Push code → Auto-deploy!

---

## 📦 What Gets Installed Automatically:

When you push code, the script will:
1. ✅ Pull latest code from git
2. ✅ Navigate to build directory
3. ✅ Run `npm install` (installs node_modules)
4. ✅ Run `npm run build` (builds production files)
5. ✅ Your site is live!

---

## 🐛 Troubleshooting:

### If "permission denied":
```bash
chmod +x .git/hooks/post-receive
```

### If "npm not found":
Use full path:
```bash
/opt/alt/alt-nodejs24/root/usr/bin/npm install
```

### If build directory not found:
```bash
cd /home/u122886170/domains/compressify.gujjugarba.com
ls -la hbuilds/versions/
```

### Check current deployment:
```bash
cd /home/u122886170/domains/compressify.gujjugarba.com
ls -lt hbuilds/versions/ | head -5
```

---

## 🎉 After Setup:

**Your workflow:**
```bash
# Make changes locally
git add .
git commit -m "updated feature"
git push origin main
```

**Hostinger automatically:**
- Receives push
- Pulls code
- Installs dependencies
- Builds app
- Restarts server

**No manual commands needed!** 🚀

---

## 📝 Files Created:
- `post-receive` - Git hook for auto-deploy
- `hostinger-deploy.sh` - Deployment script
- `manual-deploy.sh` - Manual deployment command
- `HOSTINGER_SETUP.md` - This guide
