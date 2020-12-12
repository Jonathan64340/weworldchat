import passwordHash from 'password-hash';

const passwordEncrypt = (password) => {
    return new Promise((resolve, reject) => {
        resolve(passwordHash.generate(password))
    })
}

const passwordDecrypt = (typed_password, password) => {
    return new Promise((resolve, reject) => {
        resolve(passwordHash.verify(typed_password, password))
    })
}

export { passwordEncrypt, passwordDecrypt }