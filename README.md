# Arbor

Branched-based chatting with strong memory for all your needs.

Arbor lets you create branching chat sessions so you can explore multiple ideas without losing context. Each branch preserves long-term memory, making it easy to compare directions, revisit old thoughts, and keep your reasoning organized.
<img width="1893" height="911" alt="image" src="https://github.com/user-attachments/assets/58569137-fd23-4b11-9e7d-3a3c7debcc40" />

## Features

- Branch-based conversations: fork any message into a new branch and explore alternative directions.
- Strong long-term memory: store and reuse context across turns and branches.
- Multi-session support: handle multiple parallel conversations for different projects or topics.
- Auth & user management: login system (including Google login) to keep chats private to each user.
- Full-stack architecture: separate Client and Server with a clean API boundary.
- Modern UI: responsive chat interface with intuitive branching controls.

## Tech Stack

- **Client**: JavaScript, React.js, CSS 
- **Server**: Node.js , Express
- **Auth**: Google login with firebase authentication
- **Database**: Mongodb
- **Other**: See `package.json` for full dependency list.

## Project Structure

```text
.
├── Client/           # Frontend code (UI, chat view, branching UI)
├── Server/           # Backend code (APIs, auth, memory store, branching logic)
├── package.json      # Root configuration, scripts and shared dependencies
├── package-lock.json
└── .gitignore
```

> The exact structure may evolve over time..

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- A configured database and environment variables (see below)

### Installation

Clone the repository:

```bash
git clone https://github.com/raja-lovescoding/Arbor.git
cd Concept-Tree
```

Install dependencies (root and sub-projects if needed):

```bash
# If you manage everything from the root:
npm install

# Or, if Client and Server have their own package.json:
cd Client
npm install

cd ../Server
npm install
```

### Environment Setup

Create `.env` files as needed (for example in `Server/`):

```env
PORT=5000
NODE_ENV=development

# Auth
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_URL=your_database_connection_string
```

Adjust variable names to match your actual implementation.

### Running the app

From the root or respective folders:

```bash
# Run server
cd Server
npm start

# Run client
cd ../Client
npm run dev
```


## Usage

1. Sign up or login (email/password or Google login, if configured).
2. Start a new chat session.
3. When you reach an interesting point, **branch** from a message to explore a different direction.
4. Navigate between branches to compare ideas and outcomes.
5. Rely on the long-term memory to keep context as your conversation grows.


## Contributing

Contributions, ideas, and feedback are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes: `git commit -m "Add my feature"`.
4. Push to the branch: `git push origin feature/my-feature`.
5. Open a Pull Request.


