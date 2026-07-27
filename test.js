const app = require('./dist/app').default;
const server = app.listen(5000, () => {
  console.log('Server started on 5000');
});
setInterval(() => {}, 10000); // keep alive
