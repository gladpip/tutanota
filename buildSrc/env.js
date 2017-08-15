// USE CASE              | TARGET SERVER     | HTML FILE  | BUILD COMMAND
// local                 | location.hostname | index.html | node build
// local app             | local IP address  | app.html   | node build
// local test            | test.tutanota.com | index.html | node build test
// local test app        | test.tutanota.com | app.html   | node build test
// local prod            | app.tutanota.com  | index.html | node build prod
// local prod app        | app.tutanota.com  | app.html   | node build prod

// test and prod release | location.hostname | index.html | node dist
// local app release     | local IP address  | app.html   | node dist
// local test release    | test.tutanota.com | index.html | node dist test
// test app release      | test.tutanota.com | app.html   | node dist test
// local prod release    | app.tutanota.com  | index.html | node dist prod
// prod app release      | app.tutanota.com  | app.html   | node dist prod

// Attention: The contents of this file is evaluated at compile time and not at runtime
function create(systemConfig, stagingLevel, staticUrl, version, mode, dist) {
	return {
		systemConfig,
		"stagingLevel": stagingLevel,
		"staticUrl": staticUrl,
		"mode": mode != null ? mode : "Browser",
		"versionNumber": version,
		"dist": dist != null ? dist : false,
		"timeout": 20000,
		"rootPathPrefix": ""
	}
}

module.exports = {
	create
}