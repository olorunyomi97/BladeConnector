const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
// const { use } = require('passport');
const app = express();

// body parser middlware //
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

//  use routes //
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, ()=> console.log(`server running on port ${port}`));