var express = require('express');
var router = express.Router();
const axios = require('axios');
var firebase = require("firebase/app");
require('firebase/auth');
require("firebase/database");

var firebaseConfig = {
  apiKey: "AIzaSyDIgnb_DdJICzuuRJm1ORzeQqyyNoP0yrk",
  authDomain: "blockchain-keeper.firebaseapp.com",
  databaseURL: "https://blockchain-keeper.firebaseio.com",
  storageBucket: "blockchain-keeper.appspot.com",
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

/* GET home page. */
router.get('/:user/', function (req, res, next) {
  res.render('index', {user: req.params.user});
});

router.get('/:user/league', function (req, res, next) {
  firebase.database().ref('/users/').once('value').then(function(snapshot) {
    let users = {users: []};
    var response = (snapshot.val());
    Object.keys(response).forEach(function (entry){
      users.users.push({'name':entry, 'win': response[entry].win, 'loss': response[entry].loss, 'tie': response[entry].tie});
    });
    users.users.sort(function(a, b) {
      return b.win - a.win  ||  b.tie - a.tie;
    });
    res.render('league', {user: req.params.user, users: users.users});
  });
});

router.get('/:user/league/:otherUser', function (req, res, next) {
  res.render('otherTeam', {user: req.params.user, otherUser: req.params.otherUser, yourPlayers: [{ 'name': 'Lebron James', 'ftp': '.900', 'fgp': '.600', 'three': '5', 'pts': '25', 'reb': '8', 'ast': '5', 'st': '0', 'blk': '1', 'to': '2', 'game': '8:00 PM @ UTA' }], players: [{ 'name': 'lebron james', 'ftp': '.900', 'fgp': '.600', 'three': '5', 'pts': '25', 'reb': '8', 'ast': '5', 'st': '0', 'blk': '1', 'to': '2', 'game': '8:00 PM @ UTA' }] });
});

router.get('/:user/matchup', function (req, res, next) {
  res.render('matchup', {user: req.params.user, you: { 'name': 'Kunj', 'score': '4', 'ftp': '.900', 'fgp': '.600', 'three': '5', 'pts': '25', 'reb': '8', 'ast': '5', 'st': '0', 'blk': '1', 'to': '2' }, opp: { 'name': 'Parth', 'score': '4', 'ftp': '.900', 'fgp': '.600', 'three': '5', 'pts': '25', 'reb': '8', 'ast': '5', 'st': '0', 'blk': '1', 'to': '2' } });
});

router.get('/:user/players', function (req, res, next) {
  let players = { players: [] };
  firebase.database().ref('/').once('value').then(function (snapshot) {
    let waivers = snapshot.val().waiver.players.join(',');
 
    if (req.query.player == null) req.query.player = '';
    axios.get('https://api.mysportsfeeds.com/v2.1/pull/nba/current/player_stats_totals.json', {
      headers: { Authorization: 'Basic ODg5YzA4MjUtZWFkNC00YWRkLWE3ZjUtMmEyZGU4Ok1ZU1BPUlRTRkVFRFM=' },
      params: {player:waivers}
    })
      .then(response => {
        let data = response.data.playerStatsTotals;
        data.forEach(function (entry) {
          players.players.push({ 'name': entry.player.firstName + ' ' + entry.player.lastName, 'ftp': entry.stats.freeThrows.ftPct, 'fgp': entry.stats.fieldGoals.fgPct, 'three': entry.stats.fieldGoals.fg3PtMadePerGame, 'pts': entry.stats.offense.ptsPerGame, 'reb': entry.stats.rebounds.rebPerGame, 'ast': entry.stats.offense.astPerGame, 'st': entry.stats.defense.stlPerGame, 'blk': entry.stats.defense.blkPerGame, 'to': entry.stats.defense.tovPerGame })
        });
        res.render('players', {user: req.params.user, yourPlayers: snapshot.val().users[req.params.user].players,
          players: players.players.filter(function (player) {
            return player.name.toLowerCase().includes(req.query.player);
          })
        });
      })
      .catch(error => {
        console.log(error);
      });
  });
});

router.get('/:user/team', function (req, res, next) {
  firebase.database().ref('/users/' + req.params.user + '/players').once('value').then(function (snapshot) {
    let players = { players: [] };
    let names = snapshot.val().join(',');
    axios.get('https://api.mysportsfeeds.com/v2.1/pull/nba/current/player_stats_totals.json', {
      headers: { Authorization: 'Basic ODg5YzA4MjUtZWFkNC00YWRkLWE3ZjUtMmEyZGU4Ok1ZU1BPUlRTRkVFRFM=' },
      params: { player: names }
    })
      .then(response => {
        let data = response.data.playerStatsTotals;
        data.forEach(function (entry) {
          players.players.push({ 'name': entry.player.firstName + ' ' + entry.player.lastName, 'ftp': entry.stats.freeThrows.ftPct, 'fgp': entry.stats.fieldGoals.fgPct, 'three': entry.stats.fieldGoals.fg3PtMadePerGame, 'pts': entry.stats.offense.ptsPerGame, 'reb': entry.stats.rebounds.rebPerGame, 'ast': entry.stats.offense.astPerGame, 'st': entry.stats.defense.stlPerGame, 'blk': entry.stats.defense.blkPerGame, 'to': entry.stats.defense.tovPerGame })
        });
        res.render('team', {user: req.params.user, players:players.players});
      });
  });
});

router.get('/:user/trades', function (req, res, next) {
  res.render('trades', {user: req.params.user, sentTrades: [{ 'from': 'Kunj', 'to': 'Parth', 'getPlayers': ['Steph Curry', 'Marcus Smart'], 'sendPlayers': ['James Harden'] }], recievedTrades: [{ 'from': 'Parth', 'to': 'Kunj', 'getPlayers': ['Steph Curry', 'Marcus Smart'], 'sendPlayers': ['James Harden'] }] });
});

router.post('/:user/requestTrade', function (req, res, next) {
  res.redirect('/trades');
});

module.exports = router;
