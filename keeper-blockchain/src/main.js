const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash");
const blockchain_1 = require("./blockchain");
const p2p_1 = require("./p2p");
const db = require("./db");
const transactionPool_1 = require("./transactionPool");
const wallet_1 = require("./wallet");
const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;
const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
    });
    app.get('/blocks', (req, res) => {
        res.send(blockchain_1.getBlockchain());
    });
    app.get('/block/:hash', (req, res) => {
        const block = _.find(blockchain_1.getBlockchain(), { 'hash': req.params.hash });
        res.send(block);
    });
    app.get('/transaction/:id', (req, res) => {
        const tx = _(blockchain_1.getBlockchain())
            .map((blocks) => blocks.data)
            .flatten()
            .find({ 'id': req.params.id });
        res.send(tx);
    });
    app.post('/approveTransaction', (req,res) => {
        try{
            const tx = _(transactionPool_1.getTransactionPool())
            .map((blocks) => blocks)
            .flatten()
            .find({ 'id': req.body.id });
            if (req.body.id === undefined || tx == null ){
                throw Error ('invalid transaction id');
            }
            const resp = blockchain_1.generateRawNextBlock(tx);
            res.send(resp);
        }
        catch (e){
            console.log(e.message);
            res.status(400).send(e.message);
        }
    })
    app.post('/sendTransaction', (req, res) => {
        try {
            let teamA = req.body.teamA;
            let tradingA = req.body.tradingA;
            let teamB = req.body.teamB;
            let tradingB = req.body.tradingB;

            if (teamA === undefined || teamB === undefined || tradingA === undefined || tradingB === undefined) {
                throw Error('invalid team or trade');
            }
            //const resp = blockchain_1.sendTransaction(address, amount);
            const resp = blockchain_1.sendTransaction(teamA,tradingA, teamB, tradingB);
            res.send(resp);
        }
        catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });
    app.get('/transactionPool', (req, res) => {
        res.send(transactionPool_1.getTransactionPool());
    });
    app.get('/peers', (req, res) => {
        res.send(p2p_1.getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        p2p_1.connectToPeers(req.body.peer);
        res.send();
    });
    app.post('/stop', (req, res) => {
        res.send({ 'msg': 'stopping server' });
        process.exit();
    });
    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};
initHttpServer(httpPort);
p2p_1.initP2PServer(p2pPort);
