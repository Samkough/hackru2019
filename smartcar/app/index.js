'use strict';

const cors = require('cors');
const express = require('express');
const smartcar = require('smartcar');

const app = express()
  .use(cors());
const port = 8000;

const client = new smartcar.AuthClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  scope: ['read_vehicle_info read_odometer read_location'],
  testMode: true, 
});

let access;

app.get('/login', function(req, res) {
  const link = client.getAuthUrl();
  res.redirect(link);
});

app.get('/exchange', function(req, res) {
  const code = req.query.code;

  return client.exchangeCode(code)
  .then(function(_access) {
    access = _access
    res.sendStatus(200);
  })
});

app.get('/vehicle', function(req, res) {
  return smartcar.getVehicleIds(access.accessToken)
    .then(function(data) {
      return data.vehicles;
    })    
    .then(function(vehicleIds) {
      const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);
      return vehicle.info();
    })
    .then(function(info) {
      res.json(info);
      console.log(info);
    });
});


app.get('/vehicle/location', function(req, res) {
  return smartcar.getVehicleIds(access.accessToken)
    .then(function(data) {
      return data.vehicles;
    })    
    .then(function(vehicleIds) {
      const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);
      return vehicle.location();
    })
    .then(function(info) {
      res.json(info.data.latitude);
      res.json(info.data.longitude);
      console.log(info);
    });
});

app.get('/vehicle/distance', function(req, res) {
  return smartcar.getVehicleIds(access.accessToken)
    .then(function(data) {
      return data.vehicles;
    })    
    .then(function(vehicleIds) {
      const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);
      return vehicle.odometer();
    })
    .then(function(info) {
      res.json(info.data.distance);
      console.log(info);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
