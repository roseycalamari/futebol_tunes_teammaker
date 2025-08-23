# NiteRun - Sports Team Manager 🏆

A comprehensive web application for creating balanced sports teams, tracking player performance, and managing match history. Perfect for WhatsApp groups and casual sports enthusiasts who want to move beyond random team selection.

## ✨ Features

### 🔐 Authentication System
- **User Registration & Login**: Email/password and Google OAuth support
- **Secure Sessions**: Firebase Authentication integration
- **User Profiles**: Personalized experience with saved data

### 🏃‍♂️ Team Generation
- **Multi-Sport Support**: Football, Basketball, Volleyball, Tennis
- **Smart Balancing**: Advanced algorithms for fair team distribution
- **Position Analysis**: Sport-specific position recommendations
- **Custom Team Sizes**: Support for any number of players/teams

### 📊 Player Management
- **Player Profiles**: Store names, skill levels, positions
- **Performance Tracking**: Monitor individual and team statistics
- **Skill Assessment**: 1-5 rating system with modifiers

### 🎯 Match Tracking
- **Result Recording**: Track scores, winners, and match details
- **History Management**: View past matches and performance trends
- **Statistics**: Win/loss ratios and performance analytics

### 👥 Group Management
- **Create Groups**: Organize your sports communities
- **Invite Codes**: Share groups via unique codes
- **Member Management**: Track group participants

### 📱 Dashboard
- **Overview Statistics**: Quick view of your activity
- **Recent Activity**: Latest teams, players, and matches
- **Quick Actions**: Easy access to all features

## 🚀 Getting Started

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Get your configuration details
5. Replace the placeholder config in:
   - `index.html`
   - `login.html`
   - `signup.html`
   - `dashboard.html`
   - `script.js`

### 2. Local Development
1. Clone or download this repository
2. Open `index.html` in your browser
3. Start with the signup/login process
4. Explore the team generation features

### 3. Deploy to Web
1. Upload all files to your web hosting service
2. Ensure Firebase configuration is correct
3. Test authentication and core features

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (optional), Local Storage
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins), Custom SK Glypher

## 📁 File Structure

```
futebol_tunes_teammaker/
├── assets/
│   └── images/          # App icons and logos
├── index.html           # Main homepage
├── login.html           # User login
├── signup.html          # User registration
├── dashboard.html       # User dashboard
├── team-generator.html  # Team creation tool
├── player-profiles.html # Player management
├── match-tracker.html   # Match tracking
├── tournament.html      # Tournament management
├── player-stats.html    # Statistics view
├── settings.html        # App settings
├── styles.css           # Main stylesheet
├── script.js            # Core functionality
└── README.md            # This file
```

## 🔧 Configuration

### Firebase Configuration
Replace the placeholder config in your files:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Customization
- **Colors**: Modify CSS variables in `styles.css`
- **Sports**: Add new sports in `EnhancedTeamGenerator.sports`
- **Features**: Extend functionality in `script.js`

## 🎯 Next Steps

### Immediate Improvements
1. **Set up Firebase**: Complete authentication setup
2. **Test Core Features**: Generate teams, add players
3. **Customize Sports**: Add your preferred sports
4. **Test on Mobile**: Ensure responsive design works

### Future Enhancements
1. **Real-time Updates**: Live team changes for groups
2. **Advanced Analytics**: Performance trends and insights
3. **Mobile App**: Progressive Web App (PWA) features
4. **Social Features**: Chat, notifications, sharing
5. **Tournament Mode**: Bracket generation and management
6. **Weather Integration**: Game cancellation predictions
7. **Location Services**: Find nearby fields/courts

## 💡 Usage Tips

### For WhatsApp Groups
1. **Create a Group**: Use the group management feature
2. **Generate Teams**: Use team generator for each game
3. **Share Results**: Track match outcomes
4. **Invite Members**: Share group codes with friends

### For Team Captains
1. **Player Database**: Build your regular player list
2. **Skill Tracking**: Monitor improvement over time
3. **Team History**: Review past team combinations
4. **Performance Analysis**: Identify strengths and weaknesses

## 🐛 Troubleshooting

### Common Issues
- **Authentication Errors**: Check Firebase configuration
- **Data Not Saving**: Verify localStorage is enabled
- **Styling Issues**: Check CSS file paths and variables
- **Mobile Problems**: Test responsive design breakpoints

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Minimum**: ES6+ support required

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to:
- Report bugs or issues
- Suggest new features
- Share improvement ideas
- Fork and modify for your own use

## 📄 License

This project is for personal and educational use. Feel free to modify and use for your own sports groups.

## 🎉 Support

If you find this app useful for your WhatsApp sports group, consider:
- Sharing with friends
- Providing feedback
- Contributing ideas for new features

---

**Built with ❤️ for sports enthusiasts who want better team management!**
