# AIMed Guru - AI Medical Mentor

**AIMed Guru** is an advanced AI-powered mentorship platform designed for NEET aspirants. It combines rigorous medical pedagogy with interactive features to build competence and confidence.

## Features

-   **🧠 Intelligent Mentorship**: Powered by Google Gemini 1.5 Pro, offering experienced medical guidance.
-   **🚀 Anti-Gravity Mode**: A unique, fun teaching style that uses zero-gravity metaphors to explain complex concepts.
-   **👁️ Visual Answer Evaluation**: Upload handwritten notes or diagrams for instant AI analysis and feedback.
-   **💾 Persistence & Memory**: Conversations are automatically saved to MongoDB and restored upon return.
-   **🔒 Secure Accounts**: User authentication via NextAuth.js ensures your progress is private and preserved.

## Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **AI**: Google Generative AI SDK (Gemini)
-   **Database**: MongoDB
-   **Auth**: NextAuth.js (v4)

## Getting Started

### Prerequisites

-   Node.js 18+
-   MongoDB Cluster

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/aimed-guru.git
    cd dedicated-medical-mentor
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory:
    ```env
    GEMINI_API_KEY=your_gemini_api_key
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret_key
    NEXTAUTH_URL=http://localhost:3000
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open in Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## Usage

1.  **Sign Up**: Create a new account to start tracking your progress.
2.  **Chat**: Ask questions about Physics, Chemistry, or Biology.
3.  **Upload**: Attach images of your work for evaluation.
4.  **Toggle Mode**: Switch to "Anti-Gravity" mode for a fun learning experience.
# med
