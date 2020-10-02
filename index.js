const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require('dotenv').config()
console.log(process.env.DB_PASS)
const port = 4000;
//const password =ArabianHorse79;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sfbl4.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;

const serviceAccount = require("./configs/burja-hotel-firebase-adminsdk-l6nc3-567f56edc4.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});





const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("burzAllArab").collection("bokkings");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        // console.log(newBooking);
        collection.insertOne(newBooking)
            .then(result => {
                //console.log(result.)
                res.send(result.insertedCount > 0)
            })
    })

    app.get("/bookings", (req, res) => {
        console.log((req.query.email))
        //  console.log(req.headers.authorization)
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer')) {
            const idToken = bearer.split(' ')[1];
            //console.log('ID TOKEN', idToken);

            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    let tokenEmail = decodedToken.email;
                   // console.log(tokenEmail, req.query.email)
                    if (tokenEmail === req.query.email) {
                        collection.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents);
                            })
                    }
                    else{
                        res.status(401).send('unothorized access');
                    }
                }).catch(function (error) {
                    // Handle error
                });

        }
        else{
            res.status(401).send('unothorized access');
        }



    })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})