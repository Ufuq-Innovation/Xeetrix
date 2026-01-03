import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // ডেভেলপমেন্ট মোডে গ্লোবাল ভেরিয়েবল ব্যবহার করা হয় যেন রিফ্রেশ দিলেও কানেকশন বারবার না তৈরি হয়
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // প্রোডাকশন বা ভার্সেল মোডে সরাসরি কানেক্ট হবে
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;