var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/league', function(req, res, next) {
  res.render('league', {users:[{'rank':'1', 'name':'Kunj','score':'8-5-1'},{'rank':'2', 'name':'Parth','score':'6-6-2'}]});
});

router.get('/league/:user', function(req, res, next) {
  res.render('otherTeam', {user:req.params.user + '\'s Team', yourPlayers:[{'name':'Lebron James', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2', 'game':'8:00 PM @ UTA'}], players:[{'name':'lebron james', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2', 'game':'8:00 PM @ UTA'}]});
});

router.get('/matchup', function(req, res, next) {
  res.render('matchup', {you:{'name':'Kunj','score':'4','ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'},opp:{'name':'Parth','score':'4','ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'}});
});

router.get('/players', function(req, res, next) {
  axios.get('https://api.mysportsfeeds.com/v2.0/pull/nba/current_season.json?player=lebron-james', {
    headers: {Authorization:'Basic ODg5YzA4MjUtZWFkNC00YWRkLWE3ZjUtMmEyZGU4Ok1ZU1BPUlRTRkVFRFM='}
  })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });
  let players = {players:[{'name':'Lebron james', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'},{'name':'stephen curry', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'}]};
  if(req.query.player == null)req.query.player = '';
  res.render('players', {players: players.players.filter(function(player) {
    return player.name.toLowerCase().includes(req.query.player);
  })});
});

router.get('/team', function(req, res, next) {
  res.render('team', {players:[{'name':'lebron james', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2', 'game':'8:00 PM @ UTA'}]});
});

router.get('/trades', function(req, res, next) {
  res.render('trades', {sentTrades:[{'from':'Kunj', 'to':'Parth','getPlayers':['Steph Curry', 'Marcus Smart'], 'sendPlayers':['James Harden']}], recievedTrades:[{'from':'Parth', 'to':'Kunj','getPlayers':['Steph Curry', 'Marcus Smart'], 'sendPlayers':['James Harden']}]});
});

router.post('/requestTrade', function(req, res, next) {
  res.redirect('/trades');
});

module.exports = router;
