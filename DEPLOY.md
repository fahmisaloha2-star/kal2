# 2M ARCHI — Deployment Guide

## Server requirements
- Ubuntu 22.04 LTS
- Node.js 20+
- Nginx
- PM2 (`npm install -g pm2`)
- Certbot

## DNS records (configure at your registrar)

| Type | Name  | Value          |
|------|-------|----------------|
| A    | @     | YOUR_SERVER_IP |
| A    | www   | YOUR_SERVER_IP |
| A    | admin | YOUR_SERVER_IP |

## First deploy

```bash
# 1. Clone the repo
git clone YOUR_REPO_URL /var/www/2marchi
cd /var/www/2marchi

# 2. Install dependencies
npm run install:all

# 3. Fill in production env files
nano back/.env.production
nano front/.env.production
nano admin/.env.production

# 4. Seed the database
cd back && npm run seed && cd ..

# 5. Build all three apps
npm run build:all

# 6. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/2marchi
sudo ln -s /etc/nginx/sites-available/2marchi /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. SSL certificates
sudo certbot --nginx -d www.2marchi.com -d admin.2marchi.com

# 8. Start API with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # follow the printed command to enable auto-restart on reboot

# 9. Verify
curl https://www.2marchi.com/api/projects
```

## Updating the site

```bash
cd /var/www/2marchi
git pull
npm run build:all
pm2 restart 2marchi-api
```

## Important: uploads persistence

`back/uploads/` (or `UPLOAD_DIR` if set) **must never be deleted** during updates.
It contains all client-uploaded images. Back it up regularly.

## Backup strategy (add to crontab)

```bash
crontab -e
# Add:
0 2 * * * tar -czf /backups/2marchi-$(date +\%Y\%m\%d).tar.gz /var/www/2marchi/back/data /var/www/2marchi/back/uploads
```

## After going live checklist
- [ ] Create Google Analytics 4 property → copy G-XXXXXXX into `VITE_GA_ID`
- [ ] Verify site in Google Search Console
- [ ] Submit sitemap: https://www.2marchi.com/sitemap.xml
- [ ] Test OG preview: https://developers.facebook.com/tools/debug
- [ ] Test structured data: https://search.google.com/test/rich-results
- [ ] Run Lighthouse audit (target: 90+ all scores)
- [ ] Request indexing in Search Console after first deploy

## Optional: Restrict admin to specific IPs

Uncomment the `allow` / `deny` block in `nginx.conf` and add your IP address.
This is in addition to the JWT login — defense in depth.

```nginx
allow YOUR.OFFICE.IP.ADDRESS;
deny all;
```

## Gmail SMTP setup

Use a Gmail App Password (not your regular password).
Enable 2FA on Gmail first, then go to: Google Account → Security → App Passwords.
