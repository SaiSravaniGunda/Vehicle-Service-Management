const cron = require('node-cron');
const Service = require('../models/service');
const nodemailer = require('nodemailer');
function setupCronJob() {
    cron.schedule('0 9  * * *', async () => {
        console.log('Cron job started at', new Date());
    
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);
    
        try {
            const servicesWithReminders = await Service.find({
                reminderDate: { $gte: startOfDay, $lt: endOfDay }
            }).populate({
                path: 'vehicle',
                populate: {
                    path: 'owner',
                    select: 'email'  // Ensure only the email is retrieved
                }
            });;
    
            // console.log('Found services:', servicesWithReminders);
    
            servicesWithReminders.forEach(service => {
                sendReminder(service);
            });
        } catch (error) {
            console.error('Error fetching services for reminders:', error);
        }
    });
    
}

function sendReminder(service) {
    const ownerEmail = service.vehicle.owner.email;
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'saisravani187@gmail.com',
            pass: 'iday vhjw cfhb ciax'
        },
        
    });

    let mailOptions = {
        from: 'saisravani187@gmail.com',
        to: ownerEmail,
        subject: 'Service Reminder',
        text: `Reminder: Your ${service.serviceType} for vehicle ${service.vehicle.model} is due on ${service.serviceDate}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending reminder email:', error);
        } else {
            console.log('Reminder email sent:', info.response);
        }
    });
}

module.exports = setupCronJob;
