// Test Supabase connection
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://rtaofvqxfkddhahelnqy.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YW9mdnF4ZmtkZGhhaGVsbnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDg2OTksImV4cCI6MjA1OTA4NDY5OX0.xKI2VsXE-G_NTPXkVdEy8yIJnOZaZmwX7br-s4tIDmE"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log("🔄 Testing Supabase connection...")

    // Test basic connection
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.log("⚠️  Database tables not created yet. Run the SQL script first!")
      console.log("Error:", error.message)
    } else {
      console.log("✅ Supabase connection successful!")
      console.log("📊 Database is ready for your GlobalStream app")
    }

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log("🔐 Auth service:", authError ? "Error" : "Ready")
  } catch (err) {
    console.error("❌ Connection failed:", err.message)
  }
}

testConnection()
