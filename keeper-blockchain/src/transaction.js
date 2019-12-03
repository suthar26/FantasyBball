const CryptoJS = require("crypto-js");
const ecdsa = require("elliptic");
const _ = require("lodash");
const ec = new ecdsa.ec('secp256k1');
const db = require("./db");

exports.Transaction = class Transaction {
    constructor(teamA, tradingA, teamB, tradingB){
        this.teamA = teamA;
        this.teamB = teamB;
        this.tradingA = tradingA;
        this.tradingB = tradingB;
    }
};

exports.createTransaction = (teamA, tradingA, teamB, tradingB) => {
    return new this.Transaction(teamA, tradingA, teamB, tradingB);
}

const getTransactionId = (transaction) => {
    const txTradeAContent = transaction.tradingA;
    const txTradeBContent = transaction.tradingB;
    return CryptoJS.SHA256(txTradeAContent + txTradeBContent).toString();
};
exports.getTransactionId  = getTransactionId;

exports.verifyTrade = (tx) => {
    return new Promise((resolve, reject)=>{
        db.getUser(tx.teamA).then((team)=>{
            console.log(team);
            db.getUser(tx.teamB).then((team2)=>{
                console.log(team2);
                if (team == undefined || team2 == undefined){
                    reject (new Error ('Team id not valid'));
                }
                if (!team.includes(tx.tradingA)){
                    console.log('invalid trade player A ');
                    reject (false);
                }
                if (!team2.includes(tx.tradingB)){
                    console.log('invalid trade player B');
                    reject (false);
                }
                console.log("valid block")
                resolve (true);
            })
        });
    });
}

exports.updateAssets = (tx) => {
    return new Promise((resolve, reject)=>{
        db.getUser(tx.teamA).then((team)=>{
            console.log(team);
            db.getUser(tx.teamB).then((team2)=>{
                console.log(team2);
                if (team == undefined || team2 == undefined){
                    reject (new Error ('Team id not valid'));
                }
                team[team.indexOf(tx.tradingA)] = tx.tradingB;
                team2[team.indexOf(tx.tradingB)] = tx.tradingA;

                db.updateUser(tx.teamA , team);
                db.updateUser(tx.teamB , team2);

                console.log("valid block")
                resolve (true);
            })
        });
    });
}

exports.getPublicKey = (aPrivateKey) => {
    return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex');
};



const isValidTransactionStructure = (transaction) => {
    if (typeof transaction.id !== 'string') {
        console.log('transactionId missing');
        return false;
    }
    if (!(transaction.txIns instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }
    if (!transaction.txIns
        .map(isValidTxInStructure)
        .reduce((a, b) => (a && b), true)) {
        return false;
    }
    if (!(transaction.txOuts instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }
    if (!transaction.txOuts
        .map(isValidTxOutStructure)
        .reduce((a, b) => (a && b), true)) {
        return false;
    }
    return true;
};


// valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
exports.isValidAddress = (address) => {
    if (address.length !== 130) {
        console.log(address);
        console.log('invalid public key length');
        return false;
    }
    else if (address.match('^[a-fA-F0-9]+$') === null) {
        console.log('public key must contain only hex characters');
        return false;
    }
    else if (!address.startsWith('04')) {
        console.log('public key must start with 04');
        return false;
    }
    return true;
};
