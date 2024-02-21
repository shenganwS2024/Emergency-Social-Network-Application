console.log("entry point")

import {http} from './server.js' // Import the app from server.js
const port = 3000;

http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});