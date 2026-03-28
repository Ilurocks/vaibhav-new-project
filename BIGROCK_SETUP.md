# BigRock Hosting Setup (Form + Admin + Email + Git Deploy)

## 1) Git Deploy Setup (Recommended)
- In BigRock cPanel, open `Git Version Control`.
- Click `Create`.
- Repository clone URL: your GitHub repo URL.
- Repository path (example): `/home/yourcpaneluser/repositories/vaibhav-new-project`.
- Branch: use your deploy branch (example: `main`).
- After creation, click `Manage` and enable deployment.
- In your project, keep `.cpanel.yml` at repo root (already added in this repo).
- `.cpanel.yml` deploy task syncs files into `/home/$USER/public_html/`.

## 2) Push Code From Local
- Commit changes locally:
  - `git add .`
  - `git commit -m "Prepare BigRock git deployment"`
- Push deploy branch:
  - `git push origin <your-branch>`
- If BigRock is configured to track `main`, merge your branch into `main` and push:
  - `git checkout main`
  - `git merge <your-branch>`
  - `git push origin main`

## 3) Trigger Deployment In cPanel
- cPanel > `Git Version Control` > `Manage` (your repo).
- Click `Pull or Deploy` (wording may differ by panel theme).
- Run deployment. This executes `.cpanel.yml` and updates `public_html`.

## 4) Upload Files (If Not Using Git Deploy)
- Upload the full project to your BigRock `public_html` folder.
- Make sure these files/folders are uploaded:
  - `index.html`
  - `admin.php`
  - `login.php`
  - `api/` (all PHP files)
  - CSS/JS/image files
  - `.htaccess`

## 5) Create MySQL Database
- BigRock cPanel > `MySQL Databases`.
- Create:
  - Database
  - Database user
  - Assign user to database with `ALL PRIVILEGES`

## 6) Configure Credentials
Open `api/config.php` and set real values:
- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `DB_PORT` (usually `3306`)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_NOTIFY_EMAIL`
- `SMTP_ENABLED` (`true` or `false`)
- `SMTP_HOST`
- `SMTP_PORT` (`465` for SSL, `587` for TLS)
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_SECURE` (`ssl`, `tls`, or `none`)
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

## 7) Open Pages
- Main site: `https://yourdomain.com/`
- Admin login: `https://yourdomain.com/login` (or `/login.php`)
- Admin panel: `https://yourdomain.com/admin` (or `/admin.php`)

## 8) How It Works
- Website enquiry form posts to: `/api/enquiries.php`
- Data stores in MySQL table: `enquiries`
- Email alert sent to `ADMIN_NOTIFY_EMAIL`
- Admin page fetches submissions from same API (session-protected)

## 9) SMTP Email Setup (Recommended)
- cPanel > `Email Accounts` > create mailbox (example: `no-reply@yourdomain.com`).
- Put same mailbox credentials in `SMTP_USERNAME` and `SMTP_PASSWORD`.
- Common values:
  - `SMTP_HOST`: `mail.yourdomain.com`
  - `SMTP_PORT`: `465`
  - `SMTP_SECURE`: `ssl`
- Submit a test enquiry and verify:
  - entry appears in admin panel
  - admin gets email notification

## 10) If Email Still Not Received
- Check inbox spam/junk folder.
- Confirm SMTP password is correct.
- Try `SMTP_PORT=587` and `SMTP_SECURE=tls`.
- Temporarily set `SMTP_ENABLED=false` to test PHP `mail()` fallback.

## 11) Security Must-Do
- Change default admin username/password immediately.
- Keep `api/config.php` credentials private.
