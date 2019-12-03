var express = require('express');
var router = express.Router();
const axios = require('axios');
var firebase = require("firebase/app");
const qs = require('querystring')

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
      if(entry!='waiver')
        users.users.push({'name':entry, 'win': response[entry].win, 'loss': response[entry].loss, 'tie': response[entry].tie});
    });
    users.users.sort(function(a, b) {
      return b.win - a.win  ||  b.tie - a.tie;
    });
    res.render('league', {user: req.params.user, users: users.users});
  });
});

router.get('/:user/league/:otherUser', function (req, res, next) {
  let players = { players: [] };
  firebase.database().ref('/').once('value').then(function (snapshot) {
    let otherPlayer = snapshot.val().users[req.params.otherUser].players.join(',');
 
    if (req.query.player == null) req.query.player = '';
    axios.get('https://api.mysportsfeeds.com/v2.1/pull/nba/current/player_stats_totals.json', {
      headers: { Authorization: 'Basic ODg5YzA4MjUtZWFkNC00YWRkLWE3ZjUtMmEyZGU4Ok1ZU1BPUlRTRkVFRFM=' },
      params: {player:otherPlayer}
    })
      .then(response => {
        let data = response.data.playerStatsTotals;
        data.forEach(function (entry) {
          players.players.push({ 'name': entry.player.firstName + ' ' + entry.player.lastName, 'ftp': entry.stats.freeThrows.ftPct, 'fgp': entry.stats.fieldGoals.fgPct, 'three': entry.stats.fieldGoals.fg3PtMadePerGame, 'pts': entry.stats.offense.ptsPerGame, 'reb': entry.stats.rebounds.rebPerGame, 'ast': entry.stats.offense.astPerGame, 'st': entry.stats.defense.stlPerGame, 'blk': entry.stats.defense.blkPerGame, 'to': entry.stats.defense.tovPerGame })
        });
        console.log(snapshot.val().users[req.params.user].players)
        res.render('otherTeam', {otherPlayers: snapshot.val().users[req.params.otherUser].players, players: players.players, user: req.params.user, otherUser: req.params.otherUser, yourPlayers: snapshot.val().users[req.params.user].players, players: players.players});
      })
      .catch(error => {
        console.log(error);
      });
  });
});

router.get('/:user/matchup', function (req, res, next) {
  let yourPlayers = { players: [] };
  let otherPlayers = { players: [] };
  firebase.database().ref('/').once('value').then(function (snapshot) {
    let otherName = null
    snapshot.val().matchups.forEach(function(entry){
      if(entry.player1 == req.params.user){otherName = entry.player2}
      else if(entry.player2 == req.params.user){otherName =  entry.player1}
    })
    
    let yours = snapshot.val().users[req.params.user].players;
    let others = snapshot.val().users[otherName].players.join(',');
    if (req.query.player == null) req.query.player = '';
  
    axios.get('https://api.mysportsfeeds.com/v2.1/pull/nba/current/player_stats_totals.json', {
      headers: { Authorization: 'Basic ODg5YzA4MjUtZWFkNC00YWRkLWE3ZjUtMmEyZGU4Ok1ZU1BPUlRTRkVFRFM=' },
      params: {player:yours.join(',')+','+others}
    })
      .then(response => {
        let data = response.data.playerStatsTotals;
        data.forEach(function (entry) {
          if(yours.includes((entry.player.firstName + '-' + entry.player.lastName).toLowerCase())){
            yourPlayers.players.push({ 'name': entry.player.firstName + ' ' + entry.player.lastName, 'ftp': entry.stats.freeThrows.ftPct, 'fgp': entry.stats.fieldGoals.fgPct, 'three': entry.stats.fieldGoals.fg3PtMadePerGame, 'pts': entry.stats.offense.ptsPerGame, 'reb': entry.stats.rebounds.rebPerGame, 'ast': entry.stats.offense.astPerGame, 'st': entry.stats.defense.stlPerGame, 'blk': entry.stats.defense.blkPerGame, 'to': entry.stats.defense.tovPerGame })
          }
          else{
            otherPlayers.players.push({ 'name': entry.player.firstName + ' ' + entry.player.lastName, 'ftp': entry.stats.freeThrows.ftPct, 'fgp': entry.stats.fieldGoals.fgPct, 'three': entry.stats.fieldGoals.fg3PtMadePerGame, 'pts': entry.stats.offense.ptsPerGame, 'reb': entry.stats.rebounds.rebPerGame, 'ast': entry.stats.offense.astPerGame, 'st': entry.stats.defense.stlPerGame, 'blk': entry.stats.defense.blkPerGame, 'to': entry.stats.defense.tovPerGame })
          }
        });
        let yourStats = {'name': req.params.user,'ftp': 0, 'fgp': 0, 'three': 0, 'pts': 0, 'reb': 0, 'ast': 0, 'st': 0, 'blk': 0, 'to': 0, 'score':0};
        yourPlayers.players.forEach(function(entry){
          yourStats.ftp += entry.ftp;
          yourStats.fgp += entry.fgp;
          yourStats.three += entry.three;
          yourStats.pts += entry.pts;
          yourStats.reb += entry.reb;
          yourStats.ast += entry.ast;
          yourStats.st += entry.st;
          yourStats.blk += entry.blk;
          yourStats.to += entry.to;
        });
        yourStats.three = Math.round(yourStats.three);
        yourStats.pts = Math.round(yourStats.pts);
        yourStats.reb = Math.round(yourStats.reb);
        yourStats.ast = Math.round(yourStats.ast);
        yourStats.st = Math.round(yourStats.st);
        yourStats.blk = Math.round(yourStats.blk);
        yourStats.to = Math.round(yourStats.to);
        yourStats.ftp = Math.round((yourStats.ftp/yourPlayers.players.length)*10)/10;
        yourStats.fgp = Math.round((yourStats.fgp/yourPlayers.players.length)*10)/10;
        let otherStats = {'name': otherName,'ftp': 0, 'fgp': 0, 'three': 0, 'pts': 0, 'reb': 0, 'ast': 0, 'st': 0, 'blk': 0, 'to': 0, 'score':0};
        otherPlayers.players.forEach(function(entry){
          otherStats.ftp += entry.ftp;
          otherStats.fgp += entry.fgp;
          otherStats.three += entry.three;
          otherStats.pts += entry.pts;
          otherStats.reb += entry.reb;
          otherStats.ast += entry.ast;
          otherStats.st += entry.st;
          otherStats.blk += entry.blk;
          otherStats.to += entry.to;
        });
        otherStats.three = Math.round(otherStats.three);
        otherStats.pts = Math.round(otherStats.pts);
        otherStats.reb = Math.round(otherStats.reb);
        otherStats.ast = Math.round(otherStats.ast);
        otherStats.st = Math.round(otherStats.st);
        otherStats.blk = Math.round(otherStats.blk);
        otherStats.to = Math.round(otherStats.to);
        otherStats.ftp = Math.round((otherStats.ftp/otherPlayers.players.length)*10)/10;
        otherStats.fgp = Math.round((otherStats.fgp/otherPlayers.players.length)*10)/10;
        if(yourStats.ftp > otherStats.ftp) yourStats.score++; else if(yourStats.ftp < otherStats.ftp) otherStats.score++;
        if(yourStats.fgp > otherStats.fgp) yourStats.score++; else if(yourStats.fgp < otherStats.fgp) otherStats.score++;
        if(yourStats.three > otherStats.three) yourStats.score++; else if(yourStats.three < otherStats.three) otherStats.score++;
        if(yourStats.pts > otherStats.pts) yourStats.score++; else if(yourStats.pts < otherStats.pts) otherStats.score++;
        if(yourStats.reb > otherStats.reb) yourStats.score++; else if(yourStats.reb < otherStats.reb) otherStats.score++;
        if(yourStats.ast > otherStats.ast) yourStats.score++; else if(yourStats.ast < otherStats.ast) otherStats.score++;
        if(yourStats.st > otherStats.st) yourStats.score++; else if(yourStats.st < otherStats.st) otherStats.score++;
        if(yourStats.blk > otherStats.blk) yourStats.score++; else if(yourStats.blk < otherStats.blk) otherStats.score++;
        if(yourStats.to < otherStats.to) yourStats.score++; else if(yourStats.to > otherStats.to) otherStats.score++;

        res.render('matchup', {user: req.params.user, otherUser: otherName, you: yourStats, opp: otherStats});
      })
      .catch(error => {
        console.log(error);
      });
  });
});

router.get('/:user/players', function (req, res, next) {
  let players = { players: [] };
  firebase.database().ref('/').once('value').then(function (snapshot) {
    let waivers = snapshot.val().users.waiver.players.join(',');
 
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
        res.render('players', {otherPlayers: snapshot.val().users.waiver.players, user: req.params.user, yourPlayers: snapshot.val().users[req.params.user].players,
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
  let trades = {trades:[]};
  axios.get('http://localhost:3001/transactionPool').then((response)=>{
    trades.trades = (response.data);
    console.log(trades.trades);
    res.render('trades', {user: req.params.user, tradesRes: trades.trades});
  })
});

router.post('/:user/acceptTrade/:id', (req,res,next) => {
  console.log(req.params.id)
  const requestBody = {
    id: req.params.id
  };
  const url = 'http://localhost:3001/approveTransaction';
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  
  axios.post(url, qs.stringify(requestBody), config)
  .then(function (response) {
    console.log(response);
    res.redirect('http://localhost:3000/'+req.params.user+'/trades')
  })
  .catch(function (error) {
    console.log(error);
  });
});

router.post('/:user/rejectTrade/:id', (res,req,next) => {
  console.log(req.params.id)
  const requestBody = {
    id: req.params.id
  };
  const url = 'http://localhost:3001/rejectTransaction';
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  
  axios.post(url, qs.stringify(requestBody), config)
  .then(function (response) {
    console.log(response);
    res.redirect('http://localhost:3000/'+req.params.user+'/trades')
  })
  .catch(function (error) {
    console.log(error);
  });
});
  
  

router.post('/:user/requestTrade', function (req, res, next) {
  res.redirect('/trades');
});

module.exports = router;
