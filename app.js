const express = require('express')
const userRouter = require('./routes/user')
const companyRouter = require('./routes/company')
const session = require('express-session')



//init app
const app = express()
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
const port = 3001
const sess = { secret: 'keyboard cat' }
app.use(session(sess))
app.locals.verify = require('./helper/emailVerified')
app.locals.time = require('./helper/countdown')
app.get('/', (req, res) => {
    res.render('home')
})
app.use('/user', userRouter)
app.use('/company', companyRouter)

app.listen(port, () => {
    console.log('Port: ' + port)
})