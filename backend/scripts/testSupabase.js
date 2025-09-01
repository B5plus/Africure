const { supabase, testSupabaseConnection } = require('../config/supabase');

async function runSupabaseTests() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Basic Connection
    console.log('1. Testing Supabase connection...');
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      console.log('❌ Supabase connection failed\n');
      return;
    }

    // Test 2: Check if Contact table exists and get structure
    console.log('2. Testing Contact table access...');

    // First, let's try different possible table names
    const possibleTableNames = ['Contact', 'contact', 'contacts', 'Contacts'];
    let workingTableName = null;

    for (const tableName of possibleTableNames) {
      console.log(`   Trying table name: ${tableName}`);
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (!tableError) {
        workingTableName = tableName;
        console.log(`✅ Found working table name: ${tableName}`);
        break;
      } else {
        console.log(`   ❌ ${tableName}: ${tableError.message}`);
      }
    }

    if (!workingTableName) {
      console.log('❌ No Contact table found. Please create the table in Supabase with these columns:');
      console.log('   - id (int8, primary key, auto-increment)');
      console.log('   - Full_Name (text)');
      console.log('   - Email_id (text)');
      console.log('   - Contact (text)');
      console.log('   - Enter_Message (text)');
      console.log('   - created_at (timestamptz, default: now())');
      console.log('   - updated_at (timestamptz, default: now())');
      return;
    }

    // Test 3: Get table count
    console.log('3. Getting current records count...');
    const { count, error: countError } = await supabase
      .from(workingTableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting count:', countError.message);
      return;
    }
    console.log(`✅ Current records in Contact table: ${count}`);

    // Test 4: Test Insert (and then delete)
    console.log('4. Testing insert operation...');
    const testContact = {
      Full_Name: 'Test User',
      Email_id: 'test@africurepharma.com',
      Contact: '+1234567890',
      Enter_Message: 'This is a test message from the backend API.'
    };

    const { data: insertData, error: insertError } = await supabase
      .from(workingTableName)
      .insert([testContact])
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      return;
    }
    console.log('✅ Test record inserted with ID:', insertData[0].id);

    // Test 5: Test Read
    console.log('5. Testing read operation...');
    const { data: readData, error: readError } = await supabase
      .from(workingTableName)
      .select('*')
      .eq('id', insertData[0].id)
      .single();

    if (readError) {
      console.error('❌ Read test failed:', readError.message);
      return;
    }
    console.log('✅ Test record read successfully:', readData.Full_Name);

    // Test 6: Test Update
    console.log('6. Testing update operation...');
    const { error: updateError } = await supabase
      .from(workingTableName)
      .update({ Enter_Message: 'Updated test message' })
      .eq('id', insertData[0].id);

    if (updateError) {
      console.error('❌ Update test failed:', updateError.message);
      return;
    }
    console.log('✅ Test record updated successfully');

    // Test 7: Test Delete (cleanup)
    console.log('7. Testing delete operation (cleanup)...');
    const { error: deleteError } = await supabase
      .from(workingTableName)
      .delete()
      .eq('id', insertData[0].id);

    if (deleteError) {
      console.error('❌ Delete test failed:', deleteError.message);
      return;
    }
    console.log('✅ Test record deleted successfully');

    console.log('\n🎉 All Supabase tests passed! Backend is ready to use.\n');

    // Display connection info
    console.log('📊 Connection Information:');
    console.log(`   Supabase URL: ${process.env.SUPABASE_URL}`);
    console.log(`   Project Ref: spulbnzwcylxgjshbkes`);
    console.log(`   Table: Contact`);
    console.log(`   Total Records: ${count}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
  }
}

// Run tests
runSupabaseTests();
