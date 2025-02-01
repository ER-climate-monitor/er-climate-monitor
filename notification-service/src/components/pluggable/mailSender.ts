import { Resend } from 'resend';
import dotenv from 'dotenv';
import Logger from 'js-logger';
import { DetectionEvent, SubscriptionTopic } from '../../model/notificationModel';
import { NotificationCallback, stringifySubscription } from '../detectionBroker';

dotenv.config();

class MailSender {
    private RESEND_API_KEY = process.env.RESEND_API_KEY;
    private emailRegex = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g);
    private resend: Resend;
    private senderMail: string = process.env.SENDER_MAIL || 'erclimatemonitor@gmail.com';

    constructor() {
        if (!this.RESEND_API_KEY) {
            throw new Error('Cannot create mail sender because no api keys where provided.');
        }
        this.resend = new Resend(this.RESEND_API_KEY);
    }

    async sendMail(recipient: string, topic: SubscriptionTopic, event: DetectionEvent): Promise<boolean> {
        try {
            if (!this.emailRegex.test(recipient)) {
                throw new Error('Invalid recipient email address: ' + recipient);
            }
            const { data, error } = await this.resend.emails.send({
                from: this.senderMail,
                to: [recipient],
                subject: `🚨 E-R Climate Monitor - Alert Notification System - ${topic.topic}`,
                html: this.emailHtml(topic, event),
            });

            if (error) {
                throw new Error(error.message);
            }
            Logger.info(`Email sent succesfully to ${recipient}: `, data);
            return true;
        } catch (error) {
            Logger.error('An error occurred: ', error);
            return false;
        }
    }

    emailHtml(topic: SubscriptionTopic, event: DetectionEvent): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: #007bff;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                        font-size: 20px;
                        font-weight: bold;
                    }
                    .content {
                        padding: 20px;
                        font-size: 16px;
                        color: #333;
                    }
                    .data-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    .data-table th, .data-table td {
                        padding: 10px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        font-size: 12px;
                        color: #888;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        Detection Event Alert 🚨 - ${stringifySubscription(topic)}
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>A new detection event has been recorded. Below are the details:</p>
                        <table class="data-table">
                            <tr><th>Sensor Name</th><td>${event.sensorName}</td></tr>
                            <tr><th>Event Type</th><td>${event.type}</td></tr>
                            <tr><th>Value</th><td>${event.value} ${event.unit}</td></tr>
                            <tr><th>Timestamp</th><td>${new Date(event.timestamp).toLocaleString()}</td></tr>
                            <tr><th>Query Name</th><td>${event.query.name}</td></tr>
                            <tr><th>Query Value</th><td>${event.query.value}</td></tr>
                        </table>
                        <p>If you have any concerns, please take the necessary action.</p>
                    </div>
                    <div class="footer">
                        &copy; 2025 Detection System. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

function createEmailNotificationCallback(mailSender: MailSender): NotificationCallback<DetectionEvent> {
    return async (userIds: Set<string>, topic: SubscriptionTopic, notification: DetectionEvent) => {
        userIds.forEach((uid) => mailSender.sendMail(uid, topic, notification));
    };
}

export { MailSender, createEmailNotificationCallback };
