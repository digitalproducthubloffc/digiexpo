const express = require('express');
const multer = require('multer');
const app = express();
app.post('/', multer({ storage: multer.diskStorage({ destination: 'missing_dir/' }) }).single('media'), (req, res) => res.send('OK'));
const server = app.listen(7777, () => {
  console.log('started');
  const { exec } = require('child_process');
  exec('curl -X POST -F "text=hi" http://localhost:7777', (err, stdout, stderr) => {
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);
    server.close();
  });
});
