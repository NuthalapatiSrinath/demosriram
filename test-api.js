// Test file to verify API endpoints
// Run this with: node test.js

import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000/api";

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { error: error.message };
  }
}

// Test functions
async function testHealthCheck() {
  console.log("\n🔍 Testing Health Check...");
  const result = await makeRequest("GET", "/health");
  console.log("Status:", result.status);
  console.log("Response:", result.data);
}

async function testUserRegistration() {
  console.log("\n🔍 Testing User Registration...");
  const userData = {
    name: "Test User",
    email: `testuser${Date.now()}@example.com`,
    password: "TestPassword123!",
    confirmPassword: "TestPassword123!",
  };
  const result = await makeRequest("POST", "/user/auth/register", userData);
  console.log("Status:", result.status);
  console.log("Response:", result.data);
  return result.data;
}

async function testUserLogin(email, password) {
  console.log("\n🔍 Testing User Login...");
  const result = await makeRequest("POST", "/user/auth/login", {
    email,
    password,
  });
  console.log("Status:", result.status);
  console.log("Response:", result.data);
  return result.data;
}

async function testGetProfile(token) {
  console.log("\n🔍 Testing Get User Profile...");
  const result = await makeRequest("GET", "/user/auth/me", null, token);
  console.log("Status:", result.status);
  console.log("Response:", result.data);
}

async function testAdminLogin() {
  console.log("\n🔍 Testing Admin Login...");
  // Note: You need to create an admin user first
  const result = await makeRequest("POST", "/admin/auth/login", {
    email: "admin@example.com", // Change this to your admin email
    password: "AdminPassword123!", // Change this to your admin password
  });
  console.log("Status:", result.status);
  console.log("Response:", result.data);
  return result.data;
}

// Run all tests
async function runTests() {
  console.log("====================================");
  console.log("🧪 Starting API Tests");
  console.log("====================================");

  try {
    // Test 1: Health Check
    await testHealthCheck();

    // Test 2: User Registration
    const registerResult = await testUserRegistration();

    if (registerResult.success) {
      const userEmail = registerResult.data.email;

      // Test 3: User Login
      const loginResult = await testUserLogin(userEmail, "TestPassword123!");

      if (loginResult.success && loginResult.data.accessToken) {
        // Test 4: Get Profile
        await testGetProfile(loginResult.data.accessToken);
      }
    }

    // Test 5: Admin Login (optional - only if you have admin user)
    // await testAdminLogin();

    console.log("\n====================================");
    console.log("✅ Tests Completed");
    console.log("====================================\n");
  } catch (error) {
    console.error("❌ Test Error:", error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests, makeRequest };
