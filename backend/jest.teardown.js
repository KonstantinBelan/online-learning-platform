module.exports = async () => {
  if (global.__MONGOOSE__) {
    await global.__MONGOOSE__.disconnect()
    console.log('Mongoose connection closed for testing.') // Add this line
  }
}
