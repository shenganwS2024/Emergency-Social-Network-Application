console.log("entry point")

const app = require('./server'); // Import the app from server.js
const port = 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
