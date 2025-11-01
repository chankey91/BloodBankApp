const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email notification
exports.sendEmail = async (options) => {
  try {
    const message = {
      from: `Blood Bank Network <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(message);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send push notification (simplified - integrate with FCM in production)
exports.sendPushNotification = async (fcmToken, notification) => {
  // TODO: Implement FCM integration
  console.log('Push notification:', notification);
  return { success: true };
};

// Notify nearby donors about urgent request
exports.notifyNearbyDonors = async (request, donors) => {
  const notifications = [];

  for (const donor of donors) {
    if (donor.user.email) {
      const emailHtml = `
        <h2>Urgent Blood Request</h2>
        <p>Hello ${donor.user.name},</p>
        <p>An urgent blood request has been made near your location:</p>
        <ul>
          <li><strong>Blood Type:</strong> ${request.bloodType}</li>
          <li><strong>Component:</strong> ${request.component}</li>
          <li><strong>Units Required:</strong> ${request.unitsRequired}</li>
          <li><strong>Urgency:</strong> ${request.urgency}</li>
          <li><strong>Location:</strong> ${request.location.city}, ${request.location.state}</li>
        </ul>
        <p>If you're available to donate, please log in to the app and respond to this request.</p>
        <p>Thank you for being a hero!</p>
      `;

      const result = await exports.sendEmail({
        email: donor.user.email,
        subject: '🚨 Urgent Blood Request Near You',
        html: emailHtml
      });

      notifications.push(result);
    }

    if (donor.user.fcmToken) {
      const result = await exports.sendPushNotification(donor.user.fcmToken, {
        title: '🚨 Urgent Blood Request',
        body: `${request.bloodType} ${request.component} needed urgently. ${request.unitsRequired} units.`,
        data: {
          type: 'blood-request',
          requestId: request._id.toString()
        }
      });

      notifications.push(result);
    }
  }

  return notifications;
};

// Send eligibility reminder
exports.sendEligibilityReminder = async (donor) => {
  if (!donor.user.email) return;

  const emailHtml = `
    <h2>You're Eligible to Donate Again!</h2>
    <p>Hello ${donor.user.name},</p>
    <p>Good news! You're now eligible to donate blood again.</p>
    <p>Your contribution can save lives. Find a nearby blood bank or donation camp through our app.</p>
    <p><strong>Reward Points:</strong> ${donor.rewards.points}</p>
    <p>Thank you for being a regular donor!</p>
  `;

  return await exports.sendEmail({
    email: donor.user.email,
    subject: '🩸 You\'re Eligible to Donate Again!',
    html: emailHtml
  });
};

