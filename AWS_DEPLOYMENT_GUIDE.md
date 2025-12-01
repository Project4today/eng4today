# AWS Deployment Guide for ReactJS (S3 + CloudFront)

This guide covers the necessary AWS infrastructure setup and secrets management to support the automated CI/CD pipeline.

## Part 1: AWS Infrastructure Setup

### 1. Configure S3 Bucket
1.  **Create a Bucket**: Go to the S3 Console and create a new bucket (e.g., `my-react-app-frontend`).
2.  **Region**: Choose a region close to you (e.g., `us-east-1`).
3.  **Block Public Access**: **Ensure "Block all public access" is CHECKED.**
    *   *Why?* We will use CloudFront Origin Access Control (OAC) to securely access the files. The bucket itself should NOT be public.
4.  **Bucket Versioning**: Optional, but recommended for rollback capabilities.
5.  **Create**: Click "Create bucket".

### 2. Configure CloudFront Distribution
1.  **Create Distribution**: Go to the CloudFront Console and click "Create distribution".
2.  **Origin Domain**: Select your S3 bucket from the dropdown.
3.  **Origin Access**: Select **"Origin access control settings (recommended)"**.
    *   Click "Create control setting".
    *   Keep defaults (Sign requests) and click "Create".
    *   **Important**: You will need to update your S3 Bucket Policy later (CloudFront provides the policy snippet).
4.  **Viewer Protocol Policy**: Select "Redirect HTTP to HTTPS".
5.  **Allowed HTTP Methods**: Select "GET, HEAD, OPTIONS".
6.  **Web Application Firewall (WAF)**: Select "Do not enable security protections" (unless you want to pay for WAF).
7.  **Default Root Object**: Enter `index.html`.
8.  **Create**: Click "Create distribution".

#### Update S3 Bucket Policy
After creating the distribution, you'll see a blue banner at the top saying "The S3 bucket policy needs to be updated".
1.  Copy the provided policy JSON.
2.  Go back to your S3 Bucket -> Permissions -> Bucket Policy -> Edit.
3.  Paste the policy and Save. It typically looks like this:
    ```json
    {
        "Version": "2012-10-17",
        "Id": "PolicyForCloudFrontPrivateContent",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipal",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudfront.amazonaws.com"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::<YOUR_BUCKET_NAME>/*",
                "Condition": {
                    "StringEquals": {
                        "AWS:SourceArn": "arn:aws:cloudfront::<YOUR_ACCOUNT_ID>:distribution/<YOUR_DISTRIBUTION_ID>"
                    }
                }
            }
        ]
    }
    ```

### 3. CRITICAL: Configure SPA Routing (Single Page App)
Since React Router handles routing on the client side, refreshing a page like `/about` will cause S3 to return a 403 or 404 because that file doesn't exist physically. We must tell CloudFront to serve `index.html` instead.

1.  Go to your CloudFront Distribution -> **Error pages** tab.
2.  **Create custom error response**:
    *   **HTTP error code**: `403` (S3 often returns 403 Forbidden for private files instead of 404).
    *   **Customize error response**: Yes.
    *   **Response page path**: `/index.html`
    *   **HTTP Response code**: `200: OK`
    *   Click "Create".
3.  **Repeat for 404**:
    *   **HTTP error code**: `404`
    *   **Customize error response**: Yes.
    *   **Response page path**: `/index.html`
    *   **HTTP Response code**: `200: OK`
    *   Click "Create".

---

## Part 3: Environment Variables & Secrets

To enable the GitHub Actions workflow, you need to configure secrets in your GitHub repository.

### GitHub Secrets
Go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Your AWS IAM User Access Key ID. | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS IAM User Secret Access Key. | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_S3_BUCKET` | The name of your S3 bucket. | `my-react-app-frontend` |
| `DISTRIBUTION_ID` | The ID of your CloudFront Distribution. | `E1234567890ABC` |
| `AWS_REGION` | The AWS Region of your bucket. | `us-east-1` |

### IAM Permissions
The IAM User associated with the access keys needs the following permissions to deploy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::<YOUR_BUCKET_NAME>",
                "arn:aws:s3:::<YOUR_BUCKET_NAME>/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "cloudfront:CreateInvalidation",
            "Resource": "arn:aws:cloudfront::<YOUR_ACCOUNT_ID>:distribution/<YOUR_DISTRIBUTION_ID>"
        }
    ]
}
```
