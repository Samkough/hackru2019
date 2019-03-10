const account_sid = "AC72f3f07b48fcfd0cbbd010f4c793d065";
const auth_token = "d1e5857438697517f702771624798bf2";
const client = require("twilio")(account_sid, auth_token);

const numebrs = [+19373564622];

client.messages
  .create({
    body: "this is a test message",
    from: "+12019925909",
    to: "+19733564622"
  })
  .then(message => {
    console.log(message);
  });
