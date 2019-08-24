// config.get("jwtPrivateKey")

const nodemailer = require("nodemailer");
const config = require("config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.get("mailUsername"),
    pass: config.get("mailPassword")
  }
});

module.exports = function(to, subject, body) {
  const mailOptions = {
    from: "DoNotReply <DoNotReply@BelibaHoma.com>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: body // plain text body
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
};
