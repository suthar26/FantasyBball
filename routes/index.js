var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/league', function(req, res, next) {
  res.render('league', { title: 'Express' });
});

router.get('/matchup', function(req, res, next) {
  res.render('matchup', { title: 'Express' });
});

router.get('/players', function(req, res, next) {
  res.render('players', { title: 'Express' });
});

router.get('/team', function(req, res, next) {
  res.render('team', { title: 'Express' });
});

router.get('/trades', function(req, res, next) {
  res.render('trades', { title: 'Express' });
});

module.exports = router;
