const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://joelk9895:3YNuuINfjenyOnC9@opinio.qkbdnis.mongodb.net/ethereal-techno?retryWrites=true&w=majority&appName=opinio';
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log('Connected correctly to server');
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
run();
