function Sample(txt) {
	if (!txt) throw new Error("A new Sample requires a txt arugment.");
	this.txt = txt;
}

Sample.MAX_CHARS = 140;

Sample.LINES_TO_SKIP = {
	"[Instrumental]": true,
	"[Chorus]": true
};

/**
 * Removes array entries with no length.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.removeBlankLines = function(arr) {
	if (!arr) throw Error("Sample.removeBlankLines requires an array.");
	for (var i = arr.length - 1; i >= 0; i--) {
		if (!arr[i].length || Sample.LINES_TO_SKIP[arr[i]]) {
			arr.splice(i, 1);
		}
	}
	return arr;
};

/**
 * Removes array entries until total character count
 * is less than the max character count.
 * @param {number} startIndex The initial array entry.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.trimTotalCharsToMaxChars = function(startIndex, arr) {
	if (!arr) throw Error("Sample.trimTotalCharsToMaxChars requires a startIndex and an array.");
	var strCount = 0, l = arr.length;
	for (var i = startIndex; i < l && strCount <= Sample.MAX_CHARS; i++) {
		strCount += arr[i].length + 2;
	}
	return arr.slice(startIndex, i - 1);
};

/**
 * Adds a line break to all arr entries with
 * an index greater than 1.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.breakEachLine = function(arr) {
	if (!arr) throw Error("Sample.breakEachLine requires an array.");
	var l = arr.length;
	for (var i = 1; i < l; i++) {
		arr[i] = "\n" + arr[i];
	}
	return arr;
};

/**
 * Removes array entries with no length.
 * @param {Array} arr An array of strings.
 * @return {Array} An array.
 */
Sample.prototype.capitalizeFirstLetterOfFirstLine = function(arr) {
	if (!arr) throw Error("Sample.capitalizeFirstLetterOfFirstLine requires an array.");
	arr[0] = arr[0].charAt(0).toUpperCase() + arr[0].slice(1);
	return arr;
};

module.exports = Sample;