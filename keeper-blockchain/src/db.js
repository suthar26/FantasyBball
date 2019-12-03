
var admin = require("firebase-admin");

var serviceAccount = require("../secrets/firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blockchain-keeper.firebaseio.com"
});
var db = admin.database();
let users = {users: []};

db.ref('/users/').once('value').then(function(snapshot) {
    var response = (snapshot.val());
    Object.keys(response).forEach(function (entry){
      if(entry!='waiver')
        users.users.push({'name':entry, 'win': response[entry].win, 'loss': response[entry].loss, 'tie': response[entry].tie});
    });
});
// db.ref("users").on("value", (snapshot) => {
//     users = Array.from(snapshotToArray(snapshot));
// });

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

exports.getUser = (user) => {
    return new Promise((resolve,reject) => {
        db.ref("/users/"+user+"/players").on("value", (snapshot)=>{
            // console.log("snapshot value ")
            // console.log(snapshot.val());
            resolve (snapshot.val());
        });
    });
}

exports.updateUser = (user, data) =>{
    db.ref("/users/"+user+"/players").set(data);
}
exports.updateUsers = (users) => {
    db.ref("users").set(users);
}