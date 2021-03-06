/**
 * Creates a new Sample.
 * @param {number} maxChars The maximum character length to output.
 * @param {number} minLines The minimum lines in the sample text.
 * @param {Object} linesToSkip Lists strings to remove from final output.
 * @constructor
 */
function Sample(maxChars, minLines, linesToSkip) {
	if (typeof maxChars == "undefined" ||
		typeof minLines == "undefined" ||
		typeof linesToSkip == "undefined") {
		throw Error("A new Sample requires maxChars, minLines and linesToSkip.");
	}
	this.maxChars = maxChars;
	this.minLines = minLines;
	this.linesToSkip = linesToSkip;
}

/**
 * Returns the total number of characters in an array of strings plus the
 * array length. We also add the array length to represent a line return. 
 * @param {Array} arr An array of strings.
 * @return {number} Total characters.
 */
Sample.prototype._countTotalChars = function(arr) {
	if (!arr) throw Error("Sample._countTotalChars requires an array.");
	var totalChars = 0;
	arr.forEach(function(val) {
		totalChars += val.length;
	});
	return totalChars + arr.length;
};

// TODO: this should not break full words
/**
 * Trims the total number of characters in a string to match
 * the maximum character length. 
 * @param {Array} arr An array of strings.
 * @return {number} Total characters.
 */
Sample.prototype._trimLineToMaxLength = function(str) {
	if (str.length <= this.maxChars) {
		return str;
	}
	var strTrimmed = str.substr(0, this.maxChars);
	return strTrimmed.substr(0, strTrimmed.lastIndexOf(" "));
};

/**
 * Returns the upper bounds of the sample content.
 * @param {Array} arr An array of strings.
 * @return {number} The highest index to sample text.
 */
Sample.prototype.findIndexRangeUpperBounds = function(arr) {
	if (!arr) throw Error("Sample.findIndexRangeUpperBounds requires an array.");
	var totalChars = 0;
	for (var i = arr.length - 1; i >= 0; i--) { // iterate from end of array removing entries and testing char length
		totalChars += arr[i].length;
		if (totalChars >= this.maxChars) break;
	}
	return i;
};

/**
 * Creates an array of sentences split from a body of text.
 * @param {string} sample A body of text.
 * @param {string} [opt_primeText] Priming text.
 * @return {Array} An array.
 */
Sample.prototype.createSentenceArray = function(sample, opt_primeText) {
	if (!sample) throw Error("Sample.createSentenceArray requires a sample.");
	if (sample.length < this.maxChars) throw Error("Sample.createSentenceArray requires a sample longer than maxChars: %s", this.maxChars);
	var primeText = opt_primeText ? opt_primeText : "";
	var sampleArray = sample.replace(primeText, "").trim().split("\n");
	if (sampleArray.length > 20) {
		return sampleArray;
	}
	throw Error("Sample.createSentenceArray requires a sample with at least %s lines of text.", this.minLines);
};

/**
 * Removes array entries with no length.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.removeBlankLines = function(arr) {
	if (!arr) throw Error("Sample.removeBlankLines requires an array.");
	for (var i = arr.length - 1; i >= 0; i--) {
		if (!arr[i].length || this.linesToSkip[arr[i]]) {
			arr.splice(i, 1);
		}
	}
	return this;
};

/**
 * Trims all lines in the array.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.trimAllLines = function(arr) {
	if (!arr) throw Error("Sample.trimAllLines requires an array.");
	for (var i = 0, l = arr.length; i < l; i++) {
		arr[i] = arr[i].trim();
	}
	return this;
};

/**
 * Removes array entries until total character count
 * is less than the max character count.
 * @param {number} startIndex The initial array entry.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.trimTotalCharsToMaxChars = function(startIndex, arr) {
	if (!arr) throw Error("Sample.trimTotalCharsToMaxChars requires an array.");
	arr.splice(0, startIndex); // remove entries up to the start index

	for (var i = arr.length - 1; i >= 0; i--) { // iterate from end of array removing entries and testing char length
		arr[i] = this._trimLineToMaxLength(arr[i]);
		if (this._countTotalChars(arr) < this.maxChars) break;
		arr.pop();
	}
	return this;
};

/**
 * Adds a line break to all arr entries with
 * an index greater than 1.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.breakEachLine = function(arr) {
	if (!arr) throw Error("Sample.breakEachLine requires an array.");
	for (var i = 0, l = arr.length; i < l; i++) {
		arr[i] = "\n" + arr[i];
	}
	return this;
};

/**
 * Capitalize first character of first line.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.capitalizeFirstLetterOfFirstLine = function(arr) {
	if (!arr) throw Error("Sample.capitalizeFirstLetterOfFirstLine requires an array.");
	arr[0] = arr[0].charAt(0).toUpperCase() + arr[0].slice(1);
	return this;
};

/**
 * Remove first line return.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.removeFirstLineReturn = function(arr) {
	if (!arr) throw Error("Sample.removeFirstLineReturn requires an array.");
	arr[0] = arr[0].slice(1);
	return this;
};

module.exports = Sample;
