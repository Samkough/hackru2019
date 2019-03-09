const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const MessageResponse = require("twilio").twiml.MessagingResponse;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

var data = [{}];
app.post("/", (req, res) => {
  var error;
  var cost, milage;

  const twiml = new MessageResponse();
  const message = req.body.Body;

  //parse message
  message_split = message.split(",");
  message_split.forEach(item => {
    if (item.charAt(0) == "$" && !cost) {
      cost = item.substring(1);
    } else if (item.charAt(0) == "$" && cost) {
      errors = "input error";
    } else {
      milage = item;
    }
  });

  newData = {
    vin: 1337,
    cost: cost,
    milage: milage,
    date: new Date()
  };

  console.log(`cost: ${cost}, milage: ${milage}`);
  console.log(newData);
  if (error) twiml.message(error);
  else twiml.message(message);
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

const port = process.env.port || 5000;
http.createServer(app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
