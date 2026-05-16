# PunchAI — Punching Shear Predictor
### Machine Learning Model for Predicting Punching Shear Capacity of RC Flat Slabs

---

## 📁 Folder Structure

```
punching-shear-predictor/
├── index.html       ← Main website (all sections)
├── style.css        ← Complete stylesheet (dark futuristic theme)
├── script.js        ← Prediction engine + animations
└── README.md        ← This file
```

---

## ⚡ Quick Start (Local)

1. Download/clone all three files into one folder.
2. Double-click `index.html` to open in your browser.
3. That's it — no build step, no server needed.

---

## 🧮 Engineering Formulas Used (IS 456:2000)

| Formula | Expression |
|---|---|
| Critical Perimeter | b₀ = 4 × (c + d) |
| Punching Shear Stress | vu = Vu(N) / (b₀ × d) |
| Permissible Stress | vc = 0.25 × √fck |
| Safety Check | UNSAFE if vu > vc |

### Sample Test

| Input | Value |
|---|---|
| Slab thickness h | 180 mm |
| Effective depth d | 150 mm |
| Column size c | 300 mm |
| Factored load Vu | 450 kN |
| Concrete grade fck | 30 MPa |

**Expected Output:**
- b₀ = 1800 mm
- vu = 1.6667 N/mm²
- vc = 1.3693 N/mm²
- Result = **UNSAFE**

---

## 🐙 Upload to GitHub

```bash
# 1. Create a new repo on github.com (call it punching-shear-predictor)

# 2. In your project folder, open terminal:
git init
git add .
git commit -m "Initial commit: PunchAI website"

# 3. Link to your GitHub repo:
git remote add origin https://github.com/YOUR_USERNAME/punching-shear-predictor.git

# 4. Push:
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy on Netlify (Free)

### Method A — Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up free.
2. Click **"Add new site" → "Deploy manually"**.
3. Drag your project folder into the drop zone.
4. Done! You get a live URL like `https://punchAI.netlify.app`.

### Method B — Connect GitHub (Auto-deploy)
1. Push code to GitHub (steps above).
2. On Netlify: **"Add new site" → "Import an existing project"**.
3. Connect GitHub → select your repo.
4. Build settings: leave blank (static site).
5. Click **Deploy**. Auto-deploys on every push.

### Custom Domain (Optional)
- In Netlify: **Site settings → Domain management → Add custom domain**.

---

## 🌐 Deploy on GitHub Pages (Alternative)

1. Push to GitHub as above.
2. Go to your repo → **Settings → Pages**.
3. Source: **Deploy from branch → main → / (root)**.
4. Save. Live at: `https://YOUR_USERNAME.github.io/punching-shear-predictor/`

---

## 🎨 Customization

- **Team names/info**: Edit the `#team` section in `index.html`
- **College name**: Search for "Institute of Engineering" in `index.html`
- **Colors**: Edit CSS variables at the top of `style.css`
- **Guide name**: Find "Prof. Dr. S. Venkatesh" in `index.html`

---

## 📱 Browser Support

Chrome, Firefox, Safari, Edge — all modern browsers. Fully mobile responsive.

---

*Built as a Civil Engineering Final Year Project · 2024–25*