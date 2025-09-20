import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import OdooConnection from '@/lib/odoo.js';

const odoo = new OdooConnection();

export async function POST(req) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', {
      status: 500
    });
  }

  return new Response('', { status: 200 });
}

async function handleUserCreated(userData) {
  console.log('Creating user in Odoo:', userData.id);
  
  const userPayload = {
    clerkUserId: userData.id,
    name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username || 'Unknown User',
    email: userData.email_addresses?.[0]?.email_address || '',
    phone: userData.phone_numbers?.[0]?.phone_number || '',
    address: {
      street: userData.public_metadata?.address?.street || '',
      city: userData.public_metadata?.address?.city || '',
      country: userData.public_metadata?.address?.country || null,
    }
  };

  try {
    const odooUserId = await odoo.createUser(userPayload);
    console.log('User created in Odoo with ID:', odooUserId);
  } catch (error) {
    console.error('Failed to create user in Odoo:', error);
    throw error;
  }
}

async function handleUserUpdated(userData) {
  console.log('Updating user in Odoo:', userData.id);
  
  const userPayload = {
    name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username || 'Unknown User',
    email: userData.email_addresses?.[0]?.email_address || '',
    phone: userData.phone_numbers?.[0]?.phone_number || '',
    address: {
      street: userData.public_metadata?.address?.street || '',
      city: userData.public_metadata?.address?.city || '',
      country: userData.public_metadata?.address?.country || null,
    }
  };

  try {
    const updated = await odoo.updateUser(userData.id, userPayload);
    if (updated) {
      console.log('User updated in Odoo');
    } else {
      console.log('User not found in Odoo for update');
    }
  } catch (error) {
    console.error('Failed to update user in Odoo:', error);
    throw error;
  }
}

async function handleUserDeleted(userData) {
  console.log('Deleting user from Odoo:', userData.id);
  
  try {
    const deleted = await odoo.deleteUser(userData.id);
    if (deleted) {
      console.log('User deleted from Odoo');
    } else {
      console.log('User not found in Odoo for deletion');
    }
  } catch (error) {
    console.error('Failed to delete user from Odoo:', error);
    throw error;
  }
}