const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");
const MessageResponse = require("twilio").twiml.MessagingResponse;
const cors = require("cors");
const smartcar = require("smartcar");

const app = express().use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

var db = [];

//SmartCar setup
const sc_client = new smartcar.AuthClient({
  clientId: "027d8145-bf3d-4c95-bcec-6286097177fa",
  clientSecret: "90b82f8c-db9f-45b7-989a-c2af6ce02482",
  redirectUri: "http://localhost:5000/exchange",
  scope: ["read_vehicle_info read_odometer read_location"],
  testMode: true
});
let access;

//Routes
app.get("/login", function(req, res) {
  const link = sc_client.getAuthUrl();
  res.redirect(link);
});

function getvehicle() {
  return smartcar
    .getVehicleIds(access.accessToken)
    .then(function(data) {
      return data.vehicles;
    })
    .then(function(vehicleIds) {
      const vehicle = new smartcar.Vehicle(vehicleIds[0], access.accessToken);
      return vehicle;
    })
    .catch(err => console.log(err));
}

app.get("/exchange", function(req, res) {
  const code = req.query.code;

  return sc_client.exchangeCode(code).then(function(_access) {
    access = _access;
    res.sendStatus(200);
  });
});

app.post("/", (req, res) => {
  var error;
  var cost, gals;

  const twiml = new MessageResponse();
  const message = req.body.Body;

  //parse message
  msg_split = message.split(",");

  message_split.forEach(item => {
    if (item.charAt(0) == "$" && cost <= 0) {
      cost = item.substring(1);
    } else if (item.charAt(0) == "$" && cost >= 0) {
      errors = "input error";
    } else {
      gals = item;
    }
  });

  _odometer = getvehicle().then(vehicle => {
    return vehicle.odometer().then(info => {
      return info.data.distance;
    });
  });

  _location = getvehicle().then(vehicle => {
    return vehicle.location().then(info => {
      return info.data;
    });
  });

  Promise.all([_odometer, _location]).then(data => {
    newData = {
      cost: cost,
      odometer: data[0],
      gallons: gals,
      location: data[1],
      date: new Date()
    };
    console.log("========data\n" + JSON.stringify(newData));
    db.push(newData);
    console.log("========db\n" + JSON.stringify(db));
    if (error) twiml.message(error);
    else
      twiml.message(
        `you filled up ${newData.gallons} galons for ${
          newData.cost
        } at position: ${newData.location.latitude}, ${
          newData.location.longitude
        }`
      );
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  });
});

const port = process.env.port || 5000;
http.createServer(app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
