import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import __dirname from './utils.js'
import newSocket from './services/socket.js'
import getRouter from './routes/products.js'
import login from './routes/login.js'
import logout from './routes/logout.js'
import signup from './routes/signup.js'
import loginfail from './routes/loginfail.js'
import registerfail from './routes/registerfail.js'
import passport from 'passport'
import initializePassport from './config/passport.config.js'
import config from './config/dotenv.config.js'

const app = express()

app.use(express.json())

const connect = mongoose.connect(config.mongo.MONGO_URL)

app.use(session({
    store: MongoStore.create({
        mongoUrl: config.mongo.MONGO_URL,
        ttl: 600,
    }),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
}))
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

const server = app.listen(config.app.PORT || 8000 , () => {
    console.log(`Listening on port: ${config.app.PORT}`)
})

const io = newSocket(server)
const ProductsView = getRouter(io)

app.set('views', __dirname + '/views')
app.set('view engine', 'pug')


app.use("/public", express.static(__dirname + '/public'));
app.use('/', ProductsView)
app.use('/login', login)
app.use('/logout', logout)
app.use('/signup', signup)
app.use('/loginfail', loginfail)
app.use('/registerfail', registerfail)


