const User = require('../model/User')

async function post(req, res, next) {
    //Check if has all Fields
    const keys = Object.keys(req.body)

    for (key in keys) {
        if (req.body[key] === "") {
            return res.render('user/register', {
                user: req.body,
                error: "Por favor preencha todos os campos"
            })
        }
    }

    //Check if user exists[email, cpf]
    let { email, cpf_cnpj, password, passwordRepeat } = req.body

    cpf_cnpj = cpf_cnpj.replace(/\D/g, '')

    const user = await User.findOne({
        where: { email },
        or: { cpf_cnpj }
    })

    if (user) return res.render('user/register', {
        user: req.body,
        error: "Usuário já cadastrado"
    })

    if (password != passwordRepeat) return res.render('user/register', {
        user: req.body,
        error: "Senhas incorretas"
    })


    next()
}

module.exports = {
    post
}