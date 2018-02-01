const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (request, response) => response.sendFile('index.html', { root: __dirname + '\\dist' }))
    .use(express.static('dist'))    
    .listen(port, () => console.log('listening on port ' + port));