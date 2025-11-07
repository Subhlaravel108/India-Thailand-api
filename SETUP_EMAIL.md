# Email Setup Guide

## Gmail Setup

1. Go to your Google Account Settings
2. Enable 2-Step Verification
3. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password

4. Update `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
# Remove EMAIL_HOST and EMAIL_PORT for Gmail
```

## Custom SMTP Setup (for custom email)

Update `.env` file:
```env
EMAIL_USER=your-email@domain.com
EMAIL_APP_PASSWORD=your-password
EMAIL_HOST=smtp.domain.com
EMAIL_PORT=465  # or 587
```

## Testing

After updating credentials, restart the server:
```bash
npm run dev
```

Then register a new user - email should be sent successfully.

