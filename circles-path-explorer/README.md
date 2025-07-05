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
OPENAI_MODEL=gpt-4-turbo-preview  # or gpt-3.5-turbo for faster/cheaper responses
```

### Visualization Settings

Modify Sankey diagram appearance in:
- `src/services/sankey/colorScheme.ts` - Token colors
- `src/styles/echarts-theme.ts` - Chart theme

## 🐛 Troubleshooting

### MCP Connection Issues

- Ensure `mcp-remote` is installed globally
- Verify your Graph API key is valid
- Check backend logs for connection status

### Chat Not Working

- Verify OpenAI API key is set correctly
- Check WebSocket connection in browser console
- Ensure backend is running on correct port

### No Data Showing

- Verify subgraph ID and key are correct
- Check Apollo Client network requests
- Ensure the subgraph is indexed and synced

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
