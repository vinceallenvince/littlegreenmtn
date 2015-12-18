var config = require('./config').config;
var express = require('express');
var app = express();
var url = require('url');
var bodyParser = require('body-parser');
var json = require('express-json');
var exec = require('child_process').exec;
var request = require('request');
var Utils = require('drawing-utils-lib');
var Twitter = require('twitter');
var Sample = require('./src/sample');
 
var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
});

var MAX_CHARS = 140;
var MIN_LINES = 20;
var LINES_TO_SKIP = {
	"[Instrumental]": true,
	"[Chorus]": true
};
var CHECKPOINT_FILE = "~/development/ml/cv/countrymale/lm_seq30_epoch50.00_1.1655.t7";
var CHECKPOINT_TEMP = "0.5";
var CHECKPOINT_SEED = 1234;
var SAMPLE_LENGTH = 1000;

app.use(bodyParser.json());
app.use(json());

var server = app.listen(4000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);

});

app.get('/', function (req, res) {

  var key = req.query.key;

  if (key != config.key) {
    console.log("request rejected. key: %s", key);
    res.send("GET rejected.");
    return;
  }

  if (req.query.temperature) {
		CHECKPOINT_TEMP = req.query.temperature;
  }

  CHECKPOINT_SEED = Utils.getRandomNumber(0, 1000);

  pullText(res);
});

function pullText(res) {
  var url = "http://api.openweathermap.org/data/2.5/weather?APPID=" + config.open_weather_key + "&zip=11215,us";
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var results = JSON.parse(body);
	    var primeText = results.weather[0].description;
	    console.log("Prime text: %s", primeText);
      console.log("Char-rnn temperature: %s", CHECKPOINT_TEMP);

	    var command = 'th ' + __dirname + '/char-rnn/sample.lua ' + CHECKPOINT_FILE + ' -temperature ' + CHECKPOINT_TEMP + ' -verbose 0 -length 5000 -primetext "' + primeText + '"';

			exec(command, function(err, stdout, stderr) {
				if (err) console.log(err);
				if (stdout) handleSample(stdout, primeText, res);
				if (stderr) console.log(stderr);
			});

	  } else {
      console.log("Error: ", error);
      console.log("Response code: %s", response.statusCode);
      var msgBody = JSON.parse(response.body);
      console.log("Response body: %s", msgBody.message);
      if (msgBody.message) {
        res.send(msgBody.message);
      }
    }
	})
}

function handleSample(text, primeText, res) {

	var sample = new Sample(MAX_CHARS, MIN_LINES, LINES_TO_SKIP);
	var arr = sample.createSentenceArray(text, primeText);

	sample.removeBlankLines(arr);

	var upperBound = sample.findIndexRangeUpperBounds(arr);

	sample.trimAllLines(arr).
			breakEachLine(arr).
			trimTotalCharsToMaxChars(Utils.getRandomNumber(0, upperBound), arr).
			removeFirstLineReturn(arr).
			capitalizeFirstLetterOfFirstLine(arr);

	var message = arr.join(" ");
	res.send(message);
	console.log(message);
	client.post('statuses/update', {status: message},  function(error, tweet, response) {
	  if (error) throw error;
	  var body = JSON.parse(response.body);
	  console.log("Tweeted: %s", body.created_at);
	  console.log("Tweet id: %s", body.id);
	  console.log(" ");
	});
}