# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]   # solo despliega desde main

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: test        # espera a que CI pase ✅

    steps:
      - uses: actions/checkout@v4

      - name: Deploy a Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
