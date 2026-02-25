# 🔍 Keyword Research Bot

A tool for coaches to find keywords their ideal clients are actually searching for. Powered by Claude AI + web search.

---

## What it does

1. You describe your ideal client and their pain points
2. The AI searches Reddit, forums, and social media for real complaints and desires  
3. It generates 40-60 strategic keywords as a downloadable CSV
4. Each keyword includes: Category, Best Platform, Search Intent, and Usage Notes

---

## Deploy in 5 minutes (Free on Vercel)

### Step 1: Get your Anthropic API key
- Go to https://console.anthropic.com
- Create an account and add billing (very low cost — ~$0.02 per search)
- Copy your API key

### Step 2: Deploy to Vercel
1. Push this folder to a GitHub repo
2. Go to https://vercel.com and sign in with GitHub
3. Click "New Project" → import your repo
4. Under **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from Step 1
5. Click Deploy

### Step 3: Share with clients
- Vercel gives you a free URL like `your-app.vercel.app`
- Share that URL with your clients — they just type and go!

---

## Run locally (for testing)

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your API key
npm run dev
```

Then open http://localhost:3000

---

## Cost estimate

- Uses `claude-haiku-4-5` (cheapest Claude model)
- Each keyword research run costs approximately **$0.01–0.05**
- 100 uses/month ≈ $1–5

---

## Customization

To change the tone, keyword categories, or output format, edit the `systemPrompt` in:
`app/api/research/route.js`
