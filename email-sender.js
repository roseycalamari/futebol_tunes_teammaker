// Email sender using Resend API
class EmailSender {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.resend.com';
    }

    async sendWelcomeEmail(userEmail, userName) {
        try {
            // Get the email template
            const emailTemplate = await this.getEmailTemplate();
            
            // Replace placeholders with user data
            const personalizedEmail = emailTemplate.replace('{{USER_NAME}}', userName || 'Champion');
            
            const response = await fetch(`${this.baseUrl}/emails`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'NiteRun Team <niterun@updates.resend.dev>',
                    to: [userEmail],
                    subject: '⚽ Welcome to NiteRun - Let\'s Build Your Dream Team!',
                    html: personalizedEmail,
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                console.log('Welcome email sent successfully!', result);
                return { success: true, id: result.id };
            } else {
                console.error('Failed to send email:', result);
                return { success: false, error: result };
            }
        } catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error: error.message };
        }
    }

    async getEmailTemplate() {
        // In a real app, you'd fetch this from your server
        // For now, we'll include it inline or fetch from your site
        try {
            const response = await fetch('/welcome-email-template.html');
            return await response.text();
        } catch (error) {
            // Fallback simple template
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #006dff; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 32px;">NiteRun</h1>
                        <p style="margin: 10px 0 0; font-size: 18px;">Welcome to the Team!</p>
                    </div>
                    <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #006dff; margin-bottom: 20px;">Hi {{USER_NAME}}! 🎉</h2>
                        <p>Welcome to NiteRun! You just joined thousands of sports enthusiasts who are revolutionizing team creation.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://futeboltunesteammaker.vercel.app/dashboard.html" 
                               style="background: #006dff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                🚀 Create Your First Team
                            </a>
                        </div>
                        <p style="text-align: center; color: #666;">Game on!<br>The NiteRun Team</p>
                    </div>
                </div>
            `;
        }
    }
}

// Usage example:
// const emailSender = new EmailSender('YOUR_RESEND_API_KEY');
// await emailSender.sendWelcomeEmail('user@example.com', 'John Doe');
