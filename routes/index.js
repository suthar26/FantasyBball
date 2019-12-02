var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/league', function(req, res, next) {
  res.render('league', {users:[{'rank':'1', 'name':'Kunj','score':'8-5-1'},{'rank':'2', 'name':'Parth','score':'6-6-2'}]});
});

router.get('/matchup', function(req, res, next) {
  res.render('matchup', {you:{'name':'Kunj','score':'4','ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'},opp:{'name':'Parth','score':'4','ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'}});
});

router.get('/players', function(req, res, next) {
  let players = {players:[{'name':'Lebron james', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'},{'name':'stephen curry', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2'}]};
  if(req.query.player == null)req.query.player = '';
  console.log(req.query);
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

module.exports = router;
