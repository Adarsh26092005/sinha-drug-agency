const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"Sinha Drug Agency" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

module.exports = sendEmail;