// Test Supabase service role access
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://rtaofvqxfkddhahelnqy.supabase.co"
const serviceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YW9mdnF4ZmtkZGhhaGVsbnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUwODY5OSwiZXhwIjoyMDU5MDg0Njk5fQ.Z0VyOxgnoErUhD_nb705ID26nF6D53LueTqrCnuF_lw"

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testServiceRole() {
  try {
    console.log("🔄 Testing Supabase service role access...")

    // Test admin access
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.log("❌ Service role key error:", error.message)
    } else {
      console.log("✅ Service role key is valid!")
      console.log("👤 User count:", data?.users?.length || 0)
      console.log("🔐 Admin access confirmed")
    }
  } catch (err) {
    console.error("❌ Test failed:", err.message)
  }
}

testServiceRole()
