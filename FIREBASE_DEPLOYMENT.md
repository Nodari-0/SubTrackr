# Firebase Deployment Setup

This project uses GitHub Actions to automatically deploy to Firebase Hosting.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com)
2. GitHub repository with admin access

## Setup Instructions

### 1. Install Firebase CLI (Local Development)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

Update `.firebaserc` with your Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 4. Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely

### 5. Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

#### `FIREBASE_SERVICE_ACCOUNT`
Paste the **entire contents** of the service account JSON file you downloaded.

#### `FIREBASE_PROJECT_ID`
Your Firebase project ID (e.g., `subtrackr-12345`)

### 6. GitHub Actions Workflows

Two workflows are configured:

#### **firebase-deploy.yml** - Production Deployment
- Triggers on push to `main` or `master` branch
- Deploys to production Firebase Hosting
- URL: Your production Firebase Hosting URL

#### **pr-preview.yml** - Pull Request Previews
- Triggers on pull request creation/updates
- Deploys to temporary preview channel
- Preview URL posted as PR comment
- Automatically expires after 7 days

## Manual Deployment

To deploy manually from your local machine:

```bash
npm run deploy
```

This will:
1. Build the project (`npm run build`)
2. Deploy to Firebase Hosting (`firebase deploy --only hosting`)

## Deployment Status

Check the **Actions** tab in your GitHub repository to view deployment status.

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Ensure `npm ci` installs all dependencies successfully
- Review build logs in GitHub Actions

### Deployment Fails
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is valid JSON
- Verify `FIREBASE_PROJECT_ID` matches your Firebase project
- Check Firebase project permissions

### Preview Channel Issues
- Preview channels automatically expire after 7 days
- Only PRs from the same repository can create previews (security)

## Environment Variables

If your app requires environment variables (like Supabase keys), add them to:

1. **GitHub Secrets** for CI/CD
2. **Local `.env` file** for development (not committed)

Update the workflow files to pass environment variables during build:

```yaml
- name: Build project
  run: npm run build
  env:
    CI: false
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```
