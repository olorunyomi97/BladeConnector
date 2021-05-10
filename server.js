const express = require('express');
const mongoose = require('mongoose');

const app = express();

// DB Config //
const db = require('./config/keys').mongoURI;
// connect to MongoDB //
mongoose
    .connect(db, 
        { 
            useNewUrlParser: true, // Need this for API support
            useUnifiedTopology: true // to the MongoClient Constructor
        }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


app.get('/', (req, res) => res.send('Hello Biggie'));

const port = process.env.PORT || 5000;

app.listen(port, ()=> console.log(`server running on port ${port}`));