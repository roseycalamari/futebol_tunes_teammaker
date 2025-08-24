// Vercel Serverless Function to send welcome emails
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and name are required' 
            });
        }

        // Resend API configuration
        const RESEND_API_KEY = 're_FQXVh4R4_7Ji9SEyB7HHyi8SsKsd6ZCRk';
        const FROM_EMAIL = 'niterun@niterun.app';

        // Get email template (simplified for serverless)
        const emailTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to NiteRun</title>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .header { background: #006dff; padding: 40px 30px; text-align: center; color: white; }
                    .content { padding: 40px 30px; background: #fffcef; }
                    .title { font-size: 36px; font-weight: bold; color: #006dff; margin-bottom: 15px; }
                    .subtitle { font-size: 18px; color: #666; margin-bottom: 30px; }
                    .cta-button { display: inline-block; background: #006dff; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { padding: 30px; background: #006dff; text-align: center; color: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 32px;">NiteRun</h1>
                        <p style="margin: 10px 0 0; font-size: 18px;">Welcome to the Team!</p>
                    </div>
                    <div class="content">
                        <h1 class="title">Welcome to NiteRun, ${name}! ⚽</h1>
                        <p class="subtitle">Bring your crew together. Run, play, repeat.</p>
                        
                        <h2 style="color: #006dff;">What You Can Do Now</h2>
                        
                        <div style="margin: 20px 0;">
                            <h3 style="color: #006dff;">🎯 Smart Team Generator</h3>
                            <p>Create perfectly balanced teams in seconds using our advanced algorithms. Works for football, basketball, volleyball, and more!</p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <h3 style="color: #006dff;">📊 Match Tracking & Stats</h3>
                            <p>Track match results, player performance, and see detailed analytics. Watch your skills improve over time!</p>
                        </div>
                        
                        <div style="margin: 20px 0;">
                            <h3 style="color: #006dff;">👥 Group Management</h3>
                            <p>Create groups for your WhatsApp friends, share teams instantly, and keep everyone organized for game day.</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://niterun.app/dashboard.html" class="cta-button">
                                🚀 Create Your First Team
                            </a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Ready to revolutionize your sports experience?</p>
                        <p style="margin-top: 20px;">The NiteRun Team</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email via Resend API
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [email],
                subject: '⚽ Welcome to NiteRun - Let\'s Build Your Dream Team!',
                html: emailTemplate,
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Welcome email sent successfully:', result);
            res.status(200).json({ success: true, id: result.id });
        } else {
            console.error('Resend API error:', result);
            res.status(response.status).json({ 
                success: false, 
                error: result 
            });
        }

    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
