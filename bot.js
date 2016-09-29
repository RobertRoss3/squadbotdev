var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;
var groupID = process.env.GROUP_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex_damn = /\bdamn\b/i; botRegex_hi = /(\bhi|hello|hey|sup|wassup\b).*?/i;
      botRegex_oneword = /^\b[a-zA-Z0-9_]+\b$/;
      botRegex_wtf = /\bwtf/i;
      botRegex_all = /@all|@squad/;
      botRegex_bot = /@Squadbot.*?/i;
      userName = request.name;
      Greetings = [
        "Hey " + userName, "hello!"];

  if(request.text && botRegex_oneword.test(request.text)) {
    this.res.writeHead(200);
    if (botRegex_damn.test(request.text)) {
      postMessage("- Jamal Rogers");
    }
    // postMessage("Actually, " + request.name + " sent that");
    // postMessage("request" + this.req.chunks[0]);
    this.res.end();
  } if(request.text && botRegex_wtf.test(request.text)) {
    this.res.writeHead(200);
    postMessage("I know, right!?");
    this.res.end();
  } if(request.text && botRegex_bot.test(request.text)) {
      if(botRegex_hi.test(request.text)) {
      this.res.writeHead(200);
      postMessage("Hello!");
      this.res.end();
    }
  } else {
    console.log("don't care");
    console.log("RECIEVED: " + request);
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage(botResponse) {
  var botResponse, options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

function getInfo() {
  var botRequest, options, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: 'v3/bots/post',
    method: 'GET'
  };

  body = {
    "bot_id" : botID,
    "id" : groupID
  };

  console.log('requesting ' + groupID + ' from ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        console.log(botReq);
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error recieving info '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout recieving info '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;
