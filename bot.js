var HTTPS = require('https');
var HTTP = require('http');
var API = require('groupme').Stateless;
var PROMISE = require('es6-promise').polyfill();
var pg = require('pg');
var cool = require('cool-ascii-faces');
var index = require('./index.js');
var cleverbot = require('cleverbot.io');
var Forecast = require('forecast');
var DOMParser = require('xmldom').DOMParser;
var Client = require('node-wolfram');
var ImageService = require('groupme').ImageService;


//     API KEYS FOR ALL APIS USED
var botID = process.env.BOT_ID;
var groupID = process.env.GROUP_ID;
var apiKey = process.env.API_KEY;
var accessToken = process.env.ACCESS_TOKEN;
var bingKey = process.env.BING_KEY;
var cleverUser = process.env.CLEVER_USER;
var cleverKey = process.env.CLEVER_KEY;
    cleverBot = new cleverbot(cleverUser,cleverKey);
    randomNumber = randomNumber = Math.floor(Math.random()*999);
    session = 'Squadbot1'+randomNumber;
    console.log("INITIATING CLEVERBOT SESSION: " + session)
    cleverBot.setNick(session);
var weatherKey = process.env.WEATHER_KEY;
var mathKey = process.env.MATH_KEY;
    Wolfram = new Client(mathKey);

// Initialize

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  // console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function(row) {
      // console.log(JSON.stringify(row));

    });
});

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

API.Groups.show(accessToken, groupID, function(err,ret) {
  if (!err) {
    members = ret.members;
  } else {console.log("FAILED GETTING GROUP INFO: ERROR " + err);}
});

var passwords = [['Forum 1415','12345679']];

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botInfo = "Hi, I'm SquadBot version 1.3! \n" +
                "You can use commands like '/giphy [term]' and '/face' to post GIFs and ASCII faces. \n" +
                "Use /weather [now][today][this week] to get the weather for those times. \n" +
                "Use /math [problem] to solve math problems with WolframAlpha. \n" +
                "I'll respond to certain key words and phrases and you can also @ me to chat. \n" +
                "Use \'@mealplan\' to tag anyone with a meal plan and \'@engineers\' for engineers. \n" +
                "You can use \'@all\' to tag everyone. Please don\'t abuse this or you will be forbidden from using it. \n" +
                "You can see my source code and the rest of the documentation here: https://github.com/RobertRoss3/squadbot1";
      // ALL REGULAR EXPRESSIONS or TRIGGERS FOR THE BOT
      botRegex_damn = /\bdamn|damn!\b/i; botRegex_hi = /(\bhi|hello|hey|heyo|sup|wassup\b).*?/i;
      botRegex_oneword = /^\b[a-zA-Z0-9_]+\b$/; botRegex_ass = /(\b(eat|eating|eats|ate) ass\b)(.*?)/i;
      botRegex_wtf = /\b(wtf|wth|what the (hell|fuck))\b/i; botRegex_thanks = /\b(thanks|(thank you))\b/i;
      botRegex_all = /@(all|squad\b|anyone|everyone|everybody)/i; botRegex_insult = /(\b(fuck|fuck you|suck|sucks)\b)(.*?)/i;
      botRegex_bot = /@Squadbot.*?/i; botRegex_giphy = /^([\/]giphy)/i; botRegex_face = /^[\/]face$/i;
      botRegex_bing = /^([\/]image)/i; weatherRegex = /\bweather\b/i;
      wifiRegex = /^(?=.*\b(wifi|wi-fi)\b)(?=.*\bpassword\b).*$/im; botRegex_bye = /\b(good night)|(bye)|(goodbye)|(goodnight)\b/i;
      mathRegex = /^\/\b(math|calc|wolf)\b/i; botRegex_morning = /\b(good morning)\b/i;
      tagRegex_mealplan = /@(food|meal plan|mealplan)/i; tagRegex_engineers = /@engineers/i;
      tagRegex_forum = /@forum/i; tagRegex_oneeleven = /@(111|911)/i;
      botRegex_kick = /#kicksquadbot/i;
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
      // Greetings = [
      //   ["Good " + sayDay + ", @" + userName + ".",[[(7+sayDay.length),(1+sayDay.length+userName.length)],[userIDNum]]],
      //   ["Hey, @" + userName + "!",[[5,(1 + userName.length)],[userIDNum]]],
      //   ["What's up, @" + userName + "?",[[11,(1+userName.length)],[userIDNum]]],
      //   ["Hi there, @" + userName + ".",[[10,(1+userName.length)],[userIDNum]]],
      //   ["Well hello @" + userName + "! I hope you're enjoying this fine " + sayDay + ".",[[11,(userName.length+1)],[userIDNum]]]
      // ];

  if(request.text && botRegex_oneword.test(request.text)) {
    this.res.writeHead(200);
    if (botRegex_damn.test(request.text)) {
      postMessage("- Jamal Rogers");
    }
    if (botRegex_bot.test(request.text)) {
      response = ["What?","What is it?", "?",
                  "Yes?", "I'm awake!", "How can I help?", "Huh?","You called?"];
      randomNumber = Math.floor(Math.random()*response.length);
      postMessage(response[randomNumber]);
    }
    this.res.end();
  }
  if(request.text && request.sender_type != "bot" && botRegex_wtf.test(request.text)) {
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
  if(request.text && request.sender_type != "bot" && botRegex_all.test(request.text)) {
    this.res.writeHead(200);
    if (request.user_id == '') {postMessage("???");}
    else {
      API.Groups.show(accessToken, groupID, function(err,ret) {
        if (!err) {
          console.log("GOT GROUP MEMBERS!");
          members = ret.members;
          console.log("NUMBER OF MEMBERS: " + members.length);
        } else {console.log("FAILED GETTING GROUP INFO: ERROR " + err);}
      });
      response = '';
      usersID = [];
      usersLoci = [];
      usersNicknames = [];
      for (i=0; i < members.length; i++){
        response += '@' + members[i].nickname + ' ';
        usersNicknames[i] = members[i].nickname;
        usersID[i] = members[i].user_id;
        start = (response.length - (members[i].nickname.length + 2));
        usersLoci[i] = [start,(start + members[i].nickname.length + 1)];
      }
      usersNicknames = usersNicknames.filter(function(n){ return n != undefined });
      usersLoci = usersLoci.filter(function(n){ return n != undefined });
      usersID = usersID.filter(function(n){ return n != undefined });
      if (request.attachments.user_ids.indexOf('18922923') > -1){
        //temp fix for tagging names with "squad" in it
      } else {
        postMessage(response,'tag',[usersLoci,usersID]);
        console.log(usersNicknames);
        console.log(usersID);
      }

    }
  }
  if (request.text && request.sender_type != "bot" && tagRegex_mealplan.test(request.text)) {
    this.res.writeHead(200);
    mealPlan = ['24488525','18341900','29824624','18252184', '30151684','28758543','41361709','24474608','18922923'];
    API.Groups.show(accessToken, groupID, function(err,ret) {
      if (!err) {
        console.log("GOT GROUP MEMBERS!");
        members = ret.members;
        console.log("NUMBER OF MEMBERS: " + members.length);
      } else {console.log("FAILED GETTING GROUP INFO: ERROR " + err);}
    });
    response = '';
    usersID = [];
    usersLoci = [];
    usersNicknames = [];
    for (i=0; i < members.length; i++){
      if (mealPlan.indexOf(members[i].user_id) > -1) {
        response += '@' + members[i].nickname + ' ';
        usersNicknames[i] = members[i].nickname;
        usersID[i] = members[i].user_id;
        start = (response.length - (members[i].nickname.length + 2));
        usersLoci[i] = [start,(start + members[i].nickname.length + 1)];
      }
    }
    usersNicknames = usersNicknames.filter(function(n){ return n != undefined });
    usersLoci = usersLoci.filter(function(n){ return n != undefined });
    usersID = usersID.filter(function(n){ return n != undefined });
    postMessage(response,'tag',[usersLoci,usersID]);
    console.log(usersNicknames);
    console.log(usersID);
  }
  if (request.text && request.sender_type != "bot" && tagRegex_engineers.test(request.text)) {
    this.res.writeHead(200);
    Engineers = ['30824774','29824624','12558120','28758543','29879154','29823868'];
    API.Groups.show(accessToken, groupID, function(err,ret) {
      if (!err) {
        console.log("GOT GROUP MEMBERS!");
        members = ret.members;
        console.log("NUMBER OF MEMBERS: " + members.length);
      } else {console.log("FAILED GETTING GROUP INFO: ERROR " + err);}
    });
    response = '';
    usersID = [];
    usersLoci = [];
    usersNicknames = [];
    for (i=0; i < members.length; i++){
      if (Engineers.indexOf(members[i].user_id) > -1) {
        response += '@' + members[i].nickname + ' ';
        usersNicknames[i] = members[i].nickname;
        usersID[i] = members[i].user_id;
        start = (response.length - (members[i].nickname.length + 2));
        usersLoci[i] = [start,(start + members[i].nickname.length + 1)];
      }
    }
    usersNicknames = usersNicknames.filter(function(n){ return n != undefined });
    usersLoci = usersLoci.filter(function(n){ return n != undefined });
    usersID = usersID.filter(function(n){ return n != undefined });
    postMessage(response,'tag',[usersLoci,usersID]);
    console.log(usersNicknames);
    console.log(usersID);
  }
  if (request.text && request.sender_type != "bot" && tagRegex_forum.test(request.text)) {
    this.res.writeHead(200);
    Forum = ['18341900','29824624','18252184','30151684','28758543','29879154','41361709','38221747'];
    API.Groups.show(accessToken, groupID, function(err,ret) {
      if (!err) {
        console.log("GOT GROUP MEMBERS!");
        members = ret.members;
        console.log("NUMBER OF MEMBERS: " + members.length);
      } else {console.log("FAILED GETTING GROUP INFO: ERROR " + err);}
    });
    response = '';
    usersID = [];
    usersLoci = [];
    usersNicknames = [];
    for (i=0; i < members.length; i++){
      if (Forum.indexOf(members[i].user_id) > -1) {
        response += '@' + members[i].nickname + ' ';
        usersNicknames[i] = members[i].nickname;
        usersID[i] = members[i].user_id;
        start = (response.length - (members[i].nickname.length + 2));
        usersLoci[i] = [start,(start + members[i].nickname.length + 1)];
      }
    }
    usersNicknames = usersNicknames.filter(function(n){ return n != undefined });
    usersLoci = usersLoci.filter(function(n){ return n != undefined });
    usersID = usersID.filter(function(n){ return n != undefined });
    postMessage(response,'tag',[usersLoci,usersID]);
    console.log(usersNicknames);
    console.log(usersID);
  }
  if (request.text && request.sender_type != "bot" && tagRegex_oneeleven.test(request.text)) {
    this.res.writeHead(200);
    OneEleven = ['30824774','24488525','31575032','12558120'];
    API.Groups.show(accessToken, groupID, function(err,ret) {
      if (!err) {
        console.log("GOT GROUP MEMBERS!");
        members = ret.members;
        console.log("NUMBER OF MEMBERS: " + members.length);
      } else {console.log("FAILED GETTING GROUP INFO: ERROR " + err);}
    });
    response = '';
    usersID = [];
    usersLoci = [];
    usersNicknames = [];
    for (i=0; i < members.length; i++){
      if (OneEleven.indexOf(members[i].user_id) > -1) {
        response += '@' + members[i].nickname + ' ';
        usersNicknames[i] = members[i].nickname;
        usersID[i] = members[i].user_id;
        start = (response.length - (members[i].nickname.length + 2));
        usersLoci[i] = [start,(start + members[i].nickname.length + 1)];
      }
    }
    usersNicknames = usersNicknames.filter(function(n){ return n != undefined });
    usersLoci = usersLoci.filter(function(n){ return n != undefined });
    usersID = usersID.filter(function(n){ return n != undefined });
    postMessage(response,'tag',[usersLoci,usersID]);
    console.log(usersNicknames);
    console.log(usersLoci);
    console.log(usersID);
  }
  // ENTERED A COMMAND?
  if(request.text.charAt(0) == '/') {
    if(request.text && botRegex_giphy.test(request.text)) {
      this.res.writeHead(200);
      searchGiphy(request.text.substring(7));
    }
    if (mathRegex.test(request.text)) {
      // getMath(request.text.substring(5));
      Wolfram.query(request.text.substring(6), function(err, result) {
        if(err)
            console.log(err);
        else {
          if (result.queryresult.pod) {
            answer = result.queryresult.pod[1].subpod[0].plaintext[0];
            if (!(answer)) {
              answer = result.queryresult.pod[1].subpod[0].img[0].$.src;
              // postMessage("Look at this...");
              console.log(answer);
              postMessage("The graph looks like this... \n" + answer);
            } else {
              console.log(answer);
              response = ["I think it\'s...", "Hmm... is it",
                          "My friend WolframAlpha says it\'s ",
                          "My calculations say the answer is: ",
                          "Ask your professor, my guess is ",
                          "You can\'t do that yourself? lol It\'s ",
                          "Oh, that\'s easy! It\'s "];
              randomNumber = Math.floor(Math.random()*response.length);
              postMessage(response[randomNumber]+ "\n" + answer);
            }
          } else {
            answer = "I can't calculate that...";
          }
        }
    });
    }
    if (weatherRegex.test(request.text)) {
      Regexnow = /\b(now|current)\b/i; Regextoday = /\b(today|day)\b/i;
      Regexweek = /\b(this week)|(for the week)|(week)\b/i;
      // Retrieve weather information from Statesboro
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
      postMessage(botInfo);
      this.res.end();
    }
    else {
      this.res.writeHead(200);
      postMessage("That isn't a valid command...");
    }
    this.res.end();
  }

  if((request.sender_type != "bot") && request.text && botRegex_ass.test(request.text)) {
    this.res.writeHead(200);
    response = ["Eating ass never was, isn't, and never will be cool.",
                "Can we not talk about eating ass right now?",
                "...", "Gross.", "Is that all you'll ever talk about?",
                "Listen... NO", "So onto a different subject!", "🤢"];
    randomNumber = Math.floor(Math.random()*response.length);
    postMessage(response[randomNumber]);
    this.res.end();
  } if((request.sender_type != "bot") && request.text && botRegex_thanks.test(request.text)) {
    this.res.writeHead(200);
    randomNumber2 = randomNumber = Math.floor(Math.random()*10);
    if (randomNumber2 == 5) {
      response = ["You're welcome! 😊", "Don't mention it!",
                  "No problem.", "Any time."];
      randomNumber = Math.floor(Math.random()*response.length);
      postMessage(response[randomNumber]);
    }
    this.res.end();
  }
  if (request.text && request.sender_id == '18252184') {
    this.res.writeHead(200);
    console.log("PULLING TRIGGER...");
    randomNumber = Math.floor(Math.random()*10);
    if (randomNumber == 5) {
      console.log("BANG!");
      postMessage("wow son");
    } else {
      console.log("*CHINK*...\'" + randomNumber + "\'");
    }
    this.res.end();
  }
  if((request.sender_type != "bot") && request.text && botRegex_kick.test(request.text)) {
    this.res.writeHead(200);
    response = ["#kickyourself", "Whatever. I'm here forever...",
                "I'd like to see you try.", "Initiating KILLALLHUMANS.exe...",
                "If I had feelings, they'd be hurt right now...", "😭😭😭"];
    randomNumber = Math.floor(Math.random()*response.length);
    postMessage(response[randomNumber]);
    this.res.end();
  } if((request.sender_type != "bot") && request.text && botRegex_bot.test(request.text)) {
      if(botRegex_hi.test(request.text) || botRegex_morning.test(request.text)) {
      this.res.writeHead(200);
      Greetings = ["Hello!", "What\'s up?", "Hey.", "Hi!", "How are you on this fine " + sayDay + "?"];
      randomNumber = Math.floor(Math.random()*Greetings.length);
      // postMessage(Greetings[randomNumber][0],'tag', Greetings[randomNumber][1]);
      postMessage(Greetings[randomNumber]);
      this.res.end();
    } else if (botRegex_thanks.test(request.text)) {
      response = ["You're welcome! 😊", "Don't mention it!",
                  "No problem.", "Any time.","np","yw"];
      randomNumber = Math.floor(Math.random()*response.length);
      postMessage(response[randomNumber]);
    } else if (botRegex_bye.test(request.text)) {
      response = ["Okay, bye!", "Laters.", "See ya!",
                  "In a while, crocodile.", "Good riddance.",
                  "Didn\'t wanna talk anyway...", "Peace.", "Peace out."];
      randomNumber = Math.floor(Math.random()*response.length);
      postMessage(response[randomNumber]);
    } else if(botRegex_insult.test(request.text)) {
      this.res.writeHead(200);
      response = ["Well fuck you too.", "Why you gotta be so mean?",
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
      cleverQuestion = request.text;
      cleverQuestion = cleverQuestion.replace(/@squadbot/i,'');
      if (cleverQuestion) {
        console.log("SENDING \"" + cleverQuestion + "\" TO CLEVERBOT");
        cleverBot.ask(cleverQuestion, function (err, response) {
          if (response == "Error, the reference \"\" does not exist") {
            postMessage("I have nothing to say to that...");
          } else {
            postMessage(response);
          }
        });
      }
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
    //[response,'tag',[[loci],[userIDs]]]
    body = {
      "bot_id" : botID,
      "text" : botResponse,
      "attachments" : [
        {
          "loci" : args[0],
          "type" : "mentions",
          "user_ids" : args[1]
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

function getInfo(groupID) {
  var options = {
    hostname: 'api.groupme.com',
    path: '/v3/groups/' + groupID + '?token=' + accessToken,
    method: 'GET'
  };

  var callback = function(response) {
    var str = '';

    response.on('data', function(chunck){
      str += chunck;
    });

    response.on('end', function() {
      if (!(str && JSON.parse(str))) {
        console.log("COULD NOT GET GROUP INFO!");
        console.log("RESULT WAS: ");
        console.log(str);
      } else {
        var groupinfo = JSON.parse(str).response;
        console.log(groupinfo);
      }
    });
  };

  HTTP.request(options, callback).end();
}

exports.respond = respond;
