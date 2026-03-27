# SSO Integration Guide for Target Systems

This guide explains how to integrate with the PFS Portal Hub SSO system.

## Overview

The PFS Portal Hub uses a token-based SSO mechanism. When a user clicks on a system link from the Hub:

1. Hub generates a short-lived JWT token (5 minutes expiration)
2. User is redirected to the target system with the token
3. Target system validates the token and creates a local session

## Integration Steps

### 1. Receive SSO Token

When a user is redirected from the Hub, they will arrive at your system with these query parameters:

```
https://your-system.com/login?sso_token=eyJhbG...&hub_origin=https://hub.pfs-portal.com
```

### 2. Validate the Token

Send the token to the Hub's validation endpoint:

```javascript
const validateSSOToken = async (token) => {
  const response = await fetch('https://hub.pfs-portal.com/api/sso/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      token,
      systemId: 'your-system-id' // e.g., 'moldshop', 'hr-employee'
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid or expired token');
  }

  return await response.json();
};
```

### 3. Handle the Response

Successful validation returns:

```json
{
  "success": true,
  "user": {
    "hubUserId": "uuid-from-hub",
    "hubEmail": "user@company.com",
    "hubUserMetadata": {
      "full_name": "John Doe",
      "role": "admin"
    },
    "systemId": "your-system-id",
    "userMapping": {
      "localUsername": "john.doe",
      "localEmail": "john@local.com"
    }
  }
}
```

### 4. Create Local Session

Based on the validated user data:

1. **Find or create local user** using `hubUserId` or `userMapping`
2. **Create local session** (JWT, cookie, etc.)
3. **Redirect to your dashboard**

## Example Implementation

### React/Vue Component

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function SSOHandler() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSSO = async () => {
      const token = searchParams.get('sso_token');
      
      if (!token) {
        setIsLoading(false);
        return; // Normal login flow
      }

      try {
        // Validate token with Hub
        const response = await fetch('https://hub.pfs-portal.com/api/sso/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, systemId: 'your-system' }),
        });

        if (!response.ok) {
          throw new Error('SSO validation failed');
        }

        const data = await response.json();
        
        // Create local session
        await createLocalSession({
          userId: data.user.hubUserId,
          email: data.user.hubEmail,
          metadata: data.user.hubUserMetadata,
          mapping: data.user.userMapping,
        });

        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    handleSSO();
  }, [searchParams]);

  if (isLoading) return <div>Connecting to Hub...</div>;
  if (error) return <div>SSO Error: {error}</div>;
  return <div>Please log in manually</div>;
}
```

### Backend Validation (Node.js/Express)

```javascript
const jwt = require('jsonwebtoken');

const HUB_PUBLIC_KEY = process.env.HUB_PUBLIC_KEY; // Get from Hub admin

app.post('/sso/login', async (req, res) => {
  const { sso_token } = req.query;
  
  if (!sso_token) {
    return res.redirect('/login');
  }

  try {
    // Option 1: Validate locally with public key
    const decoded = jwt.verify(sso_token, HUB_PUBLIC_KEY);
    
    // Option 2: Validate via Hub API (recommended)
    const hubResponse = await fetch('https://hub.pfs-portal.com/api/sso/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sso_token }),
    });

    if (!hubResponse.ok) {
      throw new Error('Invalid token');
    }

    const { user } = await hubResponse.json();

    // Find or create local user
    let localUser = await db.users.findOne({ hubUserId: user.hubUserId });
    
    if (!localUser) {
      // Create new user from Hub data
      localUser = await db.users.create({
        hubUserId: user.hubUserId,
        email: user.hubEmail,
        name: user.hubUserMetadata.full_name,
        // Your custom fields
      });
    }

    // Create local session
    req.session.userId = localUser.id;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('SSO error:', error);
    res.redirect('/login?error=sso_failed');
  }
});
```

## Security Considerations

1. **Token Expiration**: Tokens expire after 5 minutes. Validate immediately upon receipt.

2. **HTTPS Only**: Always use HTTPS for token transmission.

3. **Token Storage**: Don't store SSO tokens. Use them immediately to create local sessions.

4. **User Mapping**: Store `hubUserId` in your user table for future SSO connections.

5. **Logout**: When user logs out of your system, optionally redirect to Hub logout:
   ```
   https://hub.pfs-portal.com/logout?redirect=https://your-system.com
   ```

## API Reference

### Generate SSO Token (Hub Only)

```
POST /api/sso/token
Authorization: Bearer <user-session>
Content-Type: application/json

{
  "systemId": "moldshop",
  "targetUrl": "https://moldshop.vercel.app/",
  "userMapping": {
    "localUsername": "john.doe"
  }
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbG...",
  "redirectUrl": "https://moldshop.vercel.app/?sso_token=eyJhbG...",
  "expiresIn": "5 minutes"
}
```

### Validate SSO Token

```
POST /api/sso/validate
Content-Type: application/json

{
  "token": "eyJhbG...",
  "systemId": "optional-system-check"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "hubUserId": "...",
    "hubEmail": "...",
    "hubUserMetadata": {...},
    "systemId": "...",
    "userMapping": {...}
  }
}
```

## Support

For SSO integration support, contact:
- Email: admin@pfs-portal.com
- Slack: #sso-support

## Testing

Test SSO flow:
1. Log in to Hub: https://hub.pfs-portal.com/login
2. Go to Dashboard
3. Click on your system
4. Verify automatic login works
