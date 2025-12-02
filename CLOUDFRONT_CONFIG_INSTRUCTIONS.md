# CloudFront Reverse Proxy Configuration Guide

This guide provides step-by-step instructions to configure your existing AWS CloudFront distribution to act as a reverse proxy for your backend Application Load Balancer (ALB).

**Goal:** Serve both your React Frontend (HTTPS) and FastAPI Backend (HTTP) from the same CloudFront domain to resolve "Mixed Content" errors.

## Prerequisites

1.  **CloudFront Distribution**: You already have a distribution serving your React app from S3.
2.  **Application Load Balancer (ALB)**: You have an ALB serving your FastAPI backend via HTTP (e.g., port 80).
3.  **ALB DNS Name**: You need the DNS name of your ALB (e.g., `my-backend-alb-123456789.us-east-1.elb.amazonaws.com`).

---

## Step 1: Add the Backend ALB as a New Origin

1.  **Open CloudFront Console**: Go to the AWS Management Console and navigate to **CloudFront**.
2.  **Select Distribution**: Click on the ID of your existing distribution.
3.  **Go to Origins**: Click on the **Origins** tab.
4.  **Create Origin**: Click the **Create origin** button.
5.  **Configure Origin Settings**:
    *   **Origin domain**: Enter your ALB DNS name (e.g., `my-backend-alb-xxxx.us-east-1.elb.amazonaws.com`).
    *   **Protocol**: Select **HTTP only**.
        *   *Why?* Your ALB is listening on HTTP. CloudFront will terminate HTTPS and talk to the ALB over HTTP.
    *   **HTTP Port**: `80` (or whatever port your ALB listens on).
    *   **Name**: Give it a recognizable name (e.g., `Backend-ALB`).
    *   **Add custom header** (Optional): You can add a secret header (e.g., `X-Custom-Auth`) here and check for it in your backend to ensure requests are coming from CloudFront.
6.  **Save**: Click **Create origin**.

---

## Step 2: Create Behaviors for API Routes

We need to tell CloudFront to route requests starting with `/api` and `/docs` to the new `Backend-ALB` origin instead of the S3 bucket.

### A. Create Behavior for Swagger UI (`/docs`)

1.  **Go to Behaviors**: Click on the **Behaviors** tab in your distribution details.
2.  **Create Behavior**: Click **Create behavior**.
3.  **Settings**:
    *   **Path pattern**: `/docs`
    *   **Origin and origin groups**: Select the `Backend-ALB` origin you just created.
    *   **Viewer protocol policy**: **Redirect HTTP to HTTPS** (or HTTPS only).
    *   **Allowed HTTP methods**: `GET, HEAD, OPTIONS`.
    *   **Cache key and origin requests**:
        *   **Cache policy**: Choose **CachingDisabled**.
            *   *Why?* API responses and docs should usually not be cached by the edge.
        *   **Origin request policy**: Choose **AllViewer**.
            *   *Why?* This passes all headers (User-Agent, Cookies, etc.) and query strings to the backend.
4.  **Save**: Click **Create behavior**.

*Repeat this step for `/openapi.json` if needed by Swagger UI.*

### B. Create Behavior for API Endpoints (`/api/*`)

1.  **Create Behavior**: Click **Create behavior** again.
2.  **Settings**:
    *   **Path pattern**: `/api/*`
    *   **Origin and origin groups**: Select `Backend-ALB`.
    *   **Viewer protocol policy**: **Redirect HTTP to HTTPS**.
    *   **Allowed HTTP methods**: Select **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE**.
        *   *Important:* APIs often use POST/PUT/DELETE.
    *   **Cache key and origin requests**:
        *   **Cache policy**: **CachingDisabled** (Ensure dynamic API responses are fresh).
        *   **Origin request policy**: **AllViewer**.
3.  **Save**: Click **Create behavior**.

---

## Step 3: Verification

1.  **Wait for Deployment**: The CloudFront status will change to "Deploying". Wait until it says "Last modified" (can take a few minutes).
2.  **Test API**: Open your browser and go to `https://<your-cloudfront-domain>/api/voices` (or a valid endpoint). You should see the JSON response from your backend.
3.  **Test Frontend**: Open your React app at `https://<your-cloudfront-domain>`. It should now be able to fetch data without "Mixed Content" errors.

## Summary of Traffic Flow

1.  User requests `https://d123.cloudfront.net` -> **S3 Bucket** (React App).
2.  React App makes fetch request to `/api/voices`.
3.  Browser sends request to `https://d123.cloudfront.net/api/voices`.
4.  CloudFront sees `/api/*` pattern -> Forwards to **Backend-ALB** via **HTTP**.
5.  Backend responds -> CloudFront forwards response to Browser via **HTTPS**.
