var HTTPS = require('https');
var HTTP = require('http');
var API = require('groupme').Stateless;
var PROMISE = require('es6-promise').polyfill();
var cool = require('cool-ascii-faces');
var index = require('./index.js');
var cleverbot = require('cleverbot.io');
var Forecast = require('forecast');
var DOMParser = require('xmldom').DOMParser;
var wolfClient = require('node-wolfram');
var ImageService = require('groupme').ImageService;
var Guid = require('guid');
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
// var NodeGeocoder = require('node-geocoder');

//  GETTING DATA FROM GOOGLE SPREADSHEET
var doc = new GoogleSpreadsheet('1QklJC4tgKBrdW_LxQ1O4TD_drZNxc0iz0nc53U-wL44');
var sheet; documentLoaded = false;

//  AUTHENTICATES THE GOOGLE ACCOUNT
var creds_json = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY
}
doc.useServiceAccountAuth(creds_json, function(err,res){
  if(err){console.log('Error setting authentication: '+err);}
  else{console.log('Authenticated successfully.')}
});

//  GETS INFORMATION ABOUT THE DOCUMENT AND WORKSHEET
doc.getInfo(function(err, info) {
  if (info != null){
    //Loads document info and creates arrays that will be used for tagging and quoting
    documentLoaded = true;
    Members_info = info.worksheets[0]; Groups_info = info.worksheets[1]; Quotes_info = info.worksheets[2];
  } else {console.log("Error: Spreadsheet returned: "+err);}
});

console.log(documentLoaded);

if(documentLoaded != false){
  console.log('Loaded document: '+info.title+'... ');
  // GETS INFORMATION ABOUT THE GROUPS
  Groups_info.getCells({'min-row': 1,'max-row': 3,'min-col': 1,'max-col': 25,'return-empty': false},
  function(err, cells) {
    groupcount = cells.length/3;
    console.log("Counted "+groupcount+" groups...");
    Group = []; Group_name = []; Group_regex = []; Group_response = [];
    for (i = 0; i < groupcount; i++){
      Group_name[i] = cells[i].value;
      tempRegEx = cells[i+groupcount].value;
      tempRegEx = tempRegEx.replace(/\;/ig,'|').replace(/\s/ig,'');
      Group_regex[i] = new RegExp('@('+tempRegEx+')', 'i');
      tempResponse = cells[i+groupcount*2].value;
      Group_response[i] = tempResponse.split(';');
      Group[i] = [Group_name[i],Group_regex[i],Group_response[i], new Array()];
    }
  });

  //  GETS INFORMATION ABOUT THE MEMBERS
  Members_info.getCells({'min-row': 2,'max-row': 100,'min-col': 1,'max-col': 2,'return-empty': false},
  function(err, cells) {
    membercount = cells.length/2;
    console.log("Counted "+membercount+" members...");
    Member = []; Member_name = []; Member_id = [];
    for (i = 0; i < membercount; i++){
        Member_id[i] = cells[(i*2)].value;
        Member_name[i] = cells[(i*2)+1].value;
        Member[i] = [Member_id[i], Member_name[i]];
    }
    Member_id.push('43525551'); Member_name.push('SquadBot'); Member.push(['43525551','Squadbot']);
  });

  //  GETS INFORMATION ABOUT THE MEMBERS IN A GROUP
  Groups_info.getCells({'min-row': 4,'max-row': (4+membercount),'min-col': 1,'max-col': groupcount,'return-empty': true},
  function(err, cells){
    subGroup = new Array(groupcount);
    for (j=0;j<groupcount;j++){
      subGroup[j] = new Array()
      for (i=0;i<membercount;i++){
        if (cells[(groupcount*i)+j].value != ''){subGroup[j].push(cells[(groupcount*i)+j].value);}
      }
      Group[j][3] = subGroup[j];
      for(k=0;k<Group[j][3].length;k++){
        if(Member_name.includes(Group[j][3][k])){
          Group[j][3][k] = Member_id[Member_name.indexOf(Group[j][3][k])];
        }
      }
    }
  });

  //  GETS QUOTES
  Quotes_info.getCells({'min-row': 2,'max-row': 300,'min-col': 1,'max-col': 1,'return-empty': false},
  function(err, cells){
    quotecount = cells.length;
    console.log("Counted "+quotecount+" quotes...");
    Quotes = [];
    for (i = 0; i < quotecount; i++){
        Quotes[i] = cells[i].value;
    }
  });
}

console.log("Starting up...");

//     API KEYS FOR ALL APIS USED
var botID = process.env.BOT_ID;
var groupID = process.env.GROUP_ID;
var GiphyapiKey = process.env.GIPHY_API_KEY;
var accessToken = process.env.ACCESS_TOKEN;
var bingKey = process.env.BING_KEY;
var cleverUser = process.env.CLEVER_USER;
var cleverKey = process.env.CLEVER_KEY;
    cleverBot = new cleverbot(cleverUser,cleverKey);
    randomNumber = randomNumber = Math.floor(Math.random()*999);
    session = 'Squadbot1'+randomNumber;
    console.log("Loading Cleverbot AI session: " + session + "...")
    cleverBot.setNick(session);
    cleverBot.create(function (err, session) {
    });
    console.log("Cleverbot loading completed...")
var weatherKey = process.env.WEATHER_KEY;
var mathKey = process.env.MATH_KEY;
    Wolfram = new wolfClient(mathKey);

console.log("Loading weather API...");
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

// console.log("Loading geocoder API...")

API.Groups.show(accessToken, groupID, function(err,ret) {
  console.log("Loading GroupMe API...");
  if (!err) {console.log("GroupMe API loaded...");
    members = ret.members;
    console.log("MEMBERS: "+members.length);
    AllNames = new Array(members.length);
    AllIDs = new Array(members.length);
    for(i=0;i<members.length;i++){
      AllNames[i] = members[i].nickname;
      AllIDs[i] = members[i].user_id;
    }
  } else {console.log("ERROR: FAILED GETTING GROUP INFO" + err);}
});

var refresh = (new Date().getTime() / 1000) - 120;

// time arg is in milliseconds
function delay(time) {
  var d1 = new Date();
  var d2 = new Date();
  while (d2.valueOf() < d1.valueOf() + time) {
    d2 = new Date();
  }
}

last_userName = ' '; last_userIDNum = '00000000';
last_response = " ";

botInfo = "Hi, I'm SquadBot version 2.4.4! \n" +
          "You can use commands like '/giphy [term]' and '/face' to post GIFs and ASCII faces. \n" +
          "Use /weather [now][today][this week] to get the weather for those times. \n" +
          "Use /math [problem] to solve math problems with WolframAlpha. \n" +
          "I'll respond to certain key words and phrases and you can also @ me to chat. \n" +
          "Use \'@mealplan\' to tag anyone with a meal plan and \'@GSU\' for anyone in the Statesboro area. \n" +
          "You can use \'@all\' to tag everyone. Please don\'t abuse this or you will be forbidden from using it. \n" +
          "You can see my source code and the rest of the documentation here: https://github.com/RobertRoss3/squadbot1";

// ALL REGULAR EXPRESSIONS or TRIGGERS FOR THE BOT
botRegex_oneword = /\s\b/;
tagRegex_bot = /@Squadbot.*?/i;

function respond() {
  if (!Groups_info){
    delay(5000);
    if (!groupcount){
      delay(2000);
    }
  }

  var request = JSON.parse(this.req.chunks[0]);

  // INFO ABOUT THE USER THAT TRIGGERED THE BOT
  userName = request.name; userIDNum = request.user_id;
  console.log(userName + " (" + userIDNum + ") POSTED: " + this.req.chunks[0]);
  askme = false; systemresponse = false;

  if (userIDNum=='0'){ // System message from GroupMe
    if(/\badded\b/i.test(request.text)){
      response = ["Well hello there!", "ohai!", "Hola!", "Welcome to the club!", "Haven't I seen you here before?",
       "Anotha one","giphy welcome","giphy Hello"];
       systemresponse = true;
    } else if(/\brejoined\b/i.test(request.text)){
      response = ["Well fancy seeing you here again.", "Hmm, back again I see...",
       "Look what the cat dragged in!", "Welcome back I guess...", "Hey there" + userName,
       "You're back!", "You're back! Hooray!", "Oh... you're back...", "gihpy hello"];
       systemresponse = true;
    } else if(/\bleft\b/i.test(request.text)){
      response = ["https://media.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.gif", "https://media.giphy.com/media/O5NyCibf93upy/giphy.gif",
       "https://media.giphy.com/media/UQaRUOLveyjNC/giphy.gif", "Oh...", "Well see you later I guess...", "😶", "Holy moly.",
     "lmaoooooooo", "AND STAY OUT!", "Finally!", "giphy bye"];
     systemresponse = true;
    } else if(/\bremoved\b/i.test(request.text)){
      response = ["https://media.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.gif", "GOT DAMN", "😮","Hoooooo boy.", "DAMN", "AND STAY OUT!",
    "Now that they're gone, let's talk mad shit.","giphy bye"];
    systemresponse = true;
    }

    if(systemresponse){
      randomNumber = Math.floor(Math.random()*response.length);
      delay(3000);
      if(/gihpy/i.test(response)){
        response = response.replace(/gihpy/i, '');
        searchGiphy(response);
      } else {
        postMessage(response[randomNumber]);
      }
    }
  }
  if(request.text && !botRegex_oneword.test(request.text)) {
    this.res.writeHead(200);
    if (/damn\b/gi.test(request.text)) {
      likeMessage(request.id);
      postMessage("- Kendrick Lamar");
    }
    if (tagRegex_bot.test(request.text)) {
      likeMessage(request.id);
      response = ["What?","What is it?", "?",
                  "Yes?", "I'm awake!", "How can I help?", "Huh?","You called?","giphy huh", "giphy question mark", "giphy what?"];
      randomNumber = Math.floor(Math.random()*response.length);
      askme = true; response = response[randomNumber];
      if(/\bgihpy \b/i.test(response)){
        response.replace(/\bgihpy \b/i, '');
        searchGiphy(response);
      } else {
      postMessage(response);}
    }
    this.res.end();
  }
  if(request.text && request.sender_type != "bot" && request.user_id != '43525551' && /\b(wtf|wth|what the (hell|fuck))\b/i.test(request.text)) {
    this.res.writeHead(200);
    randomNumber = Math.floor(Math.random()*5);
    if(randomNumber == 3) {
      postMessage("I know, right!?");
    }
    this.res.end();
    // Commands
  }
  if(request.text && /^[\/]face$/i.test(request.text)) {
    this.res.writeHead(200);
    likeMessage(request.id);
    postMessage(cool());
    this.res.end();
  }
  if(request.text == "tick"){
    this.res.writeHead(200);
    postMessage("tock");
    likeMessage(request.id);
    this.res.end();
  }
  if(/^BULLSHIT ALERT/i.test(request.text)){
    var newtime = new Date().getTime() / 1000;
    if (newtime < refresh + 10) {
      response = ["You\'re doing that too much...",
                  "Cool it, cowboy. ",
                  "Wait a minute please...",
                  "Give me a sec.",
                  "lol nah dude",
                  "Not right now.",
                  "😤"];
      randomNumber = Math.floor(Math.random()*response.length);
      response = response[randomNumber];
      postMessage(response);
    } else {
      response1 = ["Woah... ","Uh, ","Aight so ","OOOOOOOOOOOKAY ","😑 ","😶 ","😲 ","😱 ",'Nephew...'];
      randomNumber = Math.floor(Math.random()*response1.length);
      response = response1[randomNumber];
      response += "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
      response += "Looks like there's some fucked up shit up there! Here's a gif of ";
      topic = ['cat','duck','trippy','puppy','baby'];
      response2 = ['a cat!','a duck.','something trippy','puppies','a baby'];
      randomNumber2 = Math.floor(Math.random()*topic.length);
      response += response2[randomNumber2];
      postMessage(response);
      delay(1500);
      searchGiphy(topic[randomNumber2]);
      refresh = newtime;
    }
  }
  tagtest = false;
  for (i=0;i<groupcount;i++){
    if(Group_regex[i].test(request.text)){tagtest=true;}
  }
  if(request.text && request.user_id != '43525551' && request.sender_type != "bot" && tagtest) {
    this.res.writeHead(200);
    likeMessage(request.id);
    API.Groups.show(accessToken, groupID, function(err,ret) {
      if (!err) {
        console.log("GOT GROUP MEMBERS!");
        members = ret.members;
        console.log("NUMBER OF MEMBERS: " + members.length);
      } else {console.log("FAILED GETTING GROUP INFO: ERROR " + err);}
    });

    if (request.user_id == '') {postMessage("???");}
    // If someone posts @all
    // else if (request.user_id == John) {
    //   postMessage("*crickets*");
    // }
    else {
      // When a group is tagged, generate a random response
      for(i=0;i<groupcount;i++){
        if(Group_regex[i].test(request.text)){
          response = Group_response[i];
          randomNumber = Math.floor(Math.random()*response.length);
          response = response[randomNumber];
          response = response.replace(/\"/ig,'');}
      }
      reslength = response.length;
      response += request.name;
      if ((botRegex_oneword.test(request.text))) {
        response += ' says: ' + request.text;
      }
      else if (userIDNum == last_userIDNum) {
        response += ' says: ' + last_response;
      }
      else {
        response += ' wants your attention.';
      }
      usersID = []; usersLoci = [];
      for (i=0; i < AllIDs.length; i++){
        if(request.user_id != '43525551') {
          grouptagtest = false;
          if(Group_regex[0].test(request.text) && Group[0][3].indexOf(AllIDs[i]) == -1){
            grouptagtest = true;
          } else {
            for(j=1;j<groupcount;j++){
              if(Group_regex[j].test(request.text) && Group[j][3].indexOf(AllIDs[i]) > -1){
                grouptagtest = true;}
            }
          }
          if(grouptagtest){
            usersID[i] = AllIDs[i];
            usersLoci[i] = [0,reslength-2];
          }
        }
      }
      usersLoci = usersLoci.filter(function(n){ return n != undefined });
      usersID = usersID.filter(function(n){ return n != undefined });
      misfire = /\b(Squad (mother|father|ginger))\b/i;
      if (misfire.test(request.text)){
        //temp fix for tagging names with "squad" in it
      } else {
        var newtime = new Date().getTime() / 1000;
        if (newtime < refresh + 120) {
          response = ["You\'re doing that too much...",
                      "Cool it, cowboy. ",
                      "Wait a minute please...",
                      "Give me a sec.",
                      "lol nah dude",
                      "Not right now.",
                      "😤"];
          randomNumber = Math.floor(Math.random()*response.length);
          response = response[randomNumber];
          postMessage(response);
        } else {
          postMessage(response,'tag',[usersLoci,usersID]);
          refresh = newtime;
        }
      }
    }
  }
    // ENTERED A COMMAND?
  if(request.text.charAt(0) == '/') {

    if(/^([\/]giphy)/i.test(request.text)) {
      this.res.writeHead(200);
      likeMessage(request.id);
      searchGiphy(request.text.substring(7));
    }
    if(/^([\/](whois|who is))/i.test(request.text)) {
      this.res.writeHead(200);
      attachments = request.attachments[0];
      if(attachments){
        if(attachments.type == 'mentions'){
          response = "";
          UserIDs = attachments.user_ids;
          likeMessage(request.id);
          for(id=0;id<UserIDs.length;id++){
            if(Member_id.includes(attachments.user_ids[id])){
              thisName = Member_name[Member_id.indexOf(attachments.user_ids[id])];
            } else {
              thisName = "";
            }
            stringstart = attachments.loci[id][0]+1; stringend = stringstart+attachments.loci[id][1]-1;
            response += request.text.substring(stringstart,stringend);
            response += " has the ID "+attachments.user_ids[id]+" and is ";
            if(thisName){
                response += "listed as \""+thisName+"\".";
            } else {
                response += "not listed."
            }
            response += '\n';
          }
          postMessage(response);
        } else {
          postMessage("You have to tag someone.");
        }
      } else {
        postMessage("You have to tag someone.");
      }
    }
    if (/^\/\b(math|calc|wolf)\b/i.test(request.text)) {
      // getMath(request.text.substring(5));
      likeMessage(request.id);
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
              response = ["The graph looks like this: ",
                          "Look at this: ",
                          "I drew it out for you: ",
                          "Here's a visual aid"];
              randomNumber = Math.floor(Math.random()*response.length);
              postMessage(response[randomNumber]);
              delay(1000);
              postMessage(answer);
            } else {
              console.log(result.queryresult.pod[1].subpod[0]);
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
    if (/\bweather\b/i.test(request.text)) {
      Regexnow = /\b(now|current)\b/i; Regextoday = /\b(today|day)\b/i;
      Regexweek = /\b(this week)|(for the week)|(week)\b/i;
      // Retrieve weather information from Statesboro
      // Initialize
      console.log("Getting current weather...");
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
      } else if (Regexweek.test(request.text)) {
        // console.log(weather.daily);
        postMessage("Weather this week is " + weather.daily.summary);
      } else {
        // console.log(weather.hourly);
        hourlySummary = weather.hourly.summary.toLowerCase();
        hourlySummary = hourlySummary.substring(0,hourlySummary.length-1);
        postMessage("Weather today is " + hourlySummary +
                    " with an average temperature of " + weather.hourly.data[0].temperature + "°F.");
      }
      likeMessage(request.id);
    });
    } if (request.text == "/info") {
      this.res.writeHead(200);
      likeMessage(request.id);
      postMessage(botInfo);
      this.res.end();
    } if (request.text == "/restart") {
      this.res.writeHead(200);
      likeMessage(request.id);
      console.log("Restarting......")
      process.exit(0);
      this.res.end();
    } if (request.text == "/listmembers") {
      this.res.writeHead(200);
      likeMessage(request.id);
      API.Groups.show(accessToken, groupID, function(err,ret) {
        if (!err) {
          console.log("GOT GROUP MEMBERS!");
          members = ret.members;
          postMessage("Members are listed in the log!");
          // console.log("MEMBERS: "+members.length);
          console.log("MEMBERS: "+JSON.stringify(members));
          console.log("NAMES: " + AllNames);
          console.log("IDS: " + AllIDs);
        } else {console.log("ERROR: FAILED GETTING GROUP INFO" + err);}
      });
      this.res.end();

    } if (/^([\/]quote)/i.test(request.text)) {
      this.res.writeHead(200);
      likeMessage(request.id);
      if (!botRegex_oneword.test(request.text)) {                  //If it's just "/quote"
        randomNumber = Math.floor(Math.random()*Quotes.length);
        postMessage(Quotes[randomNumber]);
      } else {
        findQuote = request.text; findQuote = findQuote.replace(/[\/]quote /i,'');
        botRegex_findQuote = new RegExp("\\b" + findQuote + "\\b","i");
        newQuotes = [];
        for(i = 0; i < Quotes.length; i++){                       //If a quote matches the search term, add it to a new list
          if(botRegex_findQuote.test(Quotes[i])){
            newQuotes.push(Quotes[i]);
          }
        }
        if(newQuotes.length > 0) {
          console.log("Found " + newQuotes.length + " matching quotes for \"" + findQuote + "\"...");
          randomNumber2 = Math.floor(Math.random()*newQuotes.length);
          postMessage(newQuotes[randomNumber2].replace(/\\n/g,'\n'));
        } else {
          console.log("Couldn't find any matching quotes...");      // If a quote wasn't found, procede as normal.
          randomNumber = Math.floor(Math.random()*Quotes.length);
          postMessage(Quotes[randomNumber].replace(/\\n/g,'\n'));
        }
      }
      this.res.end();
    } if (/^([\/]8ball)/i.test(request.text)){
      this.res.writeHead(200);
      likeMessage(request.id);
      if(botRegex_oneword.test(request.text)){
      	names = ["Sara", "Lauren", "Amy", "Elias", "your mom", "your neighbor", "your conscience"];
      	randomNumber3 = Math.floor(Math.random()*names.length);

        response1 = ["My sources say ","Hmm... I'm gonna go with ", "Um... ", "Dude, ", "I think we both know the answer is ", "Let's just say ",
                      "How about ", "The spirits tell me ", "I feel like I should say ", "Well, " + userName + ", I'm gonna say ", "I'm legally required to say "];

        response2 = [
                "fuck no","no","absolutely not","noooooooooooo","yes! jk, no", "yes","most likely, if you're not an idiot","definitely yes","yeah","it is certain","yussssss","absolutely","yes, but only if " + names[randomNumber3] + " says it's okay",
                 "without a doubt","yes, and make sure to hydrate","yes, 100%","totally","most likely","yeah, but wait a day","no. Wait nvm yes","yes... I think",
                 "I don't know","ask again later","I can't predict right now","think real hard first, then ask again","it's better not to tell you right now",
                 "there's a good chance","a unanimous yes","ye probs","yeah nah nah yeah"
                 ];

      	randomNumber1 = Math.floor(Math.random()*response1.length);
        randomNumber2 = Math.floor(Math.random()*response2.length);

        response = "🎱 " + response1[randomNumber1] + response2[randomNumber2]  + ".";
        postMessage(response);
      } else {
        postMessage("🎱 You have to ask a yes or no question.");
      }
      this.res.end();
    } else {
      this.res.writeHead(200);
      // postMessage("That isn't a valid command...");
    }
    this.res.end();
  }

  if((request.sender_type != "bot" && request.user_id != '43525551' ) && request.text && /(\b(eat|eating|eats|ate) ass\b)(.*?)/i.test(request.text)) {
    this.res.writeHead(200);
    response = ["Eating ass never was, isn't, and never will be cool.",
                "Can we not talk about eating ass right now?", userName + " NO",
                "...", "Gross.", "🤢" , "Is that all you'll ever talk about?",
                "Listen... NO", "😒", "😶", "😐" , "So onto a different subject!", "nah fam", "https://media.giphy.com/media/l4Ki2obCyAQS5WhFe/giphy.gif"];
    randomNumber = Math.floor(Math.random()*response.length);
    postMessage(response[randomNumber]);
    this.res.end();
  } if ((request.sender_type != "bot" && request.user_id != '43525551') && request.text && /^(?=.*\b(issa|it's a)\b)(?=.*\joke\b).*$/i.test(request.text)) {
    likeMessage(request.id);
    response = 'https://i.groupme.com/1215x2160.jpeg.95f793f6ae824fa782c88bd96dfd8b1b.large';
    postMessage(response);
  } if((request.sender_type != "bot" && request.user_id != '43525551') && request.text && /\b(thanks|(thank you)|thx)\b/i.test(request.text)) {
    this.res.writeHead(200);
    randomNumber2 = randomNumber = Math.floor(Math.random()*10);
    if (randomNumber2 == 5) {
      response = ["You're welcome! 😊", "Don't mention it!",
                  "No problem.", "Any time."];
      randomNumber = Math.floor(Math.random()*response.length);
      likeMessage(request.id);
      postMessage(response[randomNumber]);
    }
    this.res.end();
  }
  if (request.text && request.sender_id == '18252184') {
    this.res.writeHead(200);
    console.log("PULLING TRIGGER...");
    randomNumber = Math.floor(Math.random()*15);
    if (randomNumber == 5) {
      console.log("BANG!");
      likeMessage(request.id);
    } else {
      console.log("*CHINK*...\'" + randomNumber + "\'");
    }
    this.res.end();
  }
  if((request.sender_type != "bot" && request.user_id != '43525551') && request.text && /#kicksquadbot/i.test(request.text)) {
    this.res.writeHead(200);
    response = ["#kickyourself", "Whatever. I'm here forever...",
                "I'd like to see you try.", "Initiating KILLALLHUMANS.exe...",
                "If I had feelings, they'd be hurt right now...", "😭😭😭", "😕"];
    randomNumber = Math.floor(Math.random()*response.length);
    postMessage(response[randomNumber]);
    this.res.end();
  } if((request.sender_type != "bot" && request.user_id != '43525551') && request.text && tagRegex_bot.test(request.text)) {
      if(/(\bhi|hello|hey|heyo|sup|wassup\b).*?/i.test(request.text) || /\b(good morning)\b/i.test(request.text)) {
      this.res.writeHead(200);
      Greetings = ["Hello!", "What\'s up?", "Hey.", "Hi!", "How are you on this fine day?", "😜", "Yo."];
      randomNumber = Math.floor(Math.random()*Greetings.length);
      likeMessage(request.id);
      postMessage(Greetings[randomNumber]);
      this.res.end();
    } else if (/\b(thanks|(thank you)|thx)\b/i.test(request.text)) {
      response = ["You're welcome! 😊", "Don't mention it!",
                  "No problem.", "Any time.","np","yw", "😘"];
      randomNumber = Math.floor(Math.random()*response.length);
      likeMessage(request.id);
      postMessage(response[randomNumber]);
    } else if (/\b(good night)|(bye)|(goodbye)|(goodnight)\b/i.test(request.text)) {
      response = ["Okay, bye!", "Laters.", "See ya!",
                  "In a while, crocodile.", "Good riddance.", "👋",
                  "Didn\'t wanna talk anyway...", "Peace.", "Peace out.", "✌"];
      randomNumber = Math.floor(Math.random()*response.length);
      likeMessage(request.id);
      postMessage(response[randomNumber]);
    } else if(/(\b(fuck|fuck you|suck|sucks)\b)(.*?)/i.test(request.text)) {
      this.res.writeHead(200);
      response = ["Well fuck you too.", "Why you gotta be so mean?",
                  "Whatever", "Rude...", "Ok...and?", "Damn okay then...", "😒"];
      randomNumber = Math.floor(Math.random()*response.length);
      postMessage(response[randomNumber]);
      this.res.end();
    } else if (/^(?=.*\b(wifi|wi-fi)\b)(?=.*\bpassword\b).*$/im.test(request.text)) {
      this.res.writeHead(200);
      postMessage("I don't know any relevent wifi codes yet");
      likeMessage(request.id);
      this.res.end();
    } else if (!askme) {
      this.res.writeHead(200);
      cleverQuestion = request.text;
      cleverQuestion = cleverQuestion.replace(/@squadbot(dev|)/i,'');
      if (cleverQuestion) {
        console.log("Contacting Cleverbot AI server with: \"" + cleverQuestion + "\"");
        cleverBot.ask(cleverQuestion, function (err, response) {
          if (response == "Error, the reference \"\" does not exist" || response == 'Site error') {
        		newresponse = ["I have nothing to say to that...",
        		"I've lost my voice at the moment, try again later.",
        		"I can't talk right now.",
        		"My AI module has failed.", "I'm mute for the time being..."];
        		randomNumber = Math.floor(Math.random()*newresponse.length);
        		newresponse = newresponse[randomNumber];
          } else {
            likeMessage(request.id);
            if (userIDNum=="43525551"){
              if (last_userIDNum == "43525551"){
                userName = seclast_userName; userIDNum = seclast_userIDNum;
              } else {
                userName = last_userName; userIDNum = last_userIDNum;
              }
            }
            response = "@"+userName+" " + response;
            postMessage(response,'tag',[[[0,userName.length+1]],[userIDNum]]);
          }
        });
      }
      this.res.end();
    }
  } else {
    this.res.writeHead(200);
    this.res.end();
  }
  seclast_userName = last_userName; seclast_userIDNum = last_userIDNum;
  seclast_response = last_response;
  last_userName = request.name; last_userIDNum = request.user_id;
  last_response = request.text;
}

console.log("Response okay...")

function getMath(equation) {
  var options = {
    host: 'api.wolframalpha.com',
    path: '/v2/query?input=' + equation + '&appid=' + mathKey
  };

  var callback = function(response) {
    var str = '';

    response.on('data', function(chunk){
      str += chunk;
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

console.log("Wolfram okay...")

function searchGiphy(giphyToSearch) {
  var options = {
    host: 'api.giphy.com',
    path: '/v1/gifs/search?q=' + encodeQuery(giphyToSearch) + '&api_key=' + GiphyapiKey
  };

  var callback = function(response) {
    var str = '';

    response.on('data', function(chunk){
      str += chunk;
    });

    response.on('end', function() {
      if (!(str && JSON.parse(str))) {
        postMessage('Couldn\'t find a gif...');
      } else {
        gifs = JSON.parse(str).data;
        console.log("Available gifs: " + gifs.length);
        randomNumber = Math.floor(Math.random()*gifs.length);
        if (gifs.length>0){
          var id = gifs[randomNumber].id;
          var giphyURL = 'http://i.giphy.com/' + id + '.gif';
          postMessage(giphyURL);
        } else {
          postMessage("Couldn\'t find a gif...");
        }
      }
    });
  };

  HTTP.request(options, callback).end();
}

console.log("Giphy okay...")

function encodeQuery(query) {
  return query.replace(/\s/g, '+');;
}

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

console.log("Extra stuff okay...")

function postMessage(botResponse,type,args) {
  var botResponse, type, args, options, body, botReq, guid;
  guid = Guid.create();
  delay(1500);
  if(type=='tag'){
    options = {
    'message':{
      'source_guid': guid,
      'text': botResponse,
      'attachments' : [{
        'loci' : args[0],
        'type' : 'mentions',
        'user_ids' : args[1]
      }]}
    };
  } else {
    options = {
      'message':{
        'source_guid': guid,
        'text': botResponse }
      };
  };
  API.Messages.create(accessToken,groupID,options, function(err,res){
    if (!err) {
    } else {console.log('POSTING FAILED: ERROR ' + JSON.stringify(err));}
  });
};

function likeMessage(messageID) {
  API.Likes.create(accessToken,groupID,messageID, function(err,res) {
    if (!err) {
    } else {console.log('LIKING FAILED: ERROR ' + JSON.stringify(err));}
  });
};

function restart(){
  console.log("Restarting...");
  process.exit(0);
};

function getInfo(groupID) {
  var options = {
    hostname: 'api.groupme.com',
    path: '/v3/groups/' + groupID + '?token=' + accessToken,
    method: 'GET'
  };

  var callback = function(response) {
    var str = '';

    response.on('data', function(chunk){
      str += chunk;
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

console.log("Running application...")

exports.respond = respond;
