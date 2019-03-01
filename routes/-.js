router.get('/profile', (req, res) => {
    Company.findOne({
            where: {
                id: 1
            },
            include: {
                model: Job,
                include: {
                    model: User
                }
            }
        })
        .then(company => {
            // res.send(company)
            res.render('companyProfile', { data: company })
        })
        .catch(err => {
            res.send(err)
        })
})

router.get('/:id/download', (req, res) => {
    const { params } = req
    User.findByPk(params.id)
        .then(user => {
            // if (user.CV === null)
            res.download(user.CV)
        })
        .catch(err => {
            res.send(err)
        })
})