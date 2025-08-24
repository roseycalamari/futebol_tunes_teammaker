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

        // Use your beautiful email template with personalization
        const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NiteRun</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: #006dff;
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            max-width: 200px;
            height: auto;
        }
        
        .hero-section {
            padding: 50px 30px;
            text-align: center;
            background-color: #fffcef;
        }
        
        .welcome-title {
            font-size: 36px;
            font-weight: bold;
            color: #006dff;
            margin-bottom: 15px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        
        .welcome-subtitle {
            font-size: 18px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
        }
        
        .features-section {
            padding: 40px 30px;
            background-color: #fffcef;
        }
        
        .features-title {
            font-size: 24px;
            font-weight: bold;
            color: #006dff;
            text-align: center;
            margin-bottom: 30px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        
        .features-grid {
            display: table;
            width: 100%;
        }
        
        .feature-item {
            display: table-row;
            margin-bottom: 20px;
        }
        
        .feature-icon {
            display: table-cell;
            width: 60px;
            vertical-align: top;
            padding-right: 10px;
        }
        
        .feature-content {
            display: table-cell;
            vertical-align: top;
        }
        
        .feature-icon img {
            width: 40px;
            height: 40px;
            display: block;
        }
        
        .feature-title {
            font-size: 16px;
            font-weight: bold;
            color: #006dff;
            margin-bottom: 5px;
        }
        
        .feature-description {
            font-size: 14px;
            color: #666;
            line-height: 1.4;
        }
        
        .cta-section {
            padding: 40px 30px;
            text-align: center;
            background-color: #fffcef;
        }
        
        .cta-button {
            display: inline-block;
            background: #006dff;
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0, 109, 255, 0.3);
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        
        .cta-subtitle {
            font-size: 14px;
            color: #666;
        }
        
        .footer {
            padding: 30px;
            background-color: #006dff;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            font-size: 14px;
            color: #fffcef;
            margin-bottom: 15px;
        }
        
        .social-links {
            margin-bottom: 15px;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #fffcef;
            text-decoration: none;
            font-size: 14px;
        }
        
        .unsubscribe {
            font-size: 12px;
            color: #fffcef;
        }
        
        .unsubscribe a {
            color: #fffcef;
            text-decoration: none;
        }
        
        /* Mobile Responsive */
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                box-shadow: none;
            }
            
            .header, .hero-section, .features-section, .cta-section {
                padding: 30px 20px;
            }
            
            .welcome-title {
                font-size: 24px;
            }
            
            .welcome-subtitle {
                font-size: 16px;
            }
            
            .features-grid {
                display: block;
            }
            
            .feature-item {
                display: block;
                margin-bottom: 25px;
                padding: 15px;
                background: #f8f9ff;
                border-radius: 8px;
            }
            
            .feature-icon, .feature-content {
                display: block;
            }
            
            .feature-icon {
                text-align: center;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <img src="https://niterun.app/assets/images/logo%20png.png" alt="NiteRun Logo" class="logo">
        </div>
        
        <!-- Hero Section -->
        <div class="hero-section">
            <h1 class="welcome-title">Welcome to NiteRun, ${name}! <img src="https://niterun.app/assets/images/playerstatsicon.png" alt="Stats Icon" style="width: 45px; height: 45px; vertical-align: middle;"></h1>
            <p class="welcome-subtitle">
                Bring your crew together. Run, play, repeat.
            </p>
        </div>
        
        <!-- Features Section -->
        <div class="features-section">
            <h2 class="features-title">What You Can Do Now</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">
                        <img src="https://niterun.app/assets/images/teamgeneratoricon.png" alt="Team Generator">
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">Smart Team Generator</div>
                        <div class="feature-description">Create perfectly balanced teams in seconds using our advanced algorithms. Works for football, basketball, volleyball, and more!</div>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">
                        <img src="https://niterun.app/assets/images/playerstatsicon.png" alt="Player Stats">
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">Match Tracking & Stats</div>
                        <div class="feature-description">Track match results, player performance, and see detailed analytics. Watch your skills improve over time!</div>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">
                        <img src="https://niterun.app/assets/images/profileicon.png" alt="Player Profiles">
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">Group Management</div>
                        <div class="feature-description">Create groups for your WhatsApp friends, share teams instantly, and keep everyone organized for game day.</div>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">
                        <img src="https://niterun.app/assets/images/tournamentsicon.png" alt="Tournaments">
                    </div>
                    <div class="feature-content">
                        <div class="feature-title">Tournament Mode</div>
                        <div class="feature-description">Organize tournaments, track brackets, and celebrate victories with your sports community.</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Call to Action -->
        <div class="cta-section">
            <a href="https://niterun.app/dashboard.html" class="cta-button">
                <img src="https://niterun.app/assets/images/generatebuttoniconcream.png" alt="Puzzle Icon" style="width: 32px; height: 32px; vertical-align: middle; margin-right: 12px;">
                Create Your First Team
            </a>
            <p class="cta-subtitle">Start generating balanced teams and tracking your matches today!</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">Ready to revolutionize your sports experience?</p>
            
            <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Blog</a>
            </div>
            
            <p class="unsubscribe">
                The NiteRun Team<br><br>
                <a href="#">Unsubscribe</a> | <a href="#">Update Preferences</a>
            </p>
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
