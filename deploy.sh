#!/bin/bash
# NSE EGR PWA — Deploy to Cloudflare Pages (primary)
echo "☁️  Deploying to Cloudflare Pages..."
wrangler pages deploy . --project-name=nse-egr-pwa --branch=main 2>&1 | grep -E "Deployment complete|Success|Error|pages.dev"
echo ""
echo "✅ Live at: https://nse-egr-pwa.pages.dev"
