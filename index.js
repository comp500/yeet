const levenshtein = require("fast-levenshtein");
const wordListPath = require("word-list");
const fs = require("fs");

const wordArray = fs
	.readFileSync(wordListPath, "utf8")
	.split("\n")
	.map(val => val.toLowerCase());
const inputArray = "quat"
	.toLowerCase()
	.replace(/[^\w ]/g, "")
	.split(" ");
const destination = "yeet";
wordArray.push(destination);

function mapping(previous) {
	let last = previous[previous.length - 1];
	let newValues = wordArray.filter(word => levenshtein.get(word, last) == 1);
	if (newValues.includes(destination)) {
		previous.push(destination);
		return previous;
	}
	if (newValues.length > 0) {
		return newValues
			.filter(value => !previous.includes(value))
			.filter(
				value =>
					1 <
					Math.min(
						...previous.slice(0, -1).map(prev => levenshtein.get(value, prev))
					)
			)
			.sort(
				(a, b) =>
					levenshtein.get(a, destination) - levenshtein.get(b, destination)
			)
			.reduce((acc, value) => acc || mapping(previous.concat([value])), null);
	} else {
		return null;
	}
}

let cached = {};

let out = inputArray.map(value => {
	if (cached[value] != null) {
		console.log(cached[value]);
		return cached[value];
	}
	let map = mapping([value]);
	if (map == null) {
		console.log(value);
		cached[value] = value;
		return value;
	}
	let done = map.join(" -> ");
	console.log(done);
	cached[value] = done;
	return done;
});
fs.writeFileSync("out1.txt", out.join("\r\n"));
