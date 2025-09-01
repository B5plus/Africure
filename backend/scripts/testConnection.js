const { sequelize, testConnection } = require('../config/database');
const Contact = require('../models/Contact');

async function runTests() {
  console.log('🔍 Testing Africure Pharma Backend...\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    if (isConnected) {
      console.log('✅ Database connection successful\n');
    } else {
      console.log('❌ Database connection failed\n');
      return;
    }

    // Test 2: Model Sync
    console.log('2. Testing model synchronization...');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized successfully\n');

    // Test 3: Create Test Contact
    console.log('3. Testing contact creation...');
    const testContact = await Contact.create({
      Full_Name: 'Test User',
      Email_id: 'test@africurepharma.com',
      Contact: '+1234567890',
      Enter_Message: 'This is a test message for the contact form functionality.'
    });
    console.log('✅ Test contact created with ID:', testContact.id);

    // Test 4: Read Test Contact
    console.log('4. Testing contact retrieval...');
    const retrievedContact = await Contact.findByPk(testContact.id);
    console.log('✅ Contact retrieved:', {
      id: retrievedContact.id,
      name: retrievedContact.Full_Name,
      email: retrievedContact.Email_id
    });

    // Test 5: Update Test Contact
    console.log('5. Testing contact update...');
    await retrievedContact.update({
      Enter_Message: 'Updated test message'
    });
    console.log('✅ Contact updated successfully');

    // Test 6: Delete Test Contact
    console.log('6. Testing contact deletion...');
    await retrievedContact.destroy();
    console.log('✅ Test contact deleted successfully\n');

    // Test 7: Model Methods
    console.log('7. Testing custom model methods...');
    
    // Create a few test contacts
    const contacts = await Contact.bulkCreate([
      {
        Full_Name: 'John Doe',
        Email_id: 'john@example.com',
        Contact: '+1111111111',
        Enter_Message: 'Test message 1'
      },
      {
        Full_Name: 'Jane Smith',
        Email_id: 'jane@example.com',
        Contact: '+2222222222',
        Enter_Message: 'Test message 2'
      }
    ]);

    console.log('✅ Bulk contacts created');

    // Test findByEmail method
    const foundContact = await Contact.findByEmail('john@example.com');
    console.log('✅ Found contact by email:', foundContact.Full_Name);

    // Test findRecent method
    const recentContacts = await Contact.findRecent(5);
    console.log('✅ Recent contacts count:', recentContacts.length);

    // Clean up test data
    await Contact.destroy({
      where: {
        Email_id: ['john@example.com', 'jane@example.com']
      }
    });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! Backend is ready to use.\n');

    // Display connection info
    console.log('📊 Connection Information:');
    console.log(`   Database: ${sequelize.config.database}`);
    console.log(`   Host: ${sequelize.config.host}`);
    console.log(`   Port: ${sequelize.config.port}`);
    console.log(`   SSL: ${sequelize.config.dialectOptions?.ssl ? 'Enabled' : 'Disabled'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
  } finally {
    // Close connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run tests
runTests();
