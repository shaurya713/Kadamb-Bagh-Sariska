const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

/* =====================================
   MIDDLEWARE & PARSING
===================================== */
// Enable CORS for frontend connectivity
app.use(cors());

// Parse JSON and URL-encoded data from the booking form
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

/* =====================================
   GODADDY SMTP CONFIGURATION
===================================== */
const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: "reservation@kadambbagh.com",
        pass: "Kadambbagh697"
    }
});

/* =====================================
   SMTP STATUS LOGGING
===================================== */
transporter.verify((error, success) => {
    if (error) {
        console.log("CRITICAL: SMTP Connection Failed");
        console.log(error);
    } else {
        console.log("SUCCESS: SMTP Server is Ready to Send Emails");
    }
});

/* =====================================
   ROOT STATUS ROUTE
===================================== */
app.get("/", (req, res) => {
    res.status(200).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #2d4739;">Kadamb Bagh API</h1>
            <p>Status: <span style="color: green;">Online</span></p>
        </div>
    `);
});

/* =====================================
   BOOKING INQUIRY HANDLER (THE CORE)
===================================== */
app.post("/send-booking", async (req, res) => {
    console.log("Incoming Inquiry Received...");

    try {
        const {
            checkin,
            checkout,
            guests,
            room,
            name,
            contact,
            phone,
            notes,
            inquiryType // New field: 'stay' or 'reservation'
        } = req.body;

        // Logic: Decide recipient based on User Choice
        const targetMailbox = inquiryType === "stay" 
            ? "stay@kadambbagh.com" 
            : "reservation@kadambbagh.com";

        console.log(`Routing inquiry from ${name} to ${targetMailbox}`);

        /* ---------------------------------
           DETAILED HTML EMAIL TEMPLATE
        ---------------------------------- */
        const mailOptions = {
            from: `"Kadamb Bagh Concierge" <reservation@kadambbagh.com>`,
            to: targetMailbox,
            replyTo: contact,
            subject: `[INQUIRY] ${inquiryType.toUpperCase()} - ${name}`,
            html: `
                <div style="background-color: #f7f3ee; padding: 40px; font-family: 'Georgia', serif; color: #333;">
                    <div style="max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #d4c3a3; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="background-color: #2d4739; padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">KADAMB BAGH</h1>
                            <p style="color: #d4c3a3; margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase;">New ${inquiryType} Inquiry</p>
                        </div>
                        
                        <div style="padding: 30px;">
                            <h3 style="color: #2d4739; border-bottom: 1px solid #eee; padding-bottom: 10px;">Guest Details</h3>
                            <table style="width: 100%; line-height: 2;">
                                <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
                                <tr><td><strong>Email:</strong></td><td>${contact}</td></tr>
                                <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
                            </table>

                            <h3 style="color: #2d4739; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 25px;">Stay Information</h3>
                            <table style="width: 100%; line-height: 2;">
                                <tr><td><strong>Check-in:</strong></td><td>${checkin}</td></tr>
                                <tr><td><strong>Check-out:</strong></td><td>${checkout}</td></tr>
                                <tr><td><strong>Occupancy:</strong></td><td>${guests}</td></tr>
                                <tr><td><strong>Preferred Room:</strong></td><td>${room}</td></tr>
                            </table>

                            <div style="margin-top: 25px; background: #fdfaf5; padding: 20px; border-radius: 5px; border: 1px solid #eee;">
                                <strong style="color: #2d4739;">Guest Requests / Notes:</strong><br>
                                <p style="line-height: 1.6; color: #555;">${notes || "No special requests provided."}</p>
                            </div>
                        </div>

                        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 11px; color: #999;">
                            This message was generated by the Kadamb Bagh Website Inquiry System.
                        </div>
                    </div>
                </div>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Email Sent Successfully!");

        /* ---------------------------------
           DETAILED SUCCESS RESPONSE
        ---------------------------------- */
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; background: #f7f3ee; font-family: 'Georgia', serif; display: flex; justify-content: center; align-items: center; height: 100vh; }
                    .card { background: white; padding: 60px; border-radius: 20px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.1); max-width: 500px; }
                    h1 { color: #2d4739; font-size: 32px; margin-bottom: 15px; }
                    p { color: #666; font-size: 18px; line-height: 1.5; }
                    .back { display: inline-block; margin-top: 30px; padding: 15px 40px; background: #2d4739; color: white; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Inquiry Delivered</h1>
                    <p>Your request has been sent to our <strong>${inquiryType}</strong> team at ${targetMailbox}. We will contact you shortly.</p>
                    <a href="/" class="back">Return Home</a>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("FATAL ERROR during inquiry process:");
        console.error(error);
        res.status(500).send(`
            <div style="text-align:center; padding:50px; font-family: sans-serif;">
                <h1 style="color: #8b0000;">Inquiry Transmission Failed</h1>
                <p>We are experiencing technical difficulties. Please contact us directly at +91 XXXXX XXXXX.</p>
            </div>
        `);
    }
});

/* =====================================
   SERVER BOOTUP
===================================== */
const PORT = 3000;
app.listen(PORT, () => {
    console.log("-----------------------------------------");
    console.log(`SERVER RUNNING ON PORT: ${PORT}`);
    console.log(`LOCAL ACCESS: http://localhost:${PORT}`);
    console.log("-----------------------------------------");
});