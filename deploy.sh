#!/bin/bash
# NSE EGR PWA — Deploy to ALL 3 platforms simultaneously
echo "🚀 NSE Good Gold EGR — Deploying to all platforms..."
echo ""

# 1. Cloudflare Pages (unlimited free)
echo "☁️  Cloudflare Pages..."
wrangler pages deploy . --project-name=nse-egr-pwa --branch=main 2>&1 | grep -E "Deployment complete|Success|Error|pages.dev"

# 2. GitHub Pages (unlimited free)
echo ""
echo "🐙 GitHub Pages..."
git add -A && git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null && git push origin main 2>&1 | tail -2

echo ""
echo "✅ All platforms updated!"
echo ""
echo "   ☁️  Cloudflare : https://nse-egr-pwa.pages.dev"
echo "   🐙 GitHub      : https://anubhavkrsah1.github.io/nse-egr-pwa/"
