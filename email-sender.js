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
            const personalizedEmail = emailTemplate.replace(/{{USER_NAME}}/g, userName || 'Champion');
            
            const response = await fetch(`${this.baseUrl}/emails`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    from: 'niterun@niterun.app',
                    to: [userEmail],
                    subject: '⚽ Welcome to NiteRun - Let\'s Build Your Dream Team!',
                    html: personalizedEmail,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resend API error response:', response.status, errorText);
                
                // Try to parse error as JSON
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText };
                }
                
                return { 
                    success: false, 
                    error: errorData,
                    status: response.status,
                    statusText: response.statusText
                };
            }

            const result = await response.json();
            console.log('Welcome email sent successfully!', result);
            return { success: true, id: result.id };
            
        } catch (error) {
            console.error('Email sending error:', error);
            
            // Handle specific error types
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { 
                    success: false, 
                    error: { 
                        message: 'Network error - this might be a CORS issue. Try using a server-side solution or check your domain configuration.' 
                    },
                    type: 'network_error'
                };
            }
            
            return { 
                success: false, 
                error: { message: error.message },
                type: 'general_error'
            };
        }
    }

    async getEmailTemplate() {
        try {
            // Try to fetch the template from the current domain
            const response = await fetch('./welcome-email-template.html');
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.log('Could not fetch template from file, using fallback');
        }
        
        // Fallback template if file can't be loaded
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
                        <a href="${CONFIG.APP_URL}/dashboard.html" 
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

// Usage example:
// const emailSender = new EmailSender(CONFIG.RESEND_API_KEY);
// await emailSender.sendWelcomeEmail('user@example.com', 'John Doe');
