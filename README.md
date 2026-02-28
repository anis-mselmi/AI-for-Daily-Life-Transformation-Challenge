# 🍳 KoolAI

Welcome to **One Recipe** (formerly AI-for-Daily-Life-Transformation-Challenge), an intelligent, end-to-end recipe generator and meal planner designed to reduce food waste, save money, and make cooking effortless. 

Powered by large language models, image generation APIs, and a robust backend, this application empowers home cooks—from busy parents to culinary explorers—to stop wondering "what's for dinner?" and start cooking with what they already have.

---

## ✨ Features

- **🧠 Intelligent Recipe Generation**: Input the ingredients you currently have (and secret ingredients you want to try), and let Google's Gemini AI craft personalized, step-by-step recipes.
- **📅 Multi-Day Meal Planning**: Generate comprehensive 3-day or 7-day meal plans instantly, optimizing your existing pantry staples.
- **🎨 Dynamic Artwork Generation**: Every recipe you generate automatically gets a high-quality, custom cover image powered by the Hugging Face AI API.
- **⚙️ Highly Customizable**: Filter recipes by your specific needs:
  - **Budget** (Low, Moderate, High)
  - **Family Size** (1 to 8+ people)
  - **Cuisine Type** (French, Italian, Asian, etc.)
  - **Dish Type** (Main, Appetizer, Dessert, etc.)
- **🌍 Bilingual Support (EN / FR)**: First-class support for both English and French languages out of the box.
- **☁️ Cloud Sync & History Tracker**: Log in to sync your "kitchen state" (ingredients, budget, preferences) and infinitely browse your past chat and recipe history across all devices.

---

## 🛠️ Technology Stack

This project is built using modern web development standards and cutting-edge artificial intelligence APIs.

### Frontend
- **Framework**: React 19 (TypeScript)
- **Bundler**: Vite (Fast HMR)
- **Styling**: Vanilla CSS, Framer Motion (Animations), Lucide React (Icons)
- **i18n**: `i18next` & `react-i18next` (Language switching)

### Backend & Database
- **BaaS**: Supabase 
- **Database**: PostgreSQL (Stores user profiles, kitchen states, and chat iterations)
- **Auth**: Supabase Authentication

### Artificial Intelligence
- **Text & Logic**: Google Generative AI (`@google/generative-ai`) via Gemini models for recipe and meal plan creation.
- **Image Synthesis**: Hugging Face Inference API (`@huggingface/inference`) for contextual food photography.

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### 1. Clone the repository

```bash
git clone https://github.com/anis-mselmi/your-repo.git
cd AI-for-Daily-Life-Transformation-Challenge-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables Setup

You must configure the required API keys to use the backend and AI features.
1. Copy the example `.env` file to create your own configuration:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the following credentials:

```env
# Supabase Backend
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Generative AI (Gemini)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Hugging Face Inference API
VITE_HUGGINGFACE_API_KEY=your_hugging_face_token
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`.

---

## 🎯 Target Audience & Goals

This project was built to address real-world daily challenges:
- **Budget-Conscious Individuals**: Save money by utilizing ingredients before they spoil.
- **Busy Parents**: Streamline meal planning for large family sizes.
- **Eco-Warriors**: Minimize household food waste.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/anis-mselmi/your-repo/issues) if you want to contribute.

## 📄 License

This project is private and intended for internal use/challenge submission. Contact the authors for licensing questions.
