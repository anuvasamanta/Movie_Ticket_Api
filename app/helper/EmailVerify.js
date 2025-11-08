
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendBookingConfirmationEmail = async (bookingData) => {
    try {
        const currentDate = new Date().toLocaleString();
        const currentYear = new Date().getFullYear();
        
        const emailOptions = {
            from: `"Movie Theater" <${process.env.EMAIL_USER}>`,
            to: bookingData.userEmail,
            subject: ` Booking Confirmation - ${bookingData.movieName}`,
            html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Booking Confirmation</title>
                        <style>
                            body, html {
                                margin: 0 !important;
                                padding: 0 !important;
                                font-family: Arial, Helvetica, sans-serif !important;
                                line-height: 1.4 !important;
                                color: #333333 !important;
                                background-color: #f5f7fa !important;
                                width: 100% !important;
                            }
                            
                            .email-container {
                                max-width: 600px !important;
                                width: 100% !important;
                                margin: 0 auto !important;
                                background: #ffffff !important;
                                border-radius: 8px !important;
                                overflow: hidden !important;
                                border: 1px solid #dddddd !important;
                            }
                            
                            .email-header {
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                                color: #ffffff !important;
                                padding: 30px 25px !important;
                                text-align: center !important;
                            }
                            
                            .email-logo {
                                font-size: 24px !important;
                                font-weight: bold !important;
                                margin: 0 !important;
                            }
                            
                            .email-content {
                                padding: 25px !important;
                            }
                            
                            .email-subject {
                                font-size: 20px !important;
                                font-weight: bold !important;
                                margin-bottom: 15px !important;
                                color: #202124 !important;
                                line-height: 1.3 !important;
                            }
                            
                            .booking-details {
                                background: #f8f9fa !important;
                                padding: 20px !important;
                                margin: 20px 0 !important;
                                border-radius: 8px !important;
                                border-left: 4px solid #4285f4 !important;
                            }
                            
                            .detail-row {
                                display: flex !important;
                                justify-content: space-between !important;
                                margin: 12px 0 !important;
                                padding: 8px 0 !important;
                                border-bottom: 1px solid #e9ecef !important;
                            }
                            
                            .detail-label {
                                font-weight: bold !important;
                                color: #495057 !important;
                                flex: 1 !important;
                            }
                            
                            .detail-value {
                                color: #212529 !important;
                                flex: 1 !important;
                                text-align: right !important;
                            }
                            
                            .ticket-count {
                                background: #007bff !important;
                                color: white !important;
                                padding: 5px 15px !important;
                                border-radius: 20px !important;
                                font-weight: bold !important;
                                font-size: 12px !important;
                            }
                            
                            .total-amount {
                                font-size: 18px !important;
                                font-weight: bold !important;
                                color: #28a745 !important;
                            }
                            
                            .qr-section {
                                text-align: center !important;
                                margin: 25px 0 !important;
                                padding: 20px !important;
                                background: #f8f9fa !important;
                                border-radius: 8px !important;
                            }
                            
                            .instructions {
                                background: #fff3cd !important;
                                border: 1px solid #ffd54f !important;
                                padding: 15px !important;
                                margin: 20px 0 !important;
                                border-radius: 4px !important;
                                font-size: 13px !important;
                            }
                            
                            .email-footer {
                                background: #343a40 !important;
                                color: white !important;
                                padding: 20px 25px !important;
                                text-align: center !important;
                                font-size: 12px !important;
                            }
                            
                            .success-badge {
                                background: #28a745 !important;
                                color: white !important;
                                padding: 10px 20px !important;
                                border-radius: 5px !important;
                                display: inline-block !important;
                                margin-bottom: 20px !important;
                                font-weight: bold !important;
                            }
                            
                            @media only screen and (max-width: 600px) {
                                .email-container {
                                    width: 100% !important;
                                    border-radius: 0 !important;
                                    margin: 0 !important;
                                }
                                
                                .email-content {
                                    padding: 15px !important;
                                }
                                
                                .detail-row {
                                    flex-direction: column !important;
                                    text-align: left !important;
                                }
                                
                                .detail-value {
                                    text-align: left !important;
                                    margin-top: 5px !important;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="email-header">
                                <div class="email-logo">Movie Theater</div>
                                <h1 style="margin: 10px 0 0 0; font-size: 28px;">Booking Confirmed!</h1>
                                <p style="margin: 5px 0 0 0; opacity: 0.9;">Your movie tickets are booked successfully</p>
                            </div>
                            
                            <div class="email-content">
                                <div class="success-badge"> Booking Confirmed</div>
                                
                                <h2>Hello ${bookingData.userName},</h2>
                                <p>Thank you for booking with us! Here are your booking details:</p>
                                
                                <div class="booking-details">
                                    <div class="detail-row">
                                        <span class="detail-label">Booking ID:</span>
                                        <span class="detail-value">${bookingData.bookingId}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Movie:</span>
                                        <span class="detail-value">${bookingData.movieName}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Theater:</span>
                                        <span class="detail-value">${bookingData.theaterName}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Location:</span>
                                        <span class="detail-value">${bookingData.location}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Screen:</span>
                                        <span class="detail-value">${bookingData.screenNumber}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Show Time:</span>
                                        <span class="detail-value">${bookingData.showTiming}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Tickets:</span>
                                        <span class="detail-value">
                                            <span class="ticket-count">${bookingData.tickets} ${bookingData.tickets > 1 ? 'Tickets' : 'Ticket'}</span>
                                        </span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Total Amount:</span>
                                        <span class="detail-value total-amount">₹${bookingData.totalAmount}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Booking Date:</span>
                                        <span class="detail-value">${currentDate}</span>
                                    </div>
                                </div>

                                <div class="qr-section">
                                    <h3 style="margin-bottom: 15px;"> Your Booking QR Code</h3>
                                    <div style="background: #e9ecef; padding: 25px; border-radius: 8px; display: inline-block;">
                                        <div style="font-family: monospace; font-size: 16px; letter-spacing: 2px;">
                                            [QR: ${bookingData.bookingId}]
                                        </div>
                                    </div>
                                    <p style="font-size: 12px; color: #6c757d; margin-top: 10px;">
                                        Show this QR code at theater entrance
                                    </p>
                                </div>

                                <div class="instructions">
                                    <h4 style="color: #856404; margin: 0 0 10px 0;">📋 Important Instructions:</h4>
                                    <ul style="color: #856404; margin: 0; padding-left: 20px;">
                                        <li>Arrive at least 30 minutes before show time</li>
                                        <li>Carry a valid ID proof</li>
                                        <li>Show QR code or booking ID at entrance</li>
                                        <li>Seats are allocated on first-come basis</li>
                                        <li>No refunds for missed shows</li>
                                    </ul>
                                </div>
                                
                                <p style="text-align: center; margin-top: 25px;">
                                    <strong>We wish you a great movie experience!</strong>
                                </p>
                            </div>
                            
                            <div class="email-footer">
                                <p style="margin: 0 0 10px 0;">Thank you for choosing Movie Theater!</p>
                                <p style="margin: 0 0 10px 0;">For support: support@movietheater.com | Phone: +91-XXXXXX-XXXX</p>
                                <p style="margin: 0; opacity: 0.8;">© ${currentYear} Movie Theater. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>`
        }

        await transporter.sendMail(emailOptions)
        console.log(`Booking confirmation email sent successfully to ${bookingData.userEmail}`)
        return true

    } catch (error) {
        console.error('Booking email sending error:', error)
        return false
    }
}


module.exports = {
    sendBookingConfirmationEmail
}