const levenshtein = require("fast-levenshtein");
const wordListPath = require("word-list");
const fs = require("fs");
const rl = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});

const wordArray = fs
	.readFileSync(wordListPath, "utf8")
	.split("\n")
	.map(val => val.toLowerCase());

function mapping(previous, destination) {
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
			.reduce(
				(acc, value) => acc || mapping(previous.concat([value]), destination),
				null
			);
	} else {
		return null;
	}
}

function execute(input, destination) {
	let inputArray = input
		.toLowerCase()
		.replace(/[^\w ]/g, "")
		.split(" ");
	wordArray.push(destination);

	let cached = {};

	return inputArray.map(value => {
		if (cached[value] != null) {
			if (cached[value] == value) {
				console.log(`${value} unsolvable!`);
			}
			return cached[value];
		}
		let map = mapping([value], destination);
		if (map == null) {
			console.log(`${value} unsolvable!`);
			cached[value] = value;
			return value;
		}
		let done = map.reverse().join(" -> ");
		console.log(done);
		cached[value] = done;
		return done;
	});
}

if (process.argv.length > 2 && process.argv[2].trim().toLowerCase() == "dot") {
	rl.question("yeetify? ", answer => {
		let src = answer.split(" ");
		let out = execute(answer, "yeet");
		rl.close();

		let seen = [];
		let labels = [];

		let lineNo = 0;
		out = out.map(line => {
			let split = line.split(" -> ");
			let name = split[split.length - 1];
			if (seen.includes(name)) {
				let i = 2;
				while (seen.includes(name + i)) {
					i++;
				}
				name = name + i;
			}
			seen.push(name);
			labels.push(name + '[label="' + src[lineNo].replace(/"/g, '\\"') + '"]');
			lineNo++;
			split[split.length - 1] = name;
			return split.join(" -> ");
		});

		fs.writeFileSync(
			"yeet.gv",
			`digraph {
	rankdir=LR;
	
	{
		rank=same;
		ordering=out;
		${labels.join(" ")}
	}

	${seen.length > 0 ? seen.join(" -> ") + " [style=invis]" : ""}
	${out.join("\r\n\t")}
}`
		);
	});
} else {
	rl.question("yeetify? ", answer => {
		execute(answer, "yeet");
		rl.close();
	});
}
