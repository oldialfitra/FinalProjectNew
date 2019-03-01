const router = require('express').Router()
const { User, Job, UserJob, Company } = require('../models')
    // const upload = require('../helper/upload')
const bcrypt = require('bcryptjs')
const userMiddleWare = require('../middleware/userMiddleWare')
const multer = require('multer')
const path = require('path')
router.get('/register', (req, res) => {
    let errMessage
    if (req.query.err) {
        errMessage = req.query.err
    }
    res.render('userRegister', { errMessage })
})

router.post('/register', (req, res) => {
    User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            CV: '',
            IPK: 0,
            skill: '',
            verified: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .then(function() {
            res.redirect('/user/login')
        })
        .catch(function(err) {
            res.redirect(`/user/register?err=${err}`)
        })
})

router.get('/verify/:usernameUser', (req, res) => {
    User.update({
            verified: 1
        }, {
            where: {
                username: req.params.usernameUser
            }
        })
        .then(function() {
            res.redirect('/user/login')
        })
        .catch(function(err) {
            res.send(err)
        })
})

router.get('/login', (req, res) => {
    let errMessage
    if (req.query.err) {
        errMessage = req.query.err
    }
    res.render('userLogin', { errMessage })
})

router.post('/login', (req, res) => {
    User.findOne({
            where: {
                username: req.body.username
            }
        })
        .then(function(dataOne) {
            if (dataOne === null) {
                res.send(`No username ${req.body.username} registered`)
            } else {
                if (dataOne.verified === 0) {
                    res.redirect('/home')
                } else {
                    if (bcrypt.compareSync(req.body.password, dataOne.password)) {
                        req.session.user = {
                            id: dataOne.id,
                            username: dataOne.username
                        }
                        res.redirect(`/user/profile`)
                    } else {
                        throw 'wrong password'
                    }
                }
            }
        })
        .catch(function(err) {
            res.redirect(`/user/login?err=${err}`)
        })
})

router.get('/profile', userMiddleWare, (req, res) => {
    // console.log(req.query)
    let errMessage
    if (req.query.err) {
        errMessage = req.query.err
    }

    User.findByPk(req.session.user.id)
        .then(function(data) {
            // res.send(data)
            console.log(data.dataValues)
            res.render('homeUser', { output: data, errMessage })
        })
})

router.get('/getSession', (req, res) => {
    res.send(req.session)
})

router.get('/edit/:id', userMiddleWare, (req, res) => {
    User.findByPk(req.params.id)
        .then(function(data) {
            // console.log(data.dataValues)
            // res.send(data)
            res.render('userProfile', { output: data })
        })
        .catch(function(err) {
            res.send(err)
        })
})
router.post('/edit/:id', (req, res) => {

    // console.log(req.body)
    User.update({
            id: req.session.user.id,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            IPK: req.body.IPK,
            skill: req.body.skill
        }, {
            where: {
                id: req.session.user.id
            }
        })
        .then(function() {
            res.redirect(`/user/profile`)
        })
        //     }
        // })

})

router.post('/uploadCV', userMiddleWare, (req, res) => {
    const storagePath = multer.diskStorage({
        destination: './public/upload/',
        filename: function(req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() +
                path.extname(file.originalname))
        }
    })

    const checkType = function checkFileType(file, cb) {
        const filetypes = /jpeg|jpg|png|gif|pdf|doc/
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = filetypes.test(file.mimetype)
        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb('Error, extension only jpeg,jpg,png,gif,pdf,txt,doc')
        }
    }
    const upload = multer({
        storage: storagePath,
        fileFilter: function(req, file, cb) {
            checkType(file, cb)
        }
    }).single('myFile')

    upload(req, res, (err) => {
        if (err) {
            res.redirect(`/user/profile?err=${err}`)
        } else {
            // console.log(req.file)
            User.update({
                    CV: req.file.path
                }, {
                    where: {
                        id: req.session.user.id
                    }
                })
                .then(function() {
                    res.redirect('/user/profile')
                })
                .catch(function(err) {
                    res.redirect(`/user/profile?err=${err}`)
                })
        }
    })

})

router.get('/jobs', userMiddleWare, (req, res) => { // Daftar job sudah muncul semua , tinggal di finalisasi agar apply job menyatakan status sudah dilamar 
    let user = null
    User.findOne({
            where: {
                id: req.session.user.id
            }
        })
        .then(users => {
            user = users
            return Job.findAll({
                include: {
                    model: Company
                }
            })
        })
        .then(jobs => {
            // res.send(jobs)
            res.render('jobs', { data: user, datas: jobs })
        })
        .catch(err => {
            res.send(err)
        })
})

router.post('/jobs/:UserId/:JobId', (req, res) => { // apply job sudah bisa, tinggal kasi kondisi pada lamaran, kalo sudah dilamar tidak boleh melamar lagi
    let obj = {
        status: 'pending',
        UserId: req.params.UserId,
        JobId: req.params.JobId,
        interviewDate: null
    }
    UserJob.create(obj)
        .then(data => {
            res.redirect('/user/jobs')
        })
        .catch(err => {
            res.send(err)
        })
})

router.get('/list', userMiddleWare, (req, res) => { // belum dipasang middleware // list status lamaran sudah muncul // session nya masih tak pake hardcore userId 7
    let statusJob = null
    UserJob.findAll({
            where: {
                UserId: req.session.user.id
            },
            order: [
                [
                    'createdAt', 'DESC'
                ]
            ],
            include: {
                model: Job,
                include: {
                    model: Company
                }
            }
        })
        .then(function(data) {
            // res.send(data)
            statusJob = data
            return User.findOne({
                where: {
                    id: req.session.user.id
                }
            })
        })
        .then(profile => {
            // res.send(statusJob)
            // res.send(profile)
            res.render('list', { output: statusJob, data: profile })
        })
        .catch(function(err) {
            res.send(err)
        })
})


router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})


module.exports = router