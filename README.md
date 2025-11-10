Zone01 Oujda GraphQL Profile
A modern, interactive profile dashboard for Zone01 Oujda students built with vanilla JavaScript, GraphQL, and SVG visualizations.
Features
Authentication

✅ Secure login with Zone01 credentials (username/email + password)
✅ JWT token-based authentication
✅ Token validation and auto-logout on expiration
✅ Remember me functionality via localStorage

Dashboard

📊 Real-time Statistics

Total XP earned
Audit ratio (given/received)
Projects passed count
Success rate percentage

📈 Interactive SVG Graphs

XP Progress Timeline - Line graph showing cumulative XP over time
Top Projects by XP - Bar chart of highest XP-earning projects
Audit Ratio Breakdown - Pie chart visualizing audit balance
Pass/Fail Ratio - Donut chart showing project success rate

🔄 Recent Activity Feed - Last 10 transactions with project details

Technical Features

🎨 Modern glassmorphism UI design
📱 Fully responsive (mobile, tablet, desktop)
⚡ Fast SPA (Single Page Application) architecture
🔒 Secure token storage and validation
🎭 Smooth animations and transitions
📊 Custom SVG graph rendering (no external charting libraries)

Project Structure
project/
├── index.html # Main HTML with all views
├── css/
│ └── general.css # Complete styling
├── js/
│ ├── app.js # Authentication & view management
│ └── dashboard.js # Dashboard logic & SVG graphs
└── assets/
├── logo.png # Your logo
└── 01-trame.svg # Background pattern
Setup Instructions

1. Clone/Download Files
   Create the following file structure and copy the provided code:
   bashmkdir zone01-profile
   cd zone01-profile
   mkdir css js assets
2. File Setup

Copy the HTML code to index.html
Copy the CSS code to css/general.css
Copy app.js to js/app.js
Copy dashboard.js to js/dashboard.js
Add your logo to assets/logo.png
Add your background pattern to assets/01-trame.svg

3. Update HTML Script References
Make sure your index.html includes both JavaScript files:
html<script src="js/app.js"></script>
<script src="js/dashboard.js"></script>
4. Test Locally
   Open index.html in a modern browser or use a local server:
   bash# Python 3
   python -m http.server 8000

# Python 2

python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)

npx http-server

# VS Code Live Server extension

# Right-click index.html -> Open with Live Server

Visit http://localhost:8000
Deployment Options
Option 1: GitHub Pages (Recommended)

Create a new GitHub repository
Push your code:

bashgit init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/zone01-profile.git
git push -u origin main

Go to Settings > Pages
Select main branch
Click Save
Your site will be live at https://yourusername.github.io/zone01-profile/

Option 2: Netlify

Go to netlify.com
Drag and drop your project folder
Site deployed instantly!

Or via Git:
bashgit init
git add .
git commit -m "Initial commit"

# Push to GitHub/GitLab

# Connect repository on Netlify

Option 3: Vercel

Install Vercel CLI:

bashnpm i -g vercel

Deploy:

bashvercel

Follow the prompts

Option 4: Cloudflare Pages

Push code to GitHub/GitLab
Go to pages.cloudflare.com
Connect your repository
Deploy automatically

GraphQL Queries Used
User Authentication
graphqlquery {
user {
id
login
attrs
totalUp
totalDown
auditRatio
}
}
Transactions (XP)
graphqlquery {
user {
transactions(order_by: { createdAt: desc }) {
id
type
amount
createdAt
path
}
}
}
Progress Data
graphqlquery {
user {
progresses(order_by: { updatedAt: desc }) {
id
grade
createdAt
updatedAt
path
object {
name
type
}
}
}
}
Customization
Change Color Scheme
Edit css/general.css:
css/_ Primary color (currently purple) _/
background: linear-gradient(135deg, #9969ff 0%, #7c3aed 100%);

/_ Change to blue _/
background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);

/_ Change to green _/
background: linear-gradient(135deg, #10b981 0%, #047857 100%);
Add More Graphs
In js/dashboard.js, add a new render function:
javascriptrenderCustomGraph() {
const svg = document.getElementById('custom-graph');
// Your SVG rendering logic here
}
Don't forget to call it in renderGraphs():
javascriptrenderGraphs() {
this.renderXPTimeline();
this.renderXPByProjects();
this.renderAuditRatio();
this.renderPassFailRatio();
this.renderCustomGraph(); // Add this
}
Add More Statistics
Edit the stats grid in HTML and update Dashboard.updateStats() in JavaScript.
Browser Support

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers

Requires modern browser with:

ES6+ JavaScript support
SVG support
LocalStorage API
Fetch API

Troubleshooting
"No token received"

Check your username/password
Ensure you're using Zone01 Oujda credentials

Graphs not showing

Open browser console (F12)
Check for JavaScript errors
Ensure you have transaction/progress data

CORS errors

Must be served via HTTP/HTTPS (not file://)
Use a local server or deploy online

Token expired

The app auto-detects and logs you out
Simply log in again

Performance

Initial load: ~50KB (uncompressed)
No external dependencies
No npm packages required
Pure vanilla JavaScript
Optimized SVG rendering

Security

✅ Passwords never stored
✅ JWT tokens stored securely
✅ Token expiration validation
✅ Auto-logout on invalid tokens
✅ HTTPS recommended for production

Future Enhancements

Dark/Light theme toggle
Export data as PDF/CSV
More graph types (radar, scatter)
Skill tree visualization
Project timeline view
Compare with peers (anonymous)
Achievement badges
Custom date range filters

Credits

Built for Zone01 Oujda GraphQL Project
Design inspired by modern dashboard UIs
Fonts: IBM Plex Sans & IBM Plex Mono

License
MIT License - Feel free to modify and share!

Made with ❤️ for Zone01 Oujda students
