if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport.config')

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)
  
const users = [{
  id: '1663694796186',
  name: 'w',
  email: 'w@w',
  password: '$2b$10$choK16uOWGKlqOZqA5kIP.9Rtj5mrg7qndjnDvwz1xQSfF6cLSidO'
}]

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  res.render('home.ejs', { user: req.user })
})

app.get('/login', checkAlreadyAuthenticated, (req, res) => {
  console.log('get /login : req.user : ', req.user)
  console.log('/login req.session : ', req.session);
  const message = req.flash('error')[0]
  res.render('login.ejs', {message : message})
})
app.post('/login', checkAlreadyAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkAlreadyAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkAlreadyAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
})

app.delete('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

app.get('/mypage', (req, res) => {
  const user = req.user
  res.render('myPage.ejs',{user})
})

app.get('/users', (req, res) => {
  console.log(req.user)
  res.json(users)
})

function checkAuthenticated(req, res, next) {
  console.log('checkAuthenticated : req.user : ', req.user);
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkAlreadyAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

const PORT = 3090
app.listen(PORT, () => console.log(`Server running at port ${PORT}`))