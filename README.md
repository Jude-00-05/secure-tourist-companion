# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## EmailJS Setup for Emergency Dispatch

This app uses EmailJS to send real emergency dispatch emails. To enable email functionality:

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email

### 2. Set up Email Service
1. In your EmailJS dashboard, go to **Email Services**
2. Add a new service (Gmail, Outlook, etc.)
3. Connect your email account and verify

### 3. Create Email Template
1. Go to **Email Templates** in your dashboard
2. Create a new template with these variables:
   - `{{subject}}` - Email subject
   - `{{message}}` - Email body
   - `{{incident_id}}` - Incident ID
   - `{{team_type}}` - Response team type
   - `{{priority}}` - Alert priority
   - `{{timestamp}}` - Dispatch timestamp
3. **Important**: Set the recipient email directly in the template (To Email field) to `alwinsunnyjude@gmail.com`
4. Do NOT use `{{to_email}}` variable - EmailJS doesn't allow dynamic recipients for security reasons

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your EmailJS credentials:
   ```
   VITE_EMAILJS_SERVICE_ID=your_service_id_here
   VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
   VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

### 5. Test Email Dispatch
1. Start the app: `npm run dev`
2. Go to Safety Alerts page
3. Click "Dispatch" on any incident
4. Select response teams and dispatch
5. Check your email for the emergency alert

**Note**: Free EmailJS accounts have monthly limits. For production use, consider upgrading or using a dedicated email service.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
