var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get('/league', function(req, res, next) {
  res.render('league', { title: 'Express' });
});

router.get('/matchup', function(req, res, next) {
  res.render('matchup', { title: 'Express' });
});

router.get('/players', function(req, res, next) {
  res.render('players', {players:[{'name':'lebron james', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2', 'positions':'SF/PF'}]});
});

router.get('/team', function(req, res, next) {
  res.render('team', {players:[{'name':'lebron james', 'ftp':'.900', 'fgp':'.600', 'three':'5', 'pts':'25', 'reb':'8', 'ast':'5', 'st':'0', 'blk':'1', 'to':'2', 'positions':'SF/PF', 'game':'8:00 PM @ UTA'}]});
});

router.get('/trades', function(req, res, next) {
  res.render('trades', { title: 'Express' });
});

module.exports = router;
