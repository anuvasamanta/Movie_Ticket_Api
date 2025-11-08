const bcrypt = require('bcryptjs');
const HashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
}

const RandomPassword = async (length = 8) => {
    try {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';

        const bytes_password = crypto.randomBytes(length)

        for (let i = 0; i < length; i++) {
            password += chars[bytes_password[i] % chars.length]
        }
        return password
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={HashedPassword,RandomPassword} ;