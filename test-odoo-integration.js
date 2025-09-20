const OdooConnection = require('./lib/odoo.js');

async function testOdooConnection() {
  console.log('Testing Odoo connection...');
  
  const odoo = new OdooConnection();
  
  try {
    // Test authentication
    console.log('1. Testing authentication...');
    const uid = await odoo.authenticate();
    console.log('✅ Authentication successful, UID:', uid);
    
    // Test creating a user
    console.log('2. Testing user creation...');
    const testUser = {
      clerkUserId: 'test-clerk-id-' + Date.now(),
      name: 'Test User Integration',
      email: 'test-integration@example.com',
      phone: '+1234567890'
    };
    
    const userId = await odoo.createUser(testUser);
    console.log('✅ Test user created with ID:', userId);
    
    // Test reading the user
    console.log('3. Testing user retrieval...');
    const retrievedUser = await odoo.getUserByClerkId(testUser.clerkUserId);
    console.log('✅ User retrieved:', retrievedUser);
    
    // Test updating the user
    console.log('4. Testing user update...');
    const updateData = {
      name: 'Updated Test User',
      email: 'updated-test@example.com',
      phone: '+0987654321'
    };
    
    const updated = await odoo.updateUser(testUser.clerkUserId, updateData);
    console.log('✅ User update result:', updated);
    
    // Test deleting the user
    console.log('5. Testing user deletion...');
    const deleted = await odoo.deleteUser(testUser.clerkUserId);
    console.log('✅ User deletion result:', deleted);
    
    console.log('\n🎉 All tests passed! Odoo integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testOdooConnection();