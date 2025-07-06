# Circles Path Explorer

A web application for exploring and visualizing token transfer paths in the Circles V2 network, featuring an AI-powered chat assistant for intelligent querying and analysis.

## 🌟 Overview

Circles Path Explorer is a tool designed to help users understand complex token flows within the Circles ecosystem. It combines visualization capabilities with an AI assistant that can query The Graph Protocol's subgraph data using natural language.

### Key Features

- **🔍 Transaction Analysis**: Visualize all transfer paths within a single transaction using interactive Sankey diagrams
- **📊 Address Explorer**: Track all incoming and outgoing transfers for any address in the network
- **🤖 AI Assistant**: Chat interface powered by OpenAI that translates natural language queries into GraphQL
- **🔄 Multi-hop Path Visualization**: Understand complex circular transfers and payment flows
- **📈 Interactive Visualizations**: Export-ready Sankey diagrams with full interactivity
- **🔗 MCP Integration**: Leverages Model Context Protocol for secure subgraph access

## 🏗️ Architecture

### Frontend (React + TypeScript)

The frontend is built with modern React patterns and TypeScript for type safety:

- **Pages**: Core views for Home, Transaction Analysis, Address Explorer, and Chat
- **Components**: Modular, reusable UI components organized by feature
- **Visualization**: ECharts-based Sankey diagrams for complex transfer flows
- **State Management**: React Context for search and filter states
- **Data Fetching**: Apollo Client for GraphQL queries with intelligent caching

### Backend (Node.js + Express)

The backend serves as a bridge between the frontend and external services:

- **WebSocket Server**: Real-time bidirectional communication using Socket.io
- **MCP Client**: Connects to The Graph's MCP endpoint for secure subgraph access
- **OpenAI Integration**: Translates natural language to GraphQL queries
- **Session Management**: Maintains chat context and history per connection

### Key Technologies

- **Frontend**: React, TypeScript, Vite, Apollo Client, ECharts, TailwindCSS
- **Backend**: Node.js, Express, Socket.io, OpenAI SDK, MCP Remote
- **Data**: GraphQL, The Graph Protocol

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Access to a Circles V2 subgraph
- OpenAI API key
- The Graph API key for MCP access

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/circles-path-explorer.git
cd circles-path-explorer
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create `.env` files in both root and backend directories:

**Root `.env`** (Frontend):
```env
VITE_SUBGRAPH_KEY=your_subgraph_key
VITE_SUBGRAPH_ID=your_subgraph_id
VITE_BLOCK_EXPLORER_URL=https://gnosisscan.io
VITE_CHAT_SERVER_URL=http://localhost:3001
```

**Backend `.env`**:
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
GRAPH_API_KEY=your_graph_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
SUBGRAPH_ID=your_subgraph_id
```

### 4. Install MCP Remote (Required for backend)

```bash
npm install -g @modelcontextprotocol/mcp-remote
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**:
```bash
cd backend
npm run dev
```

2. **In a new terminal, start the frontend**:
```bash
npm run dev
```

3. **Access the application**:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Run production servers
cd backend
npm start
```

## 🚀 Deployment

### Vercel Deployment (Limited Functionality)

⚠️ **Important Note**: The current Vercel deployment has limitations. Due to Vercel's serverless architecture, the WebSocket-based chat functionality does not work properly. The deployment script (`deploy.sh`) attempts to work around this by forcing polling transport, but a proper backend deployment is recommended for full functionality.

For quick deployment to Vercel:

```bash
chmod +x deploy.sh
./deploy.sh
```

**What works on Vercel:**
- ✅ Transaction path visualization
- ✅ Address exploration
- ✅ GraphQL queries to the subgraph
- ❌ AI Chat assistant (requires persistent WebSocket connection)

### Recommended Production Deployment

For full functionality including the AI chat assistant, deploy the backend and frontend separately:

**Backend Options:**
- **Railway**: Supports WebSocket connections
- **Heroku**: With WebSocket support enabled
- **AWS EC2/ECS**: Full control over the environment
- **DigitalOcean App Platform**: Supports WebSocket

**Frontend Options:**
- **Vercel**: For the React app (update `VITE_CHAT_SERVER_URL` to point to your backend)
- **Netlify**: Alternative static hosting
- **CloudFlare Pages**: Fast global CDN

**Example Railway Deployment:**

1. Backend:
```bash
cd backend
railway login
railway init
railway add
railway up
```

2. Frontend on Vercel:
```bash
# Update .env with your Railway backend URL
VITE_CHAT_SERVER_URL=https://your-backend.railway.app
vercel --prod
```

## 🎯 Usage Guide

### 1. Search by Transaction

- Enter a transaction hash in the search bar
- View all transfer paths that occurred in that transaction
- Each path is visualized as a Sankey diagram showing token flows

### 2. Search by Address

- Enter an address to see all transfers involving it
- View incoming and outgoing transfers
- Click on any transfer to see its detailed visualization

### 3. Using the AI Assistant

- Click the chat icon or navigate to `/chat`
- Ask questions in natural language:
  - "Show me circular transfers from the last week"
  - "Find all transfers for address 0x..."
  - "Who trusts address 0x...?"
  - "What are the recent multi-hop transfers?"

The AI will translate your query to GraphQL and fetch relevant data.

## 🔧 Component Architecture

### Frontend Components

- **Search Components**: Handle user input and search type selection
- **Path Components**: Display transfer paths with filtering and pagination
- **Visualization Components**: Render Sankey diagrams and provide export functionality
- **Chat Components**: Full-featured chat interface with markdown support
- **Common Components**: Reusable UI elements (loading, errors, pagination)

### Backend Services

- **ChatSession**: Manages individual chat sessions with message history
- **MCPClient**: Handles connection to The Graph's MCP endpoint
- **OpenAIService**: Converts natural language to GraphQL queries

### Data Flow

1. User enters query (search or chat)
2. Frontend sends request to appropriate endpoint
3. For chat: Backend processes with OpenAI, generates GraphQL query
4. MCP client executes query against subgraph
5. Results are processed and returned to frontend
6. Frontend renders visualization or chat response

## 🛠️ Advanced Configuration

### Customizing the Subgraph

Update the subgraph configuration in:
- Frontend: `VITE_SUBGRAPH_ID` and `VITE_SUBGRAPH_KEY`
- Backend: `SUBGRAPH_ID` in `.env`

### Adjusting AI Model

Change the OpenAI model in backend `.env`:
```env
OPENAI_MODEL=gpt4.1-nano 
```

### Visualization Settings

Modify Sankey diagram appearance in:
- `src/services/sankey/colorScheme.ts` - Token colors
- `src/styles/echarts-theme.ts` - Chart theme

## 🔍 Understanding the Circles V2 Network

### Transfer Paths

A transfer path represents the complete flow of tokens from an original sender to a final recipient. In Circles V2:

- **Direct Transfers**: Simple A → B transfers
- **Multi-hop Transfers**: A → B → C → D, where trust relationships enable the flow
- **Circular Transfers**: Paths where the final recipient is also the original sender

### Trust Networks

The Circles system is built on trust relationships:
- Users can trust other users' tokens
- This creates a network where tokens can flow through trusted paths
- Multi-hop transfers leverage these trust relationships

### Avatar Types

Three types of participants in the network:
- **👤 Human**: Individual users
- **👥 Group**: Collective entities
- **🏢 Organization**: Institutional participants


## 📄 License

This project is licensed under the MIT License.
