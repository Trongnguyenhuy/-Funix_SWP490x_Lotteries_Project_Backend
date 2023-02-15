const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: process.env.GOOGLE_SENDMAIL_ACCOUNT || null,
		pass: process.env.GOOGLE_SENDMAIL_PASSWORD || null,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

const content = (typeOfEmail, content) => {
	return `
        <div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
                <h4 style="color: #0085ff">Email ${typeOfEmail}</h4>
                ${
									typeOfEmail === "Cập Nhật Mật Khẩu Mới"
										? `<span style="color: black">Password mới của bạn là: ${content}</span>`
										: `<span style="color: black">
                		<a href="http://localhost:8080/usermanager/signup-success?token=${content}">Nhấp vào đây để kích hoạt tài khoản</a>
                	</span>`
								}
            </div>
        </div>
    `;
};

const mainOptions = (email, subject, content) => {
	return {
		from: "NQH-Test nodemailer",
		to: email,
		subject: subject,
		text: "Your text is here",
		html: content,
	};
};

const generatePassword = (numberLength) => {
	const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numbers = "0123456789";
	const symbols = "!@#$%^&*_-+=";
	let password = "";
	const seed = alpha.concat(numbers, symbols);

	for (let i = 0; i < numberLength; i++) {
		let character = seed[Math.floor(Math.random() * seed.length)];
		password += character;
	}

	return password;
};

module.exports = {
	transporter,
	content,
	mainOptions,
	generatePassword,
};
