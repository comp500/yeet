const fs = require("fs");

let data = fs.readFileSync("out1.txt", "utf-8");
let lines = data.split("\r\n");
let src = "ha ha ha where's the etc mod".split(" ");
let seen = [];
let labels = [];

let lineNo = 0;
lines = lines.map(line => {
	let split = line.split(" -> ");
	let name = split[0];
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
	split[0] = name;
	return split.join(" -> ");
});

fs.writeFileSync("labels.txt", labels.join(" "));
fs.writeFileSync("invis.txt", seen.join(" -> "));
fs.writeFileSync("out2.txt", lines.join("\r\n"));
