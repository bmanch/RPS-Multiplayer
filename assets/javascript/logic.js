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

var ties1 = 0;

var wins2 = 0;

var losses2 = 0;

var ties2 = 0;

var increment = 0;

var playerOneChoice = "";

var playerTwoChoice = "";

var userPlayerCount = 0;

$(document).ready(function() {

	database.ref("players").on("value", function(snapshot) {
		$('#firstPlayer').text(snapshot.val().player1.name);
		$('#secondPlayer').text(snapshot.val().player2.name);

		$('#play1').html('<br>Wins: ' + snapshot.val().player1.wins + '<br>Losses: ' + snapshot.val().player1.losses + '<br>Ties: ' + snapshot.val().player1.ties);
		$('#play2').html('<br>Wins: ' + snapshot.val().player2.wins + '<br>Losses: ' + snapshot.val().player2.losses + '<br>Ties: ' + snapshot.val().player2.ties);
	});

	database.ref("rounds/round").on("value", function(snapshot) {
		console.log(snapshot.val() % 2);
		if (snapshot.val() % 2 === 1) {
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
	});

	database.ref("results").on("value", function(snapshot) {
		$('#playerTwoPanel').css('background-color', '#FFF');
		$('#results').append(snapshot.val().append1);
		$('#results').append(snapshot.val().append2);
		$('#results').append(snapshot.val().append3);
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
			ties: ties1	
		});

		localStorage.setItem("user", "player-1");
	}

	function addPlayerTwo(player) {
		database.ref("players/player2").set({
			name: player,
			wins: wins2,
			losses: losses2,
			ties: ties2
		});

		localStorage.setItem("user", "player-2");
		setRound();
	}

	function setRound() {
		database.ref("rounds").set({
			round: 1
		});
	}

	$('.pick1').on('click', function() {
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
	});

	$('.pick2').on('click', function() {
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
	});

	function gameOutcome() {
		console.log("gameOutcome");
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
		// $('#results').append($('#firstPlayer').text() + ' chose ' + user1);
		// $('#results').append('<br>' + $('#secondPlayer').text() + ' chose ' + user2);
		// $('#results').append('<br>' + $('#firstPlayer').text() + ' wins!');
		database.ref("results").set({
			append1: $('#firstPlayer').text() + ' chose ' + user1,
			append2: '<br>' + $('#secondPlayer').text() + ' chose ' + user2,
			append3: '<br>' + $('#firstPlayer').text() + ' wins!'
		});

		database.ref("players/player1").set({
			wins: wins1,
			losses: losses1,
			ties: ties1
		});
		losses2++;
		database.ref("players/player2").set({
			wins: wins2,
			losses: losses2,
			ties: ties2
		});
	}

	function playerTwoWins(user1, user2) {
		losses1++;

		database.ref("results").set({
			append1: $('#firstPlayer').text() + ' chose ' + user1,
			append2: '<br>' + $('#secondPlayer').text() + ' chose ' + user2,
			append3: '<br>' + $('#secondPlayer').text() + ' wins!'
		});

		database.ref("players/player1").set({
			wins: wins1,
			losses: losses1,
			ties: ties1
		});
		wins2++;
		database.ref("players/player2").set({
			wins: wins2,
			losses: losses2,
			ties: ties2
		});
	}

	function playersTie(user1, user2) {
		ties1++;

		database.ref("results").set({
			append1: $('#firstPlayer').text() + ' chose ' + user1,
			append2: '<br>' + $('#secondPlayer').text() + ' chose ' + user2,
			append3: '<br> It\'s a tie!'
		});

		database.ref("players/player1").set({
			wins: wins1,
			losses: losses1,
			ties: ties1
		});
		ties2++;
		database.ref("players/player2").set({
			wins: wins2,
			losses: losses2,
			ties: ties2
		});
	}


	window.onunload = emptyOut();
	
	function emptyOut() {
		if (localStorage.getItem("user") === "player-1") {
			database.ref("players/player1").remove();
			database.ref("rounds").remove();
			database.ref("choices").remove();
			database.ref("results").remove();
			localStorage.clear();
		} else if (localStorage.getItem("user") === "player-2") {
			database.ref("players/player2").remove();
			database.ref("rounds").remove();
			database.ref("choices").remove();
			database.ref("results").remove();
			localStorage.clear();
		}
	}
});