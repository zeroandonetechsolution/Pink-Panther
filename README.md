# 🎀 ZOS Command Center ERP (Pink Panther Edition)

## 📋 Features
- Complete ERP system with Dashboard, Clients, Leads, Projects, Quotations, Payments, Tasks
- Face recognition login (username: boss, password: your face)
- Pink Panther theme with 80s/90s vibe
- Full CRUD operations for all modules
- Urgent alerts management
- LocalStorage data persistence

## 🚀 Deploy to Vercel

### Step 1: Prepare your code
1. Make sure you're in the `zos-erp` directory
2. Initialize a git repository (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial ZOS Command Center commit"
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New" → "Project"
3. Import your git repository
4. Click "Deploy"!

## 🔐 Setup Supabase (Optional)
To use Supabase instead of localStorage for data persistence:
1. Go to [supabase.com](https://supabase.com) and create a project
2. Create tables for each module
3. Update the JavaScript to use Supabase SDK instead of localStorage

## 📖 Usage
1. Open the app
2. Click "Register My Face" to set up your face password
3. Click "Login with Face" to access the dashboard
4. Enjoy your Pink Panther themed ERP! 🐾

## 🛠️ Local Development
```bash
cd zos-erp
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```
