# Cloudflare R2 Setup Guide

## Step 1: Get R2 Credentials from Cloudflare Dashboard

1. **Go to Cloudflare Dashboard** → R2 Object Storage
2. **Click "Manage R2 API Tokens"** (sa right side ng page)
3. **Create API Token:**
   - Click "Create API Token"
   - Name: `recruitment-app` (or any name you want)
   - Permissions: Select your bucket (`recruitment`)
   - TTL: Leave default or set expiration
   - Click "Create API Token"
4. **Copy the credentials:**
   - **Account ID**: Makikita sa R2 dashboard (sa right side)
   - **Access Key ID**: Makikita sa API token na ginawa mo
   - **Secret Access Key**: Makikita din sa API token (copy mo agad, hindi na ma-view ulit!)

## Step 2: Add Credentials to .env File

Add these lines sa `backend/.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=recruitment
R2_PUBLIC_URL=  # Optional: Kung may custom domain ka, lagay mo dito
```

## Step 3: Install Dependencies

```bash
pip install boto3
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

## Step 4: Restart Backend Server

Restart mo ang backend server para ma-load ang new configuration.

## How It Works

- **Upload**: Files ay mag-upload sa R2 instead of local storage
- **Download**: Files ay mag-download from R2
- **Fallback**: Kung hindi configured ang R2, mag-fallback sa local storage
- **Analysis**: Resume analysis ay mag-read from R2

## Testing

After setup, i-test mo:
1. Upload a PDF resume
2. Check kung nasa R2 bucket na
3. Try to view/download the resume
4. Check kung gumagana ang AI analysis

## Notes

- **Free Tier**: Cloudflare R2 offers 10GB free storage per month
- **No Egress Fees**: Walang bayad sa data transfer (unlike AWS S3)
- **S3 Compatible**: Uses S3-compatible API, so pwede gamitin ang boto3

