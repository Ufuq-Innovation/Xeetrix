// app/api/customers/import/route.js - পুরো ফাইলটি এই কোড দিয়ে replace করুন

import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = process.env.MONGODB_DB || "xeetrix";

async function connectDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }
    return client.db(dbName);
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Database connection failed");
  }
}

// Simple CSV parser function
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return [];
  }
  
  const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < currentLine.length; j++) {
      const char = currentLine[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue.trim().replace(/^"|"$/g, ''));
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    result.push(row);
  }
  
  return result;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { success: false, message: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }
    
    // Read file
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8').decode(buffer);
    
    // Parse CSV
    const records = parseCSV(text);
    
    if (records.length === 0) {
      return NextResponse.json(
        { success: false, message: 'CSV file is empty or invalid' },
        { status: 400 }
      );
    }
    
    const db = await connectDB();
    const customersCollection = db.collection('customers');
    
    let importedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Extract data from CSV (case insensitive)
        const name = record.name || record.Name || record['Customer Name'] || '';
        const email = record.email || record.Email || '';
        const phone = record.phone || record.Phone || record['Phone Number'] || '';
        const address = record.address || record.Address || '';
        const city = record.city || record.City || '';
        const country = record.country || record.Country || '';
        const company = record.company || record.Company || '';
        const status = record.status || record.Status || 'active';
        const customerType = record.type || record.Type || record['Customer Type'] || 'regular';
        
        // Validate required fields
        if (!name.trim()) {
          errors.push(`Row ${i + 1}: Name is required`);
          errorCount++;
          continue;
        }
        
        if (!phone.trim()) {
          errors.push(`Row ${i + 1}: Phone is required`);
          errorCount++;
          continue;
        }
        
        // Clean phone number
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Check for duplicates
        const existingCustomer = await customersCollection.findOne({
          $or: [
            { phone: cleanPhone },
            { email: email?.trim() || '' }
          ]
        });
        
        if (existingCustomer) {
          errors.push(`Row ${i + 1}: Customer with this phone/email already exists`);
          errorCount++;
          continue;
        }
        
        // Create customer object
        const customer = {
          name: name.trim(),
          email: email?.trim() || '',
          phone: cleanPhone,
          address: address?.trim() || '',
          city: city?.trim() || '',
          country: country?.trim() || '',
          company: company?.trim() || '',
          status: status.toLowerCase(),
          customerType: customerType.toLowerCase(),
          totalPurchases: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert into database
        await customersCollection.insertOne(customer);
        importedCount++;
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Imported ${importedCount} customers successfully`,
      summary: {
        total: records.length,
        imported: importedCount,
        errors: errorCount,
        errorMessages: errors.slice(0, 10) // Return first 10 errors only
      }
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}