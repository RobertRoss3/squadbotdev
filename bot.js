var HTTPS = require('https');
var HTTP = require('http');
var cool = require('cool-ascii-faces');
var index = require('./index.js');
var cleverbot = require('cleverbot.io');
var Forecast = require('forecast');
var DOMParser = require('xmldom').DOMParser;
var Client = require('node-wolfram');

//     API KEYS FOR ALL APIS USED
var botID = process.env.BOT_ID;
var groupID = process.env.GROUP_ID;
var apiKey = process.env.API_KEY;
var accessToken = process.env.ACCESS_TOKEN;
var bingKey = process.env.BING_KEY;
var cleverUser = process.env.CLEVER_USER;
var cleverKey = process.env.CLEVER_KEY;
    cleverBot = new cleverbot(cleverUser,cleverKey);
    session = 'Squadbot1';
    cleverBot.setNick(session);
var weatherKey = process.env.WEATHER_KEY;
var mathKey = process.env.MATH_KEY;
    Wolfram = new Client(mathKey);

// Initialize
var forecast = new Forecast({
  service: 'darksky',
  key: weatherKey,
  units: 'fahrenheit',
  cache: true,      // Cache API requests
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
    minutes: 27,
    seconds: 45
  }
});

var passwords = [['Forum 1415','12345679']];

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botInfo = "Hi, I'm SquadBot version 1.0! \n" +
                "You can use commands like '/giphy [term]' and '/face' to post GIFs and ASCII faces. \n" +
                "Use /weather [now][today][this week] to get the weather for those times. \n" +
                "I'll respond to certain key words and phrases and you can also @ me to chat. \n" +
                "Other features are to come! Please don't try to break me... ";
      // ALL REGULAR EXPRESSIONS or TRIGGERS FOR THE BOT
      botRegex_damn = /\bdamn|damn!\b/i; botRegex_hi = /(\bhi|hello|hey|heyo|sup|wassup\b).*?/i;
      botRegex_oneword = /^\b[a-zA-Z0-9_]+\b$/; botRegex_ass = /(\b(eat|eating|eats|ate) ass\b)(.*?)/i;
      botRegex_wtf = /\bwtf|wth/i; botRegex_thanks = /\b(thanks|(thank you))\b/i;
      botRegex_all = /@all|@squad|@everyone/; botRegex_insult = /(\b(fuck|fuck you|suck|sucks)\b)(.*?)/i;
      botRegex_bot = /@Squadbot.*?/i; botRegex_giphy = /^([\/]giphy)/i; botRegex_face = /^[\/]face$/i;
      botRegex_bing = /^([\/]image)/i; weatherRegex = /\bweather\b/i;
      wifiRegex = /^(?=.*\b(wifi|wi-fi)\b)(?=.*\bpassword\b).*$/im;
      mathRegex = /^\/\bmath\b/i;
      // INFO ABOUT THE USER THAT TRIGGERED THE BOT
      userName = request.name; userIDNum = request.user_id;
      // GET CURRENT TIME
      time = new Date();
      timeofDay = time.getHours(); timeofDay = timeofDay - 4;
      // BOT GREETING
      if (timeofDay < 0) {timeofDay = 23 + timeofDay;} if (timeofDay > 23) {timeofDay = 23 - timeofDay;} if ((timeofDay > 4) && (timeofDay < 12)) {
        sayDay = "morning";
      } else if ((timeofDay>11)&&(timeofDay<18)) {
        sayDay = "afternoon";
      } else if ((timeofDay>17)&&(timeofDay<22)) {
        sayDay = "evening";
      } else {
        sayDay = "night";
      }
      Greetings = [
        ["Good " + sayDay + ", @" + userName + ".",[(7+sayDay.length),(1+sayDay.length+userName.length)],userIDNum],
        ["Hey, @" + userName + "!",[5,(1 + userName.length)],userIDNum],
        ["What's up, @" + userName + "?",[11,(1+userName.length)],userIDNum],
        ["Hi there, @" + userName + ".",[10,(1+userName.length)],userIDNum],
        ["Well hello @" + userName + "! I hope you're enjoying this fine " + sayDay + ".",[11,(userName.length+1)],userIDNum]];

  if ((request.text == "@Squadbot")||(request.text == "@squadbot")||(request.text == "@SquadBot")) {
    response = ["What?","What is it?",
                "Yes?", "I'm awake!", "How can I help?", "Huh?","You called?"];
    randomNumber = Math.floor(Math.random()*response.length);
    postMessage(response[randomNumber]);
  }
  if(request.text && botRegex_oneword.test(request.text)) {
    this.res.writeHead(200);
    if (botRegex_damn.test(request.text)) {
      postMessage("- Jamal Rogers");
    }
    this.res.end();
  }
  if(request.text && botRegex_wtf.test(request.text)) {
    this.res.writeHead(200);
    postMessage("I know, right!?");
    this.res.end();
    // Commands
  }
  if(request.text && botRegex_face.test(request.text)) {
    this.res.writeHead(200);
    postMessage(cool());
    this.res.end();
  }
  // ENTERED A COMMAND?
  if(request.text.charAt(0) == '/') {
    if(request.text && botRegex_giphy.test(request.text)) {
      this.res.writeHead(200);
      searchGiphy(request.text.substring(7));
    }
    if (mathRegex.test(request.text)) {
      // getMath(request.text.substring(5));
      Wolfram.query("2+2", function(err, result) {
        if(err)
            console.log(err);
        else {
          answer = result.queryresult.pod[1].subpod[0].plaintext;
          console.log(answer);
            // for(var a=0; a<result.queryresult.pod.length; a++)
            // {
            //     var pod = result.queryresult.pod[a];
            //     console.log(pod.$.title,": ");
            //
            //     for(var b=0; b<pod.subpod.length; b++)
            //     {
            //         var subpod = pod.subpod[b];
            //         for(var c=0; c<subpod.plaintext.length; c++)
            //         {
            //             var text = subpod.plaintext[c];
            //             console.log('\t', text);
            //         }
            //     }
            // }
        }
    });
    }
    if (weatherRegex.test(request.text)) {
      Regexnow = /\b(now|current)\b/i; Regextoday = /\b(today|day)\b/i;
      Regexweek = /\b(this week)|(for the week)|(week)\b/i;
      // Retrieve weather information from Statesboro
      forecast.get([32.4128, -81.7957], function(err, weather) {
        if(err) return console.log(err);

      if (Regexnow.test(request.text)) {
        postMessage("Current weather is " + weather.currently.summary.toLowerCase() +
                    " with a temperature of " + weather.currently.temperature + "°F.");
      } else if (Regextoday.test(request.text)) {
        // console.log(weather.hourly);
        hourlySummary = weather.hourly.summary.toLowerCase();
        hourlySummary = hourlySummary.substring(0,hourlySummary.length-1);
        postMessage("Weather today is " + hourlySummary +
                    " with an average temperature of " + weather.hourly.data[0].temperature + "°F.");
      } else {
        // console.log(weather.daily);
        postMessage("Weather this week is " + weather.daily.summary);
      }
    });
    }
    if (request.text == "/info") {
      this.res.writeHead(200);
      // console.log("Attempting to get info of group: " + groupID + " with access token: " + accessToken);
      // getInfo(groupID);
      postMessage(botInfo);
      this.res.end();
    }
    // if(request.text && botRegex_bing.test(request.text)) {
    //   this.res.writeHead(200);
    //   searchBing(request.text.substring(6));
    //   this.res.end();
    // }
    this.res.end();
  } if((request.sender_type != "bot") && request.text && botRegex_ass.test(request.text)) {
    this.res.writeHead(200);
    response = ["Eating ass never was, isn't, and never will be cool.",
                "Can we not talk about eating ass right now?",
                "...", "Gross."];
    randomNumber = Math.floor(Math.random()*response.length);
    postMessage(response[randomNumber]);
    this.res.end();
  } if((request.sender_type != "bot") && request.text && botRegex_thanks.test(request.text)) {
    this.res.writeHead(200);
    response = ["You're welcome! 😊",
                "No problem."];
    randomNumber = Math.floor(Math.random()*response.length);
    postMessage(response[randomNumber]);
    this.res.end();
  } if((request.sender_type != "bot") && request.text && botRegex_bot.test(request.text)) {
      if(botRegex_hi.test(request.text)) {
      this.res.writeHead(200);
      randomNumber = Math.floor(Math.random()*Greetings.length);
      postMessage(Greetings[randomNumber][0],'tag', [Greetings[randomNumber][1], Greetings[randomNumber][2]]);
      this.res.end();
    } else if(botRegex_insult.test(request.text)) {
      this.res.writeHead(200);
      response = ["Well fuck you too.",
                  "Whatever", "Rude...", "Ok...and?", "Damn okay then..."];
      randomNumber = Math.floor(Math.random()*response.length);
      postMessage(response[randomNumber]);
      this.res.end();
    } else if (wifiRegex.test(request.text)) {
      this.res.writeHead(200);
      forum1415Regex = /^(?=.*\bForum\b)(?=.*\b1415\b).*$/im;
      forum1831Regex = /^(?=.*\bForum\b)(?=.*\b1831\b).*$/im;
      rm111roomRegex = /^(?=.*\b(111|911)\b)(?=.*\bSouth\b).*$/;
      if (forum1831Regex.test(request.text)) {
        postMessage("The code for The Forum 1831 is:");
        postMessage("Unknown. You'll have to be there.")
      } else if (forum1415Regex.test(request.text)) {
        postMessage("The code for the Forum 1415 is:");
        postMessage("E483996D5FEA")
      } else if (rm111roomRegex.test(request.text)) {
        postMessage("The code for 911 South is: ");
        postMessage("Unknown. You'll have to be there.");
      } else {
        postMessage("I don't know the wifi to that place...");
      }
      this.res.end();
    } else {
      this.res.writeHead(200);
      cleverQuestion = request.text.substring(9);
      cleverBot.ask(cleverQuestion, function (err, response) {
        console.log("CLEVERBOT RESPONSE: " + response); // Will likely be: "Living in a lonely world"
        if (response == "Error, the reference \"\" does not exist") {
          postMessage("I have nothing to say to that...");
        } else {
          postMessage(response);
        }
      });
      this.res.end();
    }
  } else {
    this.res.writeHead(200);
    this.res.end();
  }
  console.log(userName + " POSTED: " + this.req.chunks[0]);
}

function getMath(equation) {
  var options = {
    host: 'api.wolframalpha.com',
    path: '/v2/query?input=' + equation + '&appid=' + mathKey
  };

  var callback = function(response) {
    var str = '';

    response.on('data', function(chunck){
      str += chunck;
    });

    response.on('end', function() {
      var parser = new DOMParser();
      str = parser.parseFromString(str, "text/xml");
      JSONstr = xmlToJson(str);
      if (!(JSONstr)) {
        postMessage('Can\'t calculate that...');
      } else {
        var response = JSONstr;
        console.log("WOLFRAM RESPONSE: ");
        console.log(response);
      }
    });
  };

  HTTP.request(options, callback).end();
}

function searchGiphy(giphyToSearch) {
  var options = {
    host: 'api.giphy.com',
    path: '/v1/gifs/search?q=' + encodeQuery(giphyToSearch) + '&api_key=' + apiKey
  };

  var callback = function(response) {
    var str = '';

    response.on('data', function(chunck){
      str += chunck;
    });

    response.on('end', function() {
      if (!(str && JSON.parse(str).data[0])) {
        postMessage('Couldn\'t find a gif...');
      } else {
        var id = JSON.parse(str).data[0].id;
        var giphyURL = 'http://i.giphy.com/' + id + '.gif';
        postMessage(giphyURL);
      }
    });
  };

  HTTP.request(options, callback).end();
}

function encodeQuery(query) {
  return query.replace(/\s/g, '+');;
}


cleverBot.create(function (err, session) {
  // session is your session name, it will either be as you set it previously, or cleverbot.io will generate one for you

  // Woo, you initialized cleverbot.io.  Insert further code here
});

// Changes XML to JSON
function xmlToJson(xml) {

	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

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


  console.log('sending \"' + botResponse + '\" to ' + botID);

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
    path: 'v3/groups/:' + groupID + '?token=' + accessToken,
    //GET /groups/:id
    method: 'GET'
  };
  //
  // body = {
  //   "id" : groupID
  // };

  console.log('REQUESTING ' + groupID + ' FROM ' + options.path);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        console.log(botReq);
      } if(res.statusCode == 200) {
        console.log("BOTREQUEST: " + botReq);
        // console.log("FUNCTION(RES): " + function(res));
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
  botReq.end();
}

exports.respond = respond;
