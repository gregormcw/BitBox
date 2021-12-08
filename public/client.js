function changeVar(){
  document.getElementById("userType").value = "Select";

}

console.log("Client-side code running");

var curSelection = "";
var addToQueue = document.getElementById("enqueue");
var trackName = "";
var trackToAdd = 0;

// Set up a click event handling function for button
function addTrackToQueue(){

	curSelection = document.getElementById("song-selection");
	trackToAdd = curSelection.value;

	$.post(
		'/',   // url
		{ myData: trackToAdd }, // Data to be submitted
		function(data, status, jqXHR) {               // Callback
			console.log("callback at browser! " + trackToAdd);
		})
}