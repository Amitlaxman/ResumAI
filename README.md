# ResumAI: AI-Powered Resume Builder

ResumAI is a web application that helps you create professional, tailored resumes through a conversational AI interface. It leverages generative AI to understand your professional background and craft resumes specific to job descriptions you provide.

## Key Features

- **Conversational Profile Building**: Simply chat with the AI assistant. It learns about your skills, experience, projects, and more, and automatically updates your professional profile.
- **AI-Powered Resume Generation**: Paste a job description, and the AI will generate a high-impact resume in seconds, tailored to the role and based on your profile.
- **LaTeX-Based Output**: Resumes are generated in LaTeX format, ensuring a professional, high-quality, and clean look.
- **Live Preview & Customization**: See a live preview of your resume as you make changes. You get full access to the underlying LaTeX code for ultimate customization.
- **Firebase Integration**: User data, profiles, and generated resumes are securely stored and managed using Firebase Authentication and Firestore.

## Technology Stack

This project is built with a modern, production-ready tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit) (Google's Generative AI toolkit)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Authentication and Firestore)

## Getting Started

To run this project locally, follow these steps:

### 1. Prerequisites

- Node.js (v18 or later)
- An active Firebase project with Authentication (Email/Password and Google providers enabled) and Firestore enabled.
- A Google AI API Key for using Genkit with Gemini models.

### 2. Setup Environment Variables

Create a `.env` file in the root of the project and add your Firebase configuration and Google AI API key:

```
# Your Google AI API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Also, update the Firebase configuration in `src/lib/firebase.ts` with your own project's credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Servers

You need to run two processes in separate terminals: the Next.js frontend and the Genkit AI flows.

**Terminal 1: Run the Next.js App**

```bash
npm run dev
```

This will start the web application, typically on `http://localhost:9002`.

**Terminal 2: Run Genkit**

```bash
npm run genkit:watch
```

This starts the Genkit development server, which watches for changes in your AI flows.

You can now access the application in your browser and start building your profile!

## Project Structure

- `src/app/`: Contains the main pages of the Next.js application.
- `src/components/`: Shared React components, including UI components from ShadCN.
- `src/ai/`: All Genkit-related code.
  - `src/ai/flows/`: Contains the core AI logic for chat, resume generation, and other tasks.
- `src/lib/`: Core utility functions, Firebase configuration, and Firestore interactions.
- `src/hooks/`: Custom React hooks used throughout the application.
- `public/`: Static assets.
