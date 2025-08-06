# Deployment Guide for bolt.echo

This guide explains how to deploy the bolt.echo application to Cloudflare Pages using GitHub Actions with automatic project creation.

## 🚀 Quick Start

### Option 1: GitHub Actions (Recommended)

1. **Set up GitHub Secrets** in your repository:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages/Workers write permissions
     - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
     - `ANTHROPIC_API_KEY`: Your Anthropic API key
     - `OPENAI_API_KEY`: Your OpenAI API key (optional)

2. **Push to main branch** or **manually trigger the workflow**:
   - The workflow will automatically create the Cloudflare Pages project if it doesn't exist
   - Build and deploy your application

### Option 2: Local Deployment

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set environment variables**:
   ```bash
   export CLOUDFLARE_API_TOKEN="your_api_token"
   export CLOUDFLARE_ACCOUNT_ID="your_account_id"
   ```

3. **Test the deployment setup**:
   ```bash
   pnpm run test:deployment
   ```

4. **Deploy manually**:
   ```bash
   pnpm run deploy
   ```

## 🔧 Configuration

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy-pages.yml`) includes:

1. **Project Creation**: Automatically creates the Cloudflare Pages project if it doesn't exist
2. **Build Process**: Uses pnpm to build the application
3. **Deployment**: Deploys to Cloudflare Pages with proper error handling
4. **Verification**: Checks deployment status after completion

### Project Creation Script

The `scripts/create-cloudflare-project.sh` script:

- Checks if the project exists using wrangler
- Creates the project via Cloudflare API if it doesn't exist
- Handles errors gracefully and continues with deployment
- Configures build settings automatically

### Test Script

The `scripts/test-deployment.sh` script:

- Validates environment variables
- Checks wrangler installation
- Tests the build process
- Verifies build output
- Provides helpful error messages

## 📋 Required Environment Variables

### For GitHub Actions (Repository Secrets)

| Variable | Description | Required |
|----------|-------------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages/Workers write permissions | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI functionality | ✅ |
| `OPENAI_API_KEY` | OpenAI API key (optional) | ❌ |

### For Local Development

```bash
export CLOUDFLARE_API_TOKEN="your_api_token"
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export ANTHROPIC_API_KEY="your_anthropic_key"
```

## 🔑 Getting Cloudflare Credentials

### 1. Get Your Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Look at the URL: `https://dash.cloudflare.com/<account-id>`
3. Copy the account ID

### 2. Create API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Custom token" template
4. Set permissions:
   - Account > Pages > Edit
   - Account > Workers > Edit
   - Account > Workers Routes > Edit
5. Set account resources to "All accounts"
6. Create the token and copy it

## 🏗️ Build Configuration

The project uses the following build configuration:

- **Build Command**: `pnpm run build:pages`
- **Output Directory**: `build/client`
- **Node Version**: 20.15.1
- **Package Manager**: pnpm@9.4.0

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Project not found" | The workflow will automatically create the project |
| "Authentication failed" | Check your API token and account ID |
| "Build failed" | Check the build logs in GitHub Actions |
| "Deployment failed" | Check Cloudflare Pages dashboard for errors |

### Debugging Steps

1. **Check GitHub Actions logs**:
   - Go to your repository → Actions
   - Click on the latest workflow run
   - Check each step for errors

2. **Test locally**:
   ```bash
   pnpm run test:deployment
   ```

3. **Check Cloudflare Dashboard**:
   - Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)
   - Look for your project and check deployment status

4. **Verify environment variables**:
   ```bash
   echo $CLOUDFLARE_API_TOKEN
   echo $CLOUDFLARE_ACCOUNT_ID
   ```

## 📊 Monitoring

### GitHub Actions

- Monitor workflow runs in the Actions tab
- Check build and deployment logs
- Verify environment variables are set correctly

### Cloudflare Pages

- View deployment status in Cloudflare Dashboard
- Check build logs for any issues
- Monitor application performance

## 🔄 Manual Deployment

If you need to deploy manually:

```bash
# Build the project
pnpm run build:pages

# Deploy to Cloudflare Pages
wrangler pages deploy build/client --project-name boltecho
```

## 📝 Notes

- The project name is hardcoded as "boltecho" in the configuration
- The workflow includes error handling and continues on non-critical failures
- Build artifacts are cached for faster subsequent deployments
- The deployment process is idempotent - safe to run multiple times

## 🆘 Support

If you encounter issues:

1. Check the GitHub Actions logs first
2. Verify your environment variables
3. Test the deployment locally
4. Check the Cloudflare Pages dashboard
5. Review the troubleshooting section above