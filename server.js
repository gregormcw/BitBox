const express = require("express");
const bodyParser = require("body-parser");
const exec = require("child_process").exec;
const app = express();

// To do:
// - Provide user feedback when request received by server
// - Feedback should appear between "Select a Song" and dropdown menu
// - Feedback should appear, then slowly fade away
// - Add pause / stop button and greater controls for host user?
// - Add box showing next few tracks
// - User connects with server, and server pushes command information to other device?
// - Add visualization? Cassette tape turns when audio is playing? Spectrum of signal?
// - Add live, informal user interaction on host screen: "@gmc just queued up some Talking Heads!"
//    - This will keep users engaged with the app

// app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));

// =================================================================
// =================================================================
// ==== GLOBAL VARIABLES ===========================================
// =================================================================
// =================================================================

const portNumber = 3000;
var trackQueue = [];
var numUsers = 0;
var durString = "";
var isPlaying = false;
var defaultPlaylist = "Indie Party";

// Command-line strings for generating track duration and position information
const durCmd = "spotify status | grep 'Position:' | cut -d ' ' -f 4";

// =================================================================
// =================================================================
// ==== SYSTEM =====================================================
// =================================================================
// =================================================================

// Library allows for easy parsing of HTML data sent from browser
app.use(bodyParser.urlencoded( {
	extended:true
}));

// Set up node HTTP server via express to serve webpages
app.get("/", function(req, res) {

	// Increment number of current users, and log information
	numUsers++;
	console.log("Received HTTP request. " + numUsers + " users served\n");

	// Serve HTML file
	res.sendFile(__dirname + "/public/collBox.html");
	// res.sendFile(__dirname + "/public");
});

// When data is posted
app.post("/", function(req, res) {

	// requestIP = req.connection.remoteAddress;
	// console.log("Your IP address: " + requestIP);

	// Add track URI to queue
	trackQueue.push(req.body.myData);

	// Add track to end of queue
	console.log(req.body.myData + " added to position " + trackQueue.length + " in queue");

	// If only one track in queue, log information and play now
	if (trackQueue.length == 1) {

		// Log message stating selected song will be played immediately
		console.log("\nOne song in queue - playing now\n");

		// Play track at start of queue
		playTrack(trackQueue[0]);

	}

	else {

		// Log current queue details
		console.log("\nCurrent queue:\n");
		console.log(trackQueue);

	}

	// Then respond
	res.send("Data you sent: " + req.body.myData);

});

// Start listening for requests on port number 3000
app.listen(portNumber, function() {
	console.log("\nServer is running on port " + portNumber + "\n");

})

// =================================================================
// =================================================================
// ==== FUNCTIONS ==================================================
// =================================================================
// =================================================================

// Last task: Ensure duration is updated 

function manageQueue(dur) {

	console.log("Waiting " + dur/1000 + " seconds before next track");

	queue = setTimeout(() => {

		// Remove 0th track of queue, as this is finished
		trackQueue.shift();

		// If queue is empty, revert to default playlist
		if (trackQueue.length == 0) {

			// Log updated state
			console.log(
				"\nNo songs waiting - playing backup " + defaultPlaylist + " playlist\n");

			// Default playlist to be played
			playPlaylist(defaultPlaylist);

			// Break out of interval loop
			clearInterval(queue);

		}

		// Otherwise, play new 0th track of queue
		else {

			// Play 0th track in queue
			playTrack(trackQueue[0]);

			// Log information of new track and updated queue state
			console.log("\nNow playing: " + trackQueue[0]);
			console.log("\nCurrent queue:\n");
			console.log(trackQueue);

		}

		// Carry out above instructions only once the time, below, has elapsed
	}, dur-1000);

}

function playTrack(trackURI) {

	// Play next track in queue
	runShell("spotify play uri " +  trackURI).then(results => {

		console.log(results)

		runShell(durCmd).then(results => {

			let dur = -1;

			// Split string using ':' as delimiter
			durString = results.split(":");

			// Calculate duration of track in milliseconds
			dur = parseInt(durString[0]) * 60000 + parseInt(durString[1]) * 1000;

			// Log information
			console.log("Track duration: " + results);

			// Start up queue management function
			manageQueue(dur);

		}).catch(e=>{console.log(e)});


	}).catch(e=>{console.log(e)})

}

function playPlaylist(playlistName) {

	// Play next track in queue
	runShell("spotify play list " +  playlistName).then(results => {
		console.log(results)
		}).catch(e=>{console.log(e)})

	// Set isPlaying flag to true
	isPlaying = true;

}

// Function to calculate track duration from command line
function getTrackDuration() {

	let dur = -1;

	// Retrieve duration of track as string
	runShell(durCmd).then(results => {

			// Split string using ':' as delimiter
			durString = results.split(":");

			// Calculate duration of track in milliseconds
			dur = parseInt(durString[0]) * 60000 + parseInt(durString[1]) * 1000;

			// Log information
			console.log("Track duration: " + dur);

		}).catch(e=>{console.log(e)});

	return dur;
}

// Function to run command-line scripts
function runShell(cmd) {

	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout, stderr) => {
			if (error)
				reject(error);
			else
				resolve(stdout);

		});
	});
}