// testAadhaarApi.js
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

const API_URL = "https://gokul2cid-aadhaar-api.hf.space/extract_aadhaar/";

// Path to your local Aadhaar PDF file (replace with actual path)
const filePath = "EAadhaar_0013280030296420250906163142_1109202561758_unlocked.pdf";

async function testAadhaarApi() {
  try {
    // Read file from disk
    const fileStream = fs.createReadStream(filePath);

    // Create form data
    const formData = new FormData();
    formData.append("pdf_file", fileStream, "sample-aadhaar.pdf");

    console.log("⏳ Sending request to:", API_URL);

    // Send POST request
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    // Parse response
    const data = await response.json();

    console.log("✅ API Response:");
    console.log(JSON.stringify(data.details, null, 2));
  } catch (error) {
    console.error("❌ Error testing Aadhaar API:", error.message);
  }
}

testAadhaarApi();
