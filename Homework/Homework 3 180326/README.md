# AI Smart Food Assistant (AI 智能美食助手)

## Description

AI Smart Food Assistant is a personal AI-powered healthy meal planning website that helps users generate and track their daily meals. The application provides AI-generated meal recommendations for breakfast, lunch, and dinner, complete with nutrition analysis, cooking instructions, and meal history tracking. Each user has their own personalized dashboard with saved meal plans and history.

## Features

### 1. Multi-Language Support (Translator)
- **English** (US flag)
- **Indonesian** (ID flag)  
- **Traditional Chinese** (TW flag)

The entire website interface is fully translated, including meal descriptions, cooking steps, navigation labels, and all UI elements.

### 2. Groq API Integration
- Uses **Groq API** with **Llama 3.3 70B Versatile** model for AI meal generation
- Generates random healthy meals from Indonesian and Chinese cuisines
- Provides AI-generated descriptions and cooking steps
- Free tier: 30 requests/minute, 14,400 requests/day

### 3. User Authentication (Sign In / Sign Up)
- **Sign Up**: Create a new account with username and password
- **Sign In**: Login with existing credentials
- **Logout**: Secure logout functionality
- Each user's data is stored separately in localStorage

### 4. Per-User Data Storage
User data is isolated and includes:
- Confirmed daily meals (breakfast, lunch, dinner)
- Meal history (past meals by date)
- API key settings
- Language preference

### 5. Meal Planning
- Generate AI-powered meal recommendations for:
  - **Breakfast** (300-450 kcal range)
  - **Lunch** (500-700 kcal range)
  - **Dinner** (500-750 kcal range)
- Confirm meals to add to daily plan
- Regenerate meals with different options

### 6. Nutrition Analysis
- Visual charts showing:
  - Daily calorie intake
  - Nutrient ratio (protein, carbs, fat, fiber)
  - Meal nutrition distribution
- Progress tracking vs daily recommendations

### 7. Meal History Calendar
- Calendar view of past meals
- Click on dates with recorded meals to view history
- Automatic daily reset at midnight

## How It Works

### User Flow

1. **Authentication**
   - User visits the website and sees the login/signup screen
   - Can toggle between "Sign In" and "Sign Up" modes
   - Credentials are validated and stored in localStorage
   - Session persists until logout

2. **API Key Setup**
   - User enters their free Groq API key
   - Key is validated by testing against the Groq API
   - Key is saved per-user in localStorage
   - AI features are enabled only when valid API key is present

3. **Meal Generation**
   - User selects a meal category (Breakfast/Lunch/Dinner)
   - Clicks "Regenerate" button
   - System sends request to Groq API with:
     - Selected language
     - Meal type
     - Nutritional requirements
   - AI returns JSON with meal name, description, steps, and nutrition info
   - User can confirm the meal or regenerate

4. **Meal Confirmation**
   - Confirmed meals are saved to localStorage with date
   - Meals appear on the Home dashboard
   - Daily calories and nutrition are calculated

5. **Nutrition Tracking**
   - Charts visualize daily nutrition intake
   - Shows breakdown by meal and nutrient type
   - Compares against recommended daily values

6. **History & Memory**
   - Calendar displays days with recorded meals
   - Clicking a date shows past meal details
   - Meals auto-save to history when day changes

### Technical Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **API**: Groq API (Llama 3.3 70B)
- **Storage**: localStorage (per-user)
- **Language**: JavaScript (JSX)

### Data Storage Structure

```
localStorage:
├── food_users              # All registered users
├── current_user            # Currently logged in user
├── groq_api_key            # User's API key
├── user_{id}_confirmed_meals  # Today's confirmed meals
├── user_{id}_saved_date    # Last saved date
└── user_{id}_meal_history # Historical meal data
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Get a free Groq API key from: https://console.groq.com/
5. Sign up for an account
6. Enter your API key in the settings
7. Start planning your meals!
