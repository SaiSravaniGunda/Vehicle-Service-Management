const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({

  service: 'gmail', // Or use another email provider
  auth: {
    user: 'saisravani187@gmail.com',  // Your email
    pass: 'iday vhjw cfhb ciax'    // Your email password or app-specific password
  }
});

const sendVerificationEmail = (email, verificationCode) => {
  const mailOptions = {
    from: 'saisravani187@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Your verification code is: ${verificationCode}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports=sendVerificationEmail;
