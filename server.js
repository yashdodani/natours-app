const dotenv = require('dotenv');

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

// const Tour = require('./models/tourModel');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION!! SHUTTING DOWN....');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection succesfull');
  });

const app = require('./app');

// const testTour = new Tour({
//   name: 'The Forest Hiker333',
//   rating: 4.7,
//   price: 498,
// });

// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => {
//     console.log(err, 'Error');
//   });
// console.log(app.get('env'));
// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!! SHUTTING DOWN....');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECIEVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated...');
  });
});
