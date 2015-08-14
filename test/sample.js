var Sample = require('../src/sample');
var expect = require('expect');
var sinon = require('sinon');
var request = require("request");

var sample;
var TXT = "The Reflexes, Golden Wave, More Than Skies, and Yankee Longstraw at Cake Shop (August 10, 2015)";

beforeEach(function() {
	sample = new Sample(TXT);
});

describe('Sample', function() {

	it("should have required properties.", function () {
	    expect(sample.txt).toEqual(TXT);

	    //

	    var fn = function() {
	      	sample = new Sample();
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
			var results = sample.removeBlankLines(arr);
	    expect(results).toEqual(expectedResults);

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
			var results = sample.removeBlankLines(arr);
	    expect(results).toEqual(expectedResults);

	    var fn = function() {
	      	sample.removeBlankLines();
	    };
	    
	    expect(fn).toThrow();

	});

	it("should trim total chars to max chars.", function () {

			var arr = [
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
			var expectedResults = [
				"So I will make it through the night",
      	"And I'll be still the same again",
      	"You are my sinner honey you're my baby"
			];
			var results = sample.trimTotalCharsToMaxChars(3, arr);
	    expect(results).toEqual(expectedResults);

	});

	it("should break each line.", function () {

			var arr = [
				"And I'll be still the same again",
				"You are my sinner honey you're my baby",
				"Then I'll be right before the night"
			];
			var expectedResults = [
				"And I'll be still the same again",
				"\nYou are my sinner honey you're my baby",
				"\nThen I'll be right before the night"
			];
			var results = sample.breakEachLine(arr);
	    expect(results).toEqual(expectedResults);

	});

	it("should capitalize first letter of the first line.", function () {

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
			var results = sample.capitalizeFirstLetterOfFirstLine(arr);
	    expect(results).toEqual(expectedResults);

	});

});