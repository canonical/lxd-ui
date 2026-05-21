// 'use strict';

// const Client = require('ssh2-sftp-client');

// const config = {
//   host: 'example.com',
//   username: 'donald',
//   password: 'my-secret'
// };

// const sftp = new Client('example-client');

// sftp.connect(config)
//   .then(() => {
//     return sftp.cwd();
//   })
//   .then(p => {
//     console.log(`Remote working directory is ${p}`);
//     return sftp.end();
//   })
//   .catch(err => {
//     console.log(`Error: ${err.message}`); // error message will include 'example-client'
//   });