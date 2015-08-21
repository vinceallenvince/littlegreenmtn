var Sample = require('../src/sample');
var expect = require('expect');
var sinon = require('sinon');
var request = require("request");
var Utils = require('drawing-utils-lib');
var sampleArrayLong = require('./sampleArrayLong');

var sample;
var MAX_CHARS = 140;
var MIN_LINES = 20;
var LINES_TO_SKIP = {
	"[Instrumental]": true,
	"[Chorus]": true
};
var SAMPLED_ARRAY = [
	"I saw the light of a clear blue morning",
	"But I don't want to talk about it now",
	"I know it's over I'm so happy and I haven't said that I could be",
	"So I will make it through the night",
	"And I'll be still the same again",
	"You are my sinner honey you're my baby",
	"Then I'll be right before the night",
	"And I know that I'm a lovin' baby in the morning",
	"And I'm lookin' for a heart of gold",
	"I made a mistake that I can't love again",
	"I ain't got nothin' but time",
	"Oh you see me off my mind",
	"I never got to see you in the way",
	"You're the one that I would be on my feet",
	"When you were feeling salty and more",
	"And I won't be home no more.",
	"I was born to love you as long as I can",
	"And I'm gonna love you the way it used to",
	"And the reason I can see the light of a clear blue morning",
	"I gotta get the best of you and me",
	"And I'll be home and I'm so lonely I'm going through",
	"It was a rounder in my heart"
];

beforeEach(function() {
	sample = new Sample(MAX_CHARS, MIN_LINES, LINES_TO_SKIP);
});

describe('Sample', function() {

	it("should have required properties.", function () {
    expect(sample.maxChars).toEqual(MAX_CHARS);
    expect(sample.minLines).toEqual(MIN_LINES);
    expect(sample.linesToSkip).toEqual(LINES_TO_SKIP);

    var fn = function() {
      	sample = new Sample();
    };
    
    expect(fn).toThrow();
	});

	it("should count total chars.", function () {

		var fn = function() {
      sample._countTotalChars();
    };
    
    expect(fn).toThrow();
		var arr = [
			"1234",
			"5678"
		];
		var expectedResults = arr[0].length + arr[1].length + arr.length;
		var results = sample._countTotalChars(arr);
    expect(results).toEqual(expectedResults);
	});

	it("should trim lines to max char length.", function () {
		var str = "I saw the light of a clear blue morning But I don't want to talk about it now I know it's over I'm so happy and I haven't said that I could be So I will make it through the night And I'll be still the same again";
		str = sample._trimLineToMaxLength(str);

		expect(str).toEqual("I saw the light of a clear blue morning But I don't want to talk about it now I know it's over I'm so happy and I haven't said that I could");
	});

	it("should find the array index representing the upper bounds of the sample content.", function () {

		var fn = function() {
      sample.findIndexRangeUpperBounds();
    };
    
    expect(fn).toThrow();

	  //

		var arr = SAMPLED_ARRAY;
		var expectedResults = 18;
		var results = sample.findIndexRangeUpperBounds(arr);
    expect(results).toEqual(expectedResults);

	});

	it("should create an array of sentences sampled from a body of text.", function () {

		var fn = function() {
      	sample.createSentenceArray();
    };
    
    expect(fn).toThrow();

    //

		var body = "I saw the light of a clear blue morning\nBut I don't want to talk about it now\nI know it's over I'm so happy and I haven't said that I could be\nSo I will make it through the night\nAnd I'll be still the same again\nYou are my sinner honey you're my baby\nThen I'll be right before the night\nAnd I know that I'm a lovin' baby in the morning\nAnd I'm lookin' for a heart of gold\nI made a mistake that I can't love again\nI ain't got nothin' but time\nOh you see me off my mind\nI never got to see you in the way\nYou're the one that I would be on my feet\nWhen you were feeling salty and more\nAnd I won't be home no more.\nI was born to love you as long as I can\nAnd I'm gonna love you the way it used to\nAnd the reason I can see the light of a clear blue morning\nI gotta get the best of you and me\nAnd I'll be home and I'm so lonely I'm going through\nIt was a rounder in my heart";

		var expectedResults = SAMPLED_ARRAY
		var results = sample.createSentenceArray(body);
    expect(results).toEqual(expectedResults);

	});

	it("sample.createSentenceArray should remove primeText from passed sample.", function () {

		var primeText = "partly cloudy";
		var body = primeText + " I saw the light of a clear blue morning\nBut I don't want to talk about it now\nI know it's over I'm so happy and I haven't said that I could be\nSo I will make it through the night\nAnd I'll be still the same again\nYou are my sinner honey you're my baby\nThen I'll be right before the night\nAnd I know that I'm a lovin' baby in the morning\nAnd I'm lookin' for a heart of gold\nI made a mistake that I can't love again\nI ain't got nothin' but time\nOh you see me off my mind\nI never got to see you in the way\nYou're the one that I would be on my feet\nWhen you were feeling salty and more\nAnd I won't be home no more.\nI was born to love you as long as I can\nAnd I'm gonna love you the way it used to\nAnd the reason I can see the light of a clear blue morning\nI gotta get the best of you and me\nAnd I'll be home and I'm so lonely I'm going through\nIt was a rounder in my heart";

		var expectedResults = SAMPLED_ARRAY

		var results = sample.createSentenceArray(body, primeText);
    expect(results).toEqual(expectedResults);
	});
	
	it("sample.createSentenceArray should require a passed sample with > maxChars of text.", function () {

		var body = "I saw the light of a clear blue morning\nBut I don't want to talk about it now";

    var fn = function() {
      	var results = sample.createSentenceArray(body);
    };
    
    expect(fn).toThrow();
	});

	it("sample.createSentenceArray should require a passed sample with > minLines of text.", function () {

		var body = "I saw the light of a clear blue morning\nBut I don't want to talk about it now\nI know it's over I'm so happy and I haven't said that I could be\nSo I will make it through the night\nAnd I'll be still the same again\nYou are my sinner honey you're my baby";

    var fn = function() {
      	var results = sample.createSentenceArray(body);
    };
    
    expect(fn).toThrow();
	});

	it("should remove blank lines and lines to skip.", function () {

		var arr = [
			"line A",
			"",
			"line B",
			"line C",
			"",
			""
		];
		var expectedResults = [
			"line A",
			"line B",
			"line C"
		];
		sample.removeBlankLines(arr);
    expect(arr).toEqual(expectedResults);

		var arr = [
			"line A",
			"[Instrumental]",
			"line B",
			"line C",
			"[Chorus]",
			"[Instrumental]"
		];
		var expectedResults = [
			"line A",
			"line B",
			"line C"
		];
		sample.removeBlankLines(arr);
    expect(arr).toEqual(expectedResults);

    var fn = function() {
      	sample.removeBlankLines();
    };
    
    expect(fn).toThrow();

	});

it("should trim all whitespace at the beginning and end of lines.", function () {

		var fn = function() {
      sample.trimAllLines();
    };

    expect(fn).toThrow();

		var arr = [
			"I saw the light of a clear blue morning ",
			"But I don't want to talk about it now ",
			"I know it's over I'm so happy and I haven't said that I could be ",
			"So I will make it through the night "
		];
		var expectedResults = [
			"I saw the light of a clear blue morning",
			"But I don't want to talk about it now",
			"I know it's over I'm so happy and I haven't said that I could be",
			"So I will make it through the night"
		];
		sample.trimAllLines(arr);
    expect(arr).toEqual(expectedResults);

	});


	it("should trim total chars to max chars.", function () {

		var fn = function() {
	    sample.trimTotalCharsToMaxChars();
	  };
  
  	expect(fn).toThrow();


		var arr = SAMPLED_ARRAY;
		var expectedResults = [
			"So I will make it through the night",
    	"And I'll be still the same again",
    	"You are my sinner honey you're my baby"
		];
		sample.trimTotalCharsToMaxChars(3, arr);
    expect(arr).toEqual(expectedResults);

	});


	it("should break each line.", function () {

    var fn = function() {
      sample.breakEachLine();
    };
    
    expect(fn).toThrow();

    //

		var arr = [
			"And I'll be still the same again",
			"You are my sinner honey you're my baby",
			"Then I'll be right before the night"
		];
		var expectedResults = [
			"\nAnd I'll be still the same again",
			"\nYou are my sinner honey you're my baby",
			"\nThen I'll be right before the night"
		];
		sample.breakEachLine(arr);
    expect(arr).toEqual(expectedResults);
	});

	it("should capitalize first letter of the first line.", function () {

		var fn = function() {
      sample.capitalizeFirstLetterOfFirstLine();
    };
    
    expect(fn).toThrow();

    //

		var arr = [
			"and I'll be still the same again",
			"You are my sinner honey you're my baby",
			"Then I'll be right before the night"
		];
		var expectedResults = [
			"And I'll be still the same again",
			"You are my sinner honey you're my baby",
			"Then I'll be right before the night"
		];
		sample.capitalizeFirstLetterOfFirstLine(arr);
    expect(arr).toEqual(expectedResults);
	});

	it("should remove the first line return.", function () {

		var fn = function() {
      sample.removeFirstLineReturn();
    };
    
    expect(fn).toThrow();

    //

		var arr = [
			"\nand I'll be still the same again",
			"\nYou are my sinner honey you're my baby",
			"\nThen I'll be right before the night"
		];
		var expectedResults = [
			"and I'll be still the same again",
			"\nYou are my sinner honey you're my baby",
			"\nThen I'll be right before the night"
		];
		sample.removeFirstLineReturn(arr);
    expect(arr).toEqual(expectedResults);
	});

	it("should create a tweetable phrase from a body of text given a fixed starting point in the text.", function () {

		var body = "I saw the light of a clear blue morning\nBut I don't want to talk about it now\nI know it's over I'm so happy and I haven't said that I could be\nSo I will make it through the night\nAnd I'll be still the same again\nYou are my sinner honey you're my baby\nThen I'll be right before the night\nAnd I know that I'm a lovin' baby in the morning\nAnd I'm lookin' for a heart of gold\nI made a mistake that I can't love again\nI ain't got nothin' but time\nOh you see me off my mind\nI never got to see you in the way\nYou're the one that I would be on my feet\nWhen you were feeling salty and more\nAnd I won't be home no more.\nI was born to love you as long as I can\nAnd I'm gonna love you the way it used to\n[Chorus]\nAnd the reason I can see the light of a clear blue morning\nI gotta get the best of you and me\nAnd I'll be home and I'm so lonely I'm going through\n[Instrumental]\nIt was a rounder in my heart";
		var primeText = "partly cloudy";

		var arr = sample.createSentenceArray(body, primeText);
		
		sample.removeBlankLines(arr).
				breakEachLine(arr).
				trimTotalCharsToMaxChars(3, arr).
				capitalizeFirstLetterOfFirstLine(arr);

		var expectedResults = [
			'\nSo I will make it through the night',
			'\nAnd I\'ll be still the same again',
			'\nYou are my sinner honey you\'re my baby'
		];

		var str = arr.join(" ").length;

		expect(arr).toEqual(expectedResults);
		expect(str).toBeLessThan(MAX_CHARS);
	});

	it("should create a tweetable phrase from a body of text given a random starting point in the text.", function() {
		var maxTests = 50000;
		for (var i = 0; i < maxTests; i++) {

			var arr = sampleArrayLong;

			sample.removeBlankLines(arr);
 
			var upperBound = sample.findIndexRangeUpperBounds(arr);
						
			sample.trimAllLines(arr).
					breakEachLine(arr).
					trimTotalCharsToMaxChars(Utils.getRandomNumber(0, upperBound), arr).
					removeFirstLineReturn(arr).
					capitalizeFirstLetterOfFirstLine(arr);

			var message = arr.join(" ");
			expect(message.length <= MAX_CHARS).toEqual(true);
		}
	});

});