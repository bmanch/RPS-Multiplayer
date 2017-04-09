// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAw5OmICtP3YCW60CTDU95S_VcSp6spsKY",
    authDomain: "rock-paper-scissors-f9502.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-f9502.firebaseio.com",
    storageBucket: "rock-paper-scissors-f9502.appspot.com",
    messagingSenderId: "911386192043"
  };
  firebase.initializeApp(config);

var database = firebase.database();
var newPlayer = "";
var wins1 = 0;
var losses1 = 0;
var wins2 = 0;
var losses2 = 0;
var ties = 0;
var increment = 0;
var playerOneChoice = "";
var playerTwoChoice = "";
var userPlayerCount = 0;
var playerOneName = "";
var playerTwoName = "";
var roundNumber = 0;

$(document).ready(function() {

	database.ref("players").on("value", function(snapshot) {
		$('#firstPlayer').text(snapshot.val().player1.name);
		$('#secondPlayer').text(snapshot.val().player2.name);
		playerOneName = snapshot.val().player1.name;
		playerTwoName = snapshot.val().player2.name;

		$('#play1').html('<br>Wins: ' + snapshot.val().player1.wins + '<br>Losses: ' + snapshot.val().player1.losses + '<br>Ties: ' + snapshot.val().player1.ties);
		$('#play2').html('<br>Wins: ' + snapshot.val().player2.wins + '<br>Losses: ' + snapshot.val().player2.losses + '<br>Ties: ' + snapshot.val().player2.ties);
	});

	database.ref("rounds/round").on("value", function(snapshot) {
		console.log(snapshot.val() % 2);
		if (snapshot.val() % 2 === 1) {
			$('#results').html("");
			$('#yourChoice1').html("");
			$('#turnOdd').html("<br><strong>your turn, choose your weapon</strong>");
			$('#turnEven').html("");
			$('#playerOnePanel').css('background-color', '#FFB86F');
			$('#playerTwoPanel').css('background-color', '#fff');
		} else if (snapshot.val() > 1 && snapshot.val() % 2 === 0) {
			$('#yourChoice2').html("");
			$('#turnOdd').html("");
			$('#turnEven').html("<br><strong>your turn, choose your weapon</strong>");
			$('#playerOnePanel').css('background-color', '#fff');
			$('#playerTwoPanel').css('background-color', '#FFB86F');
		}
		round = snapshot.val();
	});

	database.ref("results").on("value", function(snapshot) {
		$('#playerTwoPanel').css('background-color', '#FFF');
		$('#turnEven').html("");
		$('#results').css('font-size', '20px');
		$('#results').css('color', '#B6174B');
		$('#results').append(snapshot.val().append1);
		$('#results').append(snapshot.val().append2);
		$('#results').append(snapshot.val().append3);
	});

	database.ref("chat").on("value", function(snapshot) {
		$('#chatMessage').append(snapshot.val().message + "<br>");
		//the .remove() function below might seem weird, but the chat feature is tied to an "unload" event. Thus, the notification that the user has disconnected would be carried to the next user's chat box unless I delete the chats as they come.
		//If the user just refreshes the page, then the disconnect message keeps displaying for the other user, but it is unlikely that the user would do this. It is also doesn't mess up game play or chat functionality at all.
		database.ref("chat").remove();
	});

	$('#joinButton').on('click', function(event) {
		event.preventDefault();
		userPlayerCount++;

		if ($('#player').val().trim() === "") {
			alert("please enter a name");
		} else {
			if (userPlayerCount === 1) {
				newPlayer = $('#player').val().trim();
				database.ref("players").once("value").then(function(snapshot) {
					if (snapshot.child("player1").exists()) {
						addPlayerTwo(newPlayer);
					} else {
						addPlayerOne(newPlayer);
					}
				});
				$('#player').val("");
			} else {
				alert("Nice try. You are already playing!");
				$('#player').val("");
			}
		}
	});

	function addPlayerOne(player) {
		database.ref("players/player1").set({
			name: player,
			wins: wins1,
			losses: losses1,
			ties: ties
		});

		localStorage.setItem("user", player);
	}

	function addPlayerTwo(player) {
		database.ref("players/player2").set({
			name: player,
			wins: wins2,
			losses: losses2,
			ties: ties
		});

		localStorage.setItem("user", player);
		setRound();
	}

	function setRound() {
		database.ref("rounds").set({
			round: 1
		});
	}

	$('.pick1').on('click', function() {
		if (localStorage.getItem("user") === playerOneName && round % 2 === 1) {
			$('#yourChoice1').html('<br><strong>You chose ' + $(this).data('type') + '!</strong>');
			database.ref("rounds").once("value").then(function(snapshot) {
				increment = snapshot.val().round + 1;
				console.log(increment);
				database.ref("rounds").set({
					round: increment
				});
			});
			playerOneChoice = $(this).data('type');
			database.ref("choices/user1").set({
				choice: playerOneChoice
			});
		} else if (localStorage.getItem("user") === playerTwoName) {
			alert("Hey " + playerTwoName + "! Only use your area!");
		} else {
			alert("Hey " + playerOneName + " wait your turn!");
		}
	});

	$('.pick2').on('click', function() {
		if (localStorage.getItem("user") === playerTwoName && round % 2 === 0) {
			$('#yourChoice2').html('<br><strong>You chose ' + $(this).data('type') + '!</strong>');
			database.ref("rounds").once("value").then(function(snapshot) {
				increment = snapshot.val().round + 1;
				console.log(increment);
				setTimeout(function(){
					database.ref("rounds").set({
						round: increment
					});
				}, 3000);

			});
			playerTwoChoice = $(this).data('type');
			database.ref("choices/user2").set({
				choice: playerTwoChoice
			});
			gameOutcome();
		} else if (localStorage.getItem("user") === playerOneName) {
			alert("Hey " + playerOneName + "! Only use your area!");
		} else {
			alert("Hey " + playerTwoName + " wait your turn!");
		}
	});

	function gameOutcome() {
		database.ref("choices").once("value").then(function(snapshot) {
			if (snapshot.val().user1.choice === "rock" && snapshot.val().user2.choice === "scissors") {
				playerOneWins("rock", "scissors");
			} else if (snapshot.val().user1.choice === "rock" && snapshot.val().user2.choice === "paper") {
				playerTwoWins("rock", "paper");
			} else if (snapshot.val().user1.choice === "paper" && snapshot.val().user2.choice === "rock") {
				playerOneWins("paper", "rock");
			} else if (snapshot.val().user1.choice === "paper" && snapshot.val().user2.choice === "scissors") {
				playerTwoWins("paper", "scissor");
			} else if (snapshot.val().user1.choice === "scissors" && snapshot.val().user2.choice === "paper") {
				playerOneWins("scissors", "paper");
			} else if (snapshot.val().user1.choice === "scissors" && snapshot.val().user2.choice === "rock") {
				playerTwoWins("scissors", "rock");
			} else if (snapshot.val().user1.choice === "rock" && snapshot.val().user2.choice === "rock") {
				playersTie("rock", "rock");
			} else if (snapshot.val().user1.choice === "paper" && snapshot.val().user2.choice === "paper") {
				playersTie("paper", "paper");
			} else {
				playersTie("scissors", "scissors");
			}
		});
	}

	function playerOneWins(user1, user2) {
		wins1++;
		losses2++;
		database.ref("results").set({
			append1: playerOneName + ' chose ' + user1,
			append2: '<br>' + playerTwoName + ' chose ' + user2,
			append3: '<br>' + playerOneName + ' wins!'
		});

		database.ref("players/player1").set({
			name: playerOneName,
			wins: wins1,
			losses: losses1,
			ties: ties
		});

		database.ref("players/player2").set({
			name: playerTwoName,
			wins: wins2,
			losses: losses2,
			ties: ties
		});
	}

	function playerTwoWins(user1, user2) {
		losses1++;
		wins2++;

		database.ref("results").set({
			append1: playerOneName + ' chose ' + user1,
			append2: '<br>' + playerTwoName + ' chose ' + user2,
			append3: '<br>' + playerTwoName + ' wins!'
		});

		database.ref("players/player1").set({
			name: playerOneName,
			wins: wins1,
			losses: losses1,
			ties: ties
		});
		
		database.ref("players/player2").set({
			name: playerTwoName,
			wins: wins2,
			losses: losses2,
			ties: ties
		});
	}

	function playersTie(user1, user2) {
		ties++;

		database.ref("results").set({
			append1: playerOneName + ' chose ' + user1,
			append2: '<br>' + playerTwoName + ' chose ' + user2,
			append3: '<br> It\'s a tie!'
		});

		database.ref("players/player1").set({
			name: playerOneName,
			wins: wins1,
			losses: losses1,
			ties: ties
		});
		
		database.ref("players/player2").set({
			name: playerTwoName,
			wins: wins2,
			losses: losses2,
			ties: ties
		});
	}

	$('#chatButton').on('click', function(event) {
		event.preventDefault();
		if ($('#chatText').val().trim() === "") {
			alert("Hey, you didn't type anything!");
		} else {
			database.ref("chat").set({
				message: localStorage.getItem("user") + ": " + $('#chatText').val().trim()
			});
			$('#chatText').val("");
		}
	});
	
	$(window).on('unload', function() {
		database.ref("chat").set({
			message: localStorage.getItem("user") + " has disconnected."
		});

		if (localStorage.getItem("user") === playerOneName) {
			database.ref("players/player1").remove();
			database.ref("rounds").remove();
			database.ref("choices").remove();
			database.ref("results").remove();
			localStorage.clear();
		} else if (localStorage.getItem("user") === playerTwoName) {
			database.ref("players/player2").remove();
			database.ref("rounds").remove();
			database.ref("choices").remove();
			database.ref("results").remove();
			localStorage.clear();
		}
	});
});