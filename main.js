var config = require('./config').config;
var express = require('express');
var app = express();
var url = require('url');
var bodyParser = require('body-parser');
var json = require('express-json');
var exec = require('child_process').exec;
var request = require('request');
var Twitter = require('twitter');
var Sample = require('./sample');
 
var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

var MAX_CHARS = 140;
var checkpointFile = "johnnycash/lm_seq30_epoch3.15_1.6535.t7";
var checkpointTemperature = "0.5";

app.use(bodyParser.json());
app.use(json());

/**
 * IFTTT Trigger publishes Particle event
 * webhook posts to this app
 * do something based on args
 */

var server = app.listen(4000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

app.get('/', function (req, res) {

  var key = req.query.key;

  if (key != config.key) {
    console.log("request rejected. key: %s", key);
    res.send("GET rejected.");
    return;
  }

  pullText();

});

app.post('/', function (req, res) {
  console.log(req);
  res.send('POST request');
});

function pullText() {

	request('http://api.openweathermap.org/data/2.5/weather?zip=11215,us', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var results = JSON.parse(body);
	    var primeText = results.weather[0].description;
	    console.log("primeText: %s", primeText);

	    var command = 'th ' + __dirname + '/char-rnn/sample.lua ' + __dirname + '/char-rnn/cv/' + checkpointFile + ' -temperature ' + checkpointTemperature + ' -verbose 0 -length 5000 -primetext "' + primeText + '"';

			exec(command, function(err, stdout, stderr) {
				if (err) console.log(err);
				if (stdout) handleSample(stdout, primeText);
				if (stderr) console.log(stderr);
			});

	  }
	})
}

/*function handleSample_(sample, primeText) {

	var smp = new Sample();
	var arr = smp.createSentenceArray(sample, primeText);
	smp.removeBlankLines(arr).
			trimTotalCharsToMaxChars(startIndex, arr).
			breakEachLine(arr).
			capitalizeFirstLetterOfFirstLine(arr);

	var message = arr.join(" ");
	console.log(message);
	client.post('statuses/update', {status: message},  function(error, tweet, response) {
	  if (error) throw error;
	  console.log("Tweet success!"); 
	});

}*/

function handleSample(sample, primeText) {



	// split the string into an array of sentences
	var arr = sample.replace(primeText, "").trim().split("\n");

	// remove blank lines
	for (var i = arr.length - 1; i >= 0; i--) {
		if (!arr[i].length || arr[i] == "[Instrumental]") {
			arr.splice(i, 1);
		}
	}

	// select a starting line
	var startIndex = getRandomNumber(0, arr.length - 8);
	//console.log("startIndex: " + startIndex);

	// trim total chars to max chars
	var strCount = 0, l = arr.length;
	for (var i = startIndex; i < l && strCount <= MAX_CHARS; i++) {
		strCount += arr[i].length + 2;
		//console.log("arr[i].length: " + arr[i].length + " strCount: " + strCount);
	}
	arrTrimmed = arr.slice(startIndex, i - 1);
	
	// add line breaks
	var l = arrTrimmed.length;
	for (var i = 1; i < l; i++) {
		arrTrimmed[i] = "\n" + arrTrimmed[i];
	}

	// capitalize first letter of first line
	arrTrimmed[0] = arrTrimmed[0].charAt(0).toUpperCase() + arrTrimmed[0].slice(1);

	// 

	var message = arrTrimmed.join(" ");
	console.log(message);
	client.post('statuses/update', {status: message},  function(error, tweet, response) {
	  if (error) throw error;
	  console.log("Tweet success!"); 
	});
	

}

function getRandomNumber(low, high, flt) {
  if (flt) {
    return (Math.random() * (high - low)) + low;
  }
  high++;
  return Math.floor((Math.random() * (high - low))) + low;
};

