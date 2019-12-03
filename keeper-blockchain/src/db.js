
var admin = require("firebase-admin");

var serviceAccount = require("../secrets/firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blockchain-keeper.firebaseio.com"
});
var db = admin.database();
let users;
db.ref("users").on("value", (snapshot) => {
    users = Array.from(snapshotToArray(snapshot));
});

function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};
exports.snapshotToArray = snapshotToArray;
exports.users = users;
exports.getUsers = () => {
    return users;
}

exports.updateUsers = (users) => {
    db.ref("users").set(users);
}