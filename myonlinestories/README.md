# MyOnlineStories - AI-Powered Children's Story Generator

A personalized children's story generator powered by Kimi AI for story creation and Runware AI for artwork generation.

## Features

- **AI Story Generation**: Uses Kimi AI (Moonshot) to create personalized stories
- **AI Artwork Creation**: Generates custom illustrations with Runware AI
- **Character Personalization**: Upload photos for character customization
- **Multiple Genres**: Fantasy, Adventure, Mystery, Sci-Fi, Friendship, Superhero
- **Various Settings**: Magical forests, space stations, underwater cities, and more
- **Special Powers**: Choose from different magical abilities
- **Fallback System**: Template-based stories if AI generation fails

## Deployment on Render

### Prerequisites
- Kimi AI API Key from [Moonshot Platform](https://platform.moonshot.cn)
- Runware AI API Key from [Runware Platform](https://runware.ai)

### Deploy to Render (Node.js - Recommended)

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Or upload this project folder

2. **Configure Build & Deploy Settings**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

3. **Set Environment Variables**
   - Go to the "Environment" tab in your Render service
   - Add the following environment variables:
     - `KIMI_API_KEY`: Your Kimi AI API key from [Moonshot Platform](https://platform.moonshot.cn)
     - `RUNWARE_API_KEY`: Your Runware AI API key from [Runware Platform](https://runware.ai)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - API keys will be securely managed server-side

### Alternative: Python Deployment

If you prefer Python deployment:

1. **Configure Build & Deploy Settings**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (requires creating app.py)
   - **Environment**: `Python`

### Local Development

#### Node.js Setup (Recommended)
```bash
# Install dependencies
npm install

# Start the server
npm start

# The app will be available at http://localhost:3000
```

#### Python Setup (Alternative)
```bash
# Install dependencies
pip install -r requirements.txt

# Start with Python's built-in server
python -m http.server 8000

# The app will be available at http://localhost:8000
```

## API Integration

### Kimi AI (Story Generation)
- **Endpoint**: `https://api.moonshot.cn/v1/chat/completions`
- **Model**: `moonshot-v1-8k`
- **Purpose**: Generate personalized children's stories

### Runware AI (Artwork Generation)
- **Purpose**: Create custom illustrations for stories
- **Features**: Character-based artwork, scene generation

## File Structure

```
myonlinestories/
├── index.html          # Main application interface
├── script.js           # Core application logic
├── styles.css          # Application styling
├── server.js           # Express server for deployment
├── package.json        # Node.js dependencies
├── requirements.txt    # Python dependencies (alternative)
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Usage

1. **API Configuration**: 
   - If deployed on Render with environment variables, API keys are pre-configured
   - For local development, enter your API keys for Kimi AI and Runware AI in the form
2. Fill in character details (name, age)
3. Choose story genre and setting
4. Select special powers
5. Optionally upload a character photo
6. Click "Create My Story" to generate your personalized story with artwork

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js (or Python with Flask)
- **AI Services**: Kimi AI (Moonshot), Runware AI
- **Deployment**: Render

## Troubleshooting

### Common Render Deployment Issues

1. **Build Failures**: 
   - Use Node.js deployment (recommended) instead of Python
   - Ensure all dependencies are properly listed in package.json

2. **API Key Issues**:
   - API keys are entered in the web interface, not as environment variables
   - Make sure to get valid keys from respective platforms

3. **Port Issues**:
   - The app automatically uses Render's assigned PORT environment variable
   - No manual port configuration needed

### Local Development Issues

1. **Port Already in Use**:
   ```bash
   # Use a different port
   PORT=3001 npm start
   ```

2. **Missing Dependencies**:
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

## License

MIT License

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Verify your API keys are valid
3. Ensure all required fields are filled in the form

---

**Note**: This application requires valid API keys from Kimi AI and Runware AI to function fully. Without API keys, it will use template stories and placeholder artwork.