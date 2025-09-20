# Odoo Integration Setup Guide

This document provides step-by-step instructions to set up the Odoo database integration with Clerk authentication for your education platform.

## Prerequisites

1. **Odoo Instance**: You need access to an Odoo instance (self-hosted or cloud)
2. **Clerk Account**: Set up a Clerk account for authentication
3. **Database Access**: Admin or sufficient permissions in Odoo

## Step 1: Configure Odoo Database

### 1.1 Add Custom Fields to res.partner Model

You need to add a custom field to store the Clerk user ID. Follow the instructions in `docs/odoo-user-model.md`.

**Quick Setup via Odoo Interface:**
1. Enable Developer mode in Odoo
2. Go to Settings > Technical > Database Structure > Models
3. Search for "res.partner"
4. Click on "Fields" tab
5. Create a new field:
   - Field Name: `clerk_user_id`
   - Field Label: "Clerk User ID"
   - Field Type: "Char"
   - Required: No (but should be unique)

### 1.2 Enable XML-RPC Access

Ensure XML-RPC is enabled in your Odoo configuration:
```ini
# In your Odoo configuration file
xmlrpc = True
xmlrpc_port = 8069
```

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your actual values:

```bash
# Clerk Configuration (get from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key
CLERK_SECRET_KEY=sk_test_your_actual_key
CLERK_WEBHOOK_SECRET=whsec_your_actual_secret

# Odoo Configuration
ODOO_URL=your-odoo-domain.com
ODOO_DATABASE=your_database_name
ODOO_USERNAME=your_odoo_username
ODOO_PASSWORD=your_odoo_password
```

## Step 3: Set Up Clerk Webhooks

1. Go to your Clerk Dashboard
2. Navigate to "Webhooks" section
3. Create a new webhook endpoint:
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Events to subscribe**: 
     - `user.created`
     - `user.updated` 
     - `user.deleted`
4. Copy the webhook secret to your `.env.local` file

## Step 4: Test the Integration

### 4.1 Test Odoo Connection

Create a test script to verify your Odoo connection:

```javascript
// test-odoo.js
const OdooConnection = require('./lib/odoo.js');

async function testConnection() {
  const odoo = new OdooConnection();
  
  try {
    const uid = await odoo.authenticate();
    console.log('Authentication successful, UID:', uid);
    
    // Test creating a user
    const testUser = {
      clerkUserId: 'test-clerk-id-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890'
    };
    
    const userId = await odoo.createUser(testUser);
    console.log('Test user created with ID:', userId);
    
    // Clean up - delete test user
    await odoo.deleteUser('test-clerk-id-123');
    console.log('Test user deleted');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
```

Run the test:
```bash
node test-odoo.js
```

### 4.2 Test Webhook Locally

Use ngrok or similar tool to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose your Next.js app
ngrok http 3000
```

Update your Clerk webhook URL to use the ngrok URL.

## Step 5: Production Deployment

1. **Deploy your Next.js app** to Vercel, Netlify, or your preferred platform
2. **Update Clerk webhook URL** to point to your production domain
3. **Set environment variables** in your production environment
4. **Test the complete flow** by registering a new user

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure all dependencies are installed: `npm install`
   - Check that file paths are correct

2. **Odoo connection errors**
   - Verify your Odoo credentials
   - Check that XML-RPC is enabled
   - Ensure your IP is whitelisted (if applicable)

3. **Webhook verification failed**
   - Double-check your webhook secret
   - Ensure the webhook URL is accessible
   - Check Clerk webhook logs for details

4. **User creation fails**
   - Verify the custom field exists in Odoo
   - Check user permissions in Odoo
   - Review error logs for specific issues

### Debug Mode

Add debug logging to track issues:

```javascript
// In your webhook handler
console.log('Received webhook:', JSON.stringify(evt, null, 2));
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Webhook Secrets**: Always verify webhook signatures
3. **Database Access**: Use a dedicated Odoo user with minimal required permissions
4. **Error Handling**: Don't expose sensitive information in error messages

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each component individually (Clerk auth, Odoo connection, webhooks)
4. Review the Clerk and Odoo documentation for any API changes