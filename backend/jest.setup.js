// jest.setup.js
const mongoose = require('mongoose')
require('dotenv').config()

let mongooseInstance // Add this line

module.exports = async () => {
  mongooseInstance = new mongoose.Mongoose() // Create a new Mongoose instance

  await mongooseInstance.connect(process.env.MONGO_URL_TEST)

  global.__MONGOOSE__ = mongooseInstance // Store the mongoose instance in global scope

  console.log('Mongoose connection established for testing.') // Add this line
}
