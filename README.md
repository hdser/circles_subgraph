# Circles Path Explorer & Subgraph

This repository contains two main components: a **Circles V2 Subgraph** for indexing data from the Circles V2 protocol and a **Circles Path Explorer**, a visualization tool that consumes data from the subgraph to display information about Circles paths.

This project provides a solution for exploring and understanding the flow in Circles network on the Gnosis chain. The `circles-v-2-hub` is included as a **Git submodule**, allowing the two parts of the project to be developed independently while being tracked in this central repository.

-----

## 🏛️ Architecture Overview

The system is composed of three main parts: the **Frontend**, a **Backend bridge**, and the **Subgraph** on The Graph Protocol.

```
+----------------+      +---------------------+      +------------------------+
|                |      |                     |      |                        |
|    Browser     +------>      Backend        +------>       MCP Server       |
| (React App)    |      |   (Node.js/Express) |      | (The Graph Protocol)   |
|                |      |                     |      |                        |
+----------------+      +---------------------+      +------------------------+
                                                            |
                                                            | GraphQL
                                                            v
                                                     +----------------+
                                                     |                |
                                                     |    Subgraph    |
                                                     |  (Indexer)     |
                                                     |                |
                                                     +----------------+
                                                            |
                                                            | Indexes
                                                            v
                                                     +----------------+
                                                     |                |
                                                     | Gnosis Chain   |
                                                     | (Smart Contracts) |
                                                     +----------------+
```

-----

## 🎨 Circles Path Explorer (Frontend)

The Circles Path Explorer is a modern, responsive web application built with React and TypeScript. It provides a user-friendly interface for visualizing and exploring the paths of Circles transfers between different accounts. Users can search for specific addresses or transaction hashes to see detailed information about the flow of Circles.

### Application Structure

  * **`src/components/`**: A collection of reusable React components that make up the user interface.
  * **`src/hooks/`**: Custom React hooks that encapsulate the logic for fetching and managing data from the subgraph.
  * **`src/pages/`**: The main pages of the application, such as the home page and the detailed views for addresses and transactions.
  * **`src/services/`**: Contains the GraphQL client and queries for interacting with the subgraph.
  * **`src/utils/`**: Utility functions for formatting data, defining constants, and other helper logic.

### Frontend Data Flow:

```
1. User Interaction (e.g., enters address)
   |
   v
2. React Component (e.g., AddressView.tsx)
   |
   v
3. Custom Hook (e.g., usePathsByAddress)
   |
   v
4. Apollo Client (executes GraphQL query)
   |
   v
5. Subgraph (via Backend/MCP)
   |
   v
6. Data is returned and rendered in components
```

-----

## 🌉 Backend: MCP Bridge

The backend is a Node.js application that serves as a secure bridge between the frontend and the MCP server.

### AI Chat Data Flow:

```
+----------+           +-----------+           +-------------+         +----------+
|          |  Message  |           |  Generate   |             |  Execute  |          |
| Frontend +-----------> Backend   +-------------> OpenAI        |  Query    | Subgraph |
|          |           | (Node.js) |             | (GraphQL)   |           |          |
+----------+           +-----+-----+           +------+------+         +----+-----+
                             |                        ^                     |
                             |                        |                     |
                             +------------------------+---------------------+
                                       MCP Client
```

1.  **User sends a message** to the chat interface on the frontend.
2.  The message is sent to the **backend** via a WebSocket connection.
3.  The backend's `OpenAIService` sends the user's message to the **OpenAI API** to be converted into a GraphQL query.
4.  The `MCPClient` on the backend executes the generated query against the **Subgraph** through the MCP server.
5.  The results from the subgraph are returned to the `OpenAIService` to be formatted into a human-readable response.
6.  The formatted response is sent back to the frontend and displayed to the user.

-----

## 🏛️ Circles V2 Subgraph (Submodule)

The subgraph is a custom data indexing solution built using The Graph Protocol. It listens to events emitted by the Circles V2 smart contracts and stores this data in a structured and easily queryable format. This allows the frontend application to efficiently retrieve complex data about user balances, trust relationships, and transfers.

### Key Files

  * **`subgraph.yaml`**: The main configuration file that defines which smart contracts to listen to, which events to track, and how to map that data to the schema.
  * **`schema.graphql`**: Defines the data schema for the subgraph, including the structure of entities such as Avatars, Trusts, and Transfers.
  * **`src/`**: Contains the AssemblyScript code that handles the business logic for transforming event data from the smart contracts into the entities defined in the schema.

### Path Reconstruction Logic:

A key feature of the subgraph is its ability to reconstruct transfer paths from `StreamCompleted` events.

```
1. "StreamCompleted" event is emitted from the Hub contract
   |
   v
2. The `handleStreamCompleted` function is triggered in `src/hub.ts`
   |
   v
3. `reconstructPathFromStreamCompleted` is called
   |
   v
4. All "TransferSingle" and "TransferBatch" events from the same transaction are loaded
   |
   v
5. A flow network is built from the transfers
   |
   v
6. The `findAllPaths` function decomposes the flow to identify individual transfer paths
   |
   v
7. "TransferPath" and "TransferHop" entities are created and saved to the subgraph
```

This process allows the frontend to query for fully formed transfer paths, even for complex, multi-hop transactions.

-----

## 🚀 Getting Started

To get the project up and running on your local machine, follow these steps.

### Prerequisites

  * Node.js
  * Yarn
  * Docker

### Installation & Setup

Because this repository uses Git submodules, you must use a special clone command to get all the necessary code.

**1. Clone the Repository and Submodule**

Run the following command to clone the main repository and automatically initialize and update the `circles-v-2-hub` submodule.

```bash
git clone --recurse-submodules <repository-url>
cd <repository-directory>
```

If you have already cloned the repository without the `--recurse-submodules` flag, you can initialize the submodule manually:

```bash
# Run this from the root of the repository
git submodule update --init --recursive
```

**2. Install Dependencies for Both Projects**

```bash
# For the subgraph
cd circles-v-2-hub
yarn install

# For the frontend
cd ../circles-path-explorer
yarn install
```

**3. Run the Subgraph Locally**

```bash
# Navigate back to the subgraph directory
cd ../circles-v-2-hub
docker-compose up
```

**4. Start the Frontend Development Server**

```bash
# Navigate to the frontend directory
cd ../circles-path-explorer
yarn dev
```

You should now be able to access the Circles Path Explorer in your browser at `http://localhost:5173`.

-----

### Working with Submodules

A submodule is a separate Git repository tracked within a parent repository. This allows you to include and manage an external project as part of your own.

  * **Pulling Updates**: To update the `circles-v-2-hub` submodule to its latest version from its own repository, run:
    ```bash
    git submodule update --remote --merge
    ```
  * **Making Changes**: If you make changes inside the `circles-v-2-hub` directory, you must commit and push those changes from within that directory, as it's a separate repository. Afterward, you will need to create a new commit in the parent repository to track the updated submodule version.

-----

## ✨ Features

  * **Address and Transaction Search**: Look up Circles paths by a specific user address or a transaction hash.
  * **Interactive Sankey Diagrams**: Visualize the flow of Circles through different paths with intuitive and interactive Sankey diagrams.
  * **Detailed Path Information**: Get detailed information about each hop in a path, including the sender, receiver, and amount.
  * **Responsive Design**: The application is designed to be fully responsive and accessible on a wide range of devices.

-----

## 🛠️ Technologies Used

  * **Subgraph**:
      * The Graph Protocol
      * AssemblyScript
      * GraphQL
  * **Frontend**:
      * React
      * TypeScript
      * Vite
      * Tailwind CSS
      * ECharts for Apache