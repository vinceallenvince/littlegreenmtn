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
var CHECKPOINT_FILE = "~/development/ml/cv/countrymale/lm_seq30_epoch50.00_1.1655.t7";
var CHECKPOINT_TEMP = "0.5";
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

  pullText(res);
});

function pullText(res) {

	request('http://api.openweathermap.org/data/2.5/weather?zip=11215,us', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    var results = JSON.parse(body);
	    var primeText = results.weather[0].description;
	    console.log("primeText: %s", primeText);

	    var command = 'th ' + __dirname + '/char-rnn/sample.lua ' + __dirname + '/char-rnn/cv/' + CHECKPOINT_FILE + ' -temperature ' + CHECKPOINT_TEMP + ' -verbose 0 -length 5000 -primetext "' + primeText + '"';

			exec(command, function(err, stdout, stderr) {
				if (err) console.log(err);
				if (stdout) handleSample(stdout, primeText, res);
				if (stderr) console.log(stderr);
			});

	  }
	})
}

function handleSample(sample, primeText, res) {
	
	var sample = new Sample();
	var arr = sample.createSentenceArray(body, primeText);
	var upperBound = sample.findIndexRangeUpperBounds(arr);
	
	sample.removeBlankLines(arr).
			breakEachLine(arr).
			trimTotalCharsToMaxChars(Utils.getRandomNumber(0, upperBound), arr).
			removeFirstLineReturn(arr).
			capitalizeFirstLetterOfFirstLine(arr);

	var message = arr.join(" ");
	res.send(message);
	console.log(message);
	client.post('statuses/update', {status: message},  function(error, tweet, response) {
	  if (error) throw error;
	  console.log("Tweet success!"); 
	});
}