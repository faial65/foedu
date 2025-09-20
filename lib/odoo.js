const xmlrpc = require('xmlrpc');

class OdooConnection {
  constructor() {
    this.url = process.env.ODOO_URL;
    this.database = process.env.ODOO_DATABASE;
    this.username = process.env.ODOO_USERNAME;
    this.password = process.env.ODOO_PASSWORD;
    this.uid = null;
  }

  // Authenticate with Odoo
  async authenticate() {
    const common = xmlrpc.createClient({
      host: this.url,
      port: 80,
      path: '/xmlrpc/2/common'
    });

    return new Promise((resolve, reject) => {
      common.methodCall('authenticate', [
        this.database,
        this.username,
        this.password,
        {}
      ], (error, uid) => {
        if (error) {
          reject(error);
        } else {
          this.uid = uid;
          resolve(uid);
        }
      });
    });
  }

  // Execute method on Odoo model
  async execute(model, method, args = [], kwargs = {}) {
    if (!this.uid) {
      await this.authenticate();
    }

    const models = xmlrpc.createClient({
      host: this.url,
      port: 80,
      path: '/xmlrpc/2/object'
    });

    return new Promise((resolve, reject) => {
      models.methodCall('execute_kw', [
        this.database,
        this.uid,
        this.password,
        model,
        method,
        args,
        kwargs
      ], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Create a new user in Odoo
  async createUser(userData) {
    try {
      const userId = await this.execute('res.partner', 'create', [{
        name: userData.name,
        email: userData.email,
        clerk_user_id: userData.clerkUserId,
        phone: userData.phone || '',
        is_company: false,
        customer_rank: 1,
        // Add any additional fields you want to store
        street: userData.address?.street || '',
        city: userData.address?.city || '',
        country_id: userData.address?.country || null,
      }]);
      
      return userId;
    } catch (error) {
      console.error('Error creating user in Odoo:', error);
      throw error;
    }
  }

  // Update user in Odoo
  async updateUser(clerkUserId, userData) {
    try {
      // Find user by clerk_user_id
      const userIds = await this.execute('res.partner', 'search', [
        [['clerk_user_id', '=', clerkUserId]]
      ]);

      if (userIds.length > 0) {
        await this.execute('res.partner', 'write', [
          userIds,
          {
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            country_id: userData.address?.country || null,
          }
        ]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating user in Odoo:', error);
      throw error;
    }
  }

  // Delete user in Odoo
  async deleteUser(clerkUserId) {
    try {
      // Find user by clerk_user_id
      const userIds = await this.execute('res.partner', 'search', [
        [['clerk_user_id', '=', clerkUserId]]
      ]);

      if (userIds.length > 0) {
        await this.execute('res.partner', 'unlink', [userIds]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting user in Odoo:', error);
      throw error;
    }
  }

  // Get user from Odoo by Clerk ID
  async getUserByClerkId(clerkUserId) {
    try {
      const userIds = await this.execute('res.partner', 'search', [
        [['clerk_user_id', '=', clerkUserId]]
      ]);

      if (userIds.length > 0) {
        const users = await this.execute('res.partner', 'read', [
          userIds,
          ['name', 'email', 'phone', 'clerk_user_id', 'street', 'city', 'country_id']
        ]);
        return users[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user from Odoo:', error);
      throw error;
    }
  }
}

module.exports = OdooConnection;