# Troubleshooting CloudFront API Errors (Unexpected Token '<')

If you are seeing errors like `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` in your console, it means your React application is receiving HTML (likely `index.html`) when it expects JSON from the API.

This usually happens in a CloudFront + S3 + SPA setup when:
1.  **CloudFront is not routing API requests to the Backend.**
2.  **The Backend is returning a 404/403, and CloudFront is replacing it with `index.html`.**

## Step 1: Check CloudFront Behaviors

1.  Go to the AWS Console -> CloudFront -> Distributions -> Select your distribution.
2.  Click the **Behaviors** tab.
3.  **Check Precedence:** You should see a behavior for `/api/*` (or `api/*`) **ABOVE** the Default `*` behavior.
    *   *Correct:*
        1. `/api/*` -> Backend-ALB
        2. `Default (*)` -> S3-Bucket
    *   *Incorrect (Requests fall through to S3):*
        1. `Default (*)` -> S3-Bucket
4.  **Check Path Pattern:** Ensure the pattern matches your requests.
    *   If your app requests `/api/voices`, the pattern must be `/api/*`.
    *   If you use `api/*` (no leading slash), it matches relative paths, which usually works but `/api/*` is safer.

## Step 2: Check "Custom Error Responses"

SPAs (Single Page Apps) often have Custom Error Responses configured in CloudFront to handle client-side routing:
*   **404 Not Found** -> `/index.html` (Status: 200 OK)
*   **403 Forbidden** -> `/index.html` (Status: 200 OK)

**The Problem:**
If your Backend returns a 404 (e.g., wrong endpoint) or 403, CloudFront might intercept it and serve the `index.html` from S3 instead of letting the 404 pass through to the app.

**Verification:**
1.  Open your browser's Network Tab.
2.  Filter by `XHR` or `Fetch`.
3.  Reload the page.
4.  Click on the failing request (e.g., `voices`).
5.  Look at the **Response** tab.
    *   If you see HTML code starting with `<!DOCTYPE html>`, CloudFront is serving the frontend app instead of the API response.

## Step 3: Check Backend Path

Does your backend actually expect `/api` in the path?
*   **Scenario A:** Backend expects `/voices`.
    *   Frontend sends: `/api/voices`
    *   CloudFront sends to ALB: `/api/voices`
    *   Backend returns: `404 Not Found`
    *   CloudFront sees 404 -> Returns `index.html` (due to custom error page).
    *   **Fix:** You might need to rewrite the path in CloudFront (using a CloudFront Function) OR update the backend to mount the router at `/api`.

*   **Scenario B:** Backend expects `/api/voices`.
    *   This should work if Step 1 is correct.

## Step 4: Check ALB Security Groups

Ensure your ALB Security Group allows traffic from CloudFront.
*   If the ALB blocks CloudFront, it might timeout or return errors, which CloudFront might handle by showing a default error page (HTML).
