module.exports = function(receivers,sub,body,callback){
	var nodemailer = require('nodemailer');
	var smtpConfig = {
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: 'adm.cmpe.sjsu@gmail.com',
			pass: 'cmpe1234'
		}
	};
	var transporter = nodemailer.createTransport(smtpConfig);
	var mailOptions = {
		from: '"CMPE SJSU" <adm.cmpe.sjsu@gmail.com>',
		to: receivers,
		replyTo:'xiao.su@sjsu.edu',
		subject: sub,						
		html: body
	};
	transporter.sendMail(mailOptions,callback);
}  