const User = require('../model/User')
const { hash } = require('bcryptjs')
const crypto = require('crypto');
const mailer = require('../../lib/mailer')

module.exports = {

    loginForm(req, res) {
        return res.render('session/login')
    },

    login(req, res) {
        req.session.userId = req.user.id
        return res.redirect('/users')
    },

    logout(req, res) {
        req.session.destroy();
        return res.redirect('/')
    },
    forgotForm(req, res) {
        return res.render('session/forgot-password')
    },
    async forgot(req, res) {
        const user = req.user
        try {
            //Token Criation
            const token = crypto.randomBytes(20).toString("hex")

            //Expiracao
            let now = new Date();
            now = now.setHours(now.getHours() + 1)

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            })

            //SEND email with 
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply',
                subject: 'Recuperção de Senha',
                html: `<h2>Perdeu a Chave ?</h2>
            <p>Não se preocupe, clique no link para recupera-la</p>
            <p>
                <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blanck">
                    Recuperar senha
                </a>
            </p>
            `
            })

            return res.render('session/forgot-password', {
                success: "Verfique seu email para recuperar sua senha"
            })

        } catch (err) {
            console.error(err)
            return res.render('session/forgot-password', {
                error: "Erro inesperado tente novamente"
            })
        }

    },
    resetForm(req, res) {
        return res.render('session/password-reset', { token: req.query.token })
    },
    async reset(req, res) {
        const user = req.user
        const { password, token } = req.body

        try {
            //Criar novo Hash
            const newPassword = await hash(password, 8)

            //Atualizar Senha
            await User.update(user.id, {
                password: newPassword,
                reset_token: '',
                reset_token_expires: ''
            })

            //Avisar o usuario da nova senha
            return res.render('session/login', {
                user: req.body,
                success: "Senha Atualizada! Faça seu login"
            })

        } catch (err) {
            console.error(err)
            return res.render('session/password-reset', {
                user: req.body,
                token,
                success: "Verfique seu email para recuperar sua senha"
            })
        }
    }
}