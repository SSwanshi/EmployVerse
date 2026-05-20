require('dotenv').config();
const { sendNotification } = require('../services/notification.service');

// Example script demonstrating how to publish notifications to the BullMQ queue.
// In your application (e.g. inside an application controller when a recruiter shortlists a candidate),
// you would import `sendNotification` from the notification service and call it like below.
async function run() {
  console.log('🚀 Enqueuing example notification jobs...');

  try {
    const receiverId = 'sample-user-id-123'; // Replace with a real user's userId

    // 1. Publish APPLICATION_SHORTLISTED notification
    const job1 = await sendNotification({
      receiverId,
      senderId: 'recruiter-xyz',
      type: 'APPLICATION_SHORTLISTED',
      title: 'Congratulations!',
      message: 'Your application for Senior Frontend Developer has been shortlisted. We will reach out to schedule an interview.'
    });
    console.log(`✅ Shortlist notification enqueued. Job ID: ${job1.id}`);

    // 2. Publish PAYMENT_SUCCESS notification
    const job2 = await sendNotification({
      receiverId,
      type: 'PAYMENT_SUCCESS',
      title: 'Premium Activated',
      message: 'Thank you for upgrading! Your premium membership is now active.'
    });
    console.log(`✅ Payment success notification enqueued. Job ID: ${job2.id}`);

    // 3. Publish APPLICATION_VIEWED notification
    const job3 = await sendNotification({
      receiverId,
      senderId: 'recruiter-abc',
      type: 'APPLICATION_VIEWED',
      title: 'Profile Viewed',
      message: 'EmployCorp recently viewed your profile and resume.'
    });
    console.log(`✅ Profile viewed notification enqueued. Job ID: ${job3.id}`);

    console.log('🎉 All sample notification jobs enqueued successfully! BullMQ workers will process them asynchronously.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to publish notification jobs:', error);
    process.exit(1);
  }
}

run();
