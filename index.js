const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = 5000


const app = express()

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./burj-al-arab-project1-firebase-adminsdk-99yzb-1fe4c2588d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-project1.firebaseio.com"
});

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dix9b.mongodb.net/volunteernetwork?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
client.connect(err => {
  const registrations = client.db("volunteernetwork").collection("registration");
//   console.log("DB connected succesfully")
  

app.post('/addRegistration', (req, res) => {
    const newRegistration = req.body;
    registrations.insertOne(newRegistration)
    .then(result => {
       res.send(result.insertedCount > 0);
    })
    // console.log(newRegistration);
})


app.get('/alluser', (req, res) => {
    registrations.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
})


app.delete('/delete/:id', (req, res) => {
    // console.log(req.params.id);
    registrations.deleteOne({_id: ObjectId(req.params.id)})
    .then((result) => {
        console.log(result);
        res.send(result)
    })
})

app.get('/registrations',(req, res) => {
    const bearer = req.headers.authorization;
    if( bearer && bearer.startsWith('Bearer ')){
        const idToken =bearer.split(' ')[1];
        // console.log({idToken});
        admin.auth().verifyIdToken(idToken)
            .then(function(decodedToken) {
            const tokenEmail = decodedToken.email;
            const queryEmail = req.query.email;
            // console.log(tokenEmail, queryEmail)
            if(tokenEmail == req.query.email){
                registrations.find({email: req.query.email})
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            }
            }).catch(function(error) {
            // Handle error
            });
    }

})

});

app.listen(process.env.PORT || port)