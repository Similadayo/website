const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function resetPassword() {
  const email = "admin@brancr.com";
  const newPassword = "admin123";
  
  console.log(`📡 Initiating Direct Tactical Password Reset for ${email}...`);
  
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.AUTH_TOKEN,
  });

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await client.execute({
      sql: "UPDATE User SET passwordHash = ? WHERE email = ?",
      args: [hash, email]
    });
    
    console.log("✅ Mission Success: Password has been reset.");
    console.log(`🔐 Credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${newPassword}`);
  } catch (err) {
    console.error("❌ Mission Failure:", err.message);
  }
}

resetPassword();
