'use strict';

const cors = require('cors');
const express = require('express');
const smartcar = require('smartcar');

const app = express()
  .use(cors());
const port = 8000;

// TODO: Authorization Step 1a: Launch Smartcar authentication dialog
const client = new smartcar.AuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,

  // takes in the list of permissions an application wants access to
  /*  For example, since our application wants to display vehicle
  information, we are requesting for the read_vehicle_info permission
   */
  scope: ['read_vehicle_info read_odometer'],
  testMode: true, // allow you to send a request to simulated accounts and vehicles on the Smartcar platform
});

// global variable to save our accessToken
let access;

app.get('/login', function(req, res) {
  // TODO: Authorization Step 1b: Launch Smartcar authentication dialog
  const link = client.getAuthUrl();
  res.redirect(link);
});

app.get('/exchange', function(req, res) {
  // TODO: Authorization Step 3: Handle Smartcar response
  const code = req.query.code;

  return client.exchangeCode(code)
  .then(function(_access) {
    access = _access
    res.sendStatus(200);
  })
//  console.log(code);
//  res.sendStatus(200);
});

app.get('/vehicle', function(req, res) {
  // TODO: Request Step 2: Get vehicle ids
  return smartcar.getVehicleIds(access.accessToken)
    .then(function(data) { // Request Step 2: Get vehicle ids; the list of vehicle ids
      return data.vehicles;
    })    
    .then(function(vehicleIds) { // Request Step 3: Create a vehicle; instantiate the first vehicle in the vehicle id list
      const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);
      return vehicle.odometer();
    })
    .then(function(info) { // Request Step 4: Make a request to Smartcar API
      res.json(info);
      console.log(info.data.distance);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
