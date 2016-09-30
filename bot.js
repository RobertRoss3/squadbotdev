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
      userName = request.name; userIDNum = request.user_id;
      time = new Date();
      timeofDay = time.getHours();
      if ((timeofDay > 4) && (timeofDay < 12)) {
        sayDay = "morning";
      } else if ((timeofDay>11)&&(timeofDay<18)) {
        sayDay = "afternoon";
      } else if ((timeofDay>17)&&(timeofDay<22)) {
        sayDay = "evening";
      } else {
        sayDay = "super late evening";
      }
      Greetings = [
        ["Good " + sayDay + ", @" + userName + ".",[(7+sayDay.length),(6+sayDay.length+userName.length)],userIDNum],
        ["Hey, @" + userName + "!",[5,(4 + userName.length)],userIDNum],
        ["What's up, @" + userName + "?",[11,(10+userName.length)],userIDNum]
        ["Hi there, @" + userName + ".",[10,(9+userName.length)],userIDNum]
        ["Well hello @" + userName + "! I hope you're enjoying this fine " + sayDay + ".",[11,(10+userName.length)],userIDNum]];

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
      randomNumber = Math.floor(Math.random()*Greetings.length);
      postMessage(Greetings[randomNumber][0],'tag', [Greetings[randomNumber][1], Greetings[randomNumber][2]]);
      this.res.end();
    }
  } else {
    this.res.writeHead(200);
    this.res.end();
  }
  console.log("CHUNKS[0]: " + this.req.chunks[0]);
}

function postMessage(botResponse,type,args) {
  var botResponse, type, args, options, body, botReq;
  console.log("Type is of: " + type);
  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  if(type == 'tag') {
    body = {
      "bot_id" : botID,
      "text" : botResponse,
      "attachments" : [
        {
          "loci" : [args[0]],
          "type" : "mentions",
          "user_ids" : [args[1]]
        }
      ]
    };
  } else {
    body = {
      "bot_id" : botID,
      "text" : botResponse
    };
  }


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

// function getInfo() {
//   var botRequest, options, botReq;
//
//   options = {
//     hostname: 'api.groupme.com',
//     path: 'v3/bots/post',
//     method: 'GET'
//   };
//
//   body = {
//     "bot_id" : botID,
//     "id" : groupID
//   };
//
//   console.log('requesting ' + groupID + ' from ' + botID);
//
//   botReq = HTTPS.request(options, function(res) {
//       if(res.statusCode == 202) {
//         console.log(botReq);
//       } else {
//         console.log('rejecting bad status code ' + res.statusCode);
//       }
//   });
//
//   botReq.on('error', function(err) {
//     console.log('error recieving info '  + JSON.stringify(err));
//   });
//   botReq.on('timeout', function(err) {
//     console.log('timeout recieving info '  + JSON.stringify(err));
//   });
//   botReq.end(JSON.stringify(body));
// }

exports.respond = respond;
