# Circles Path Visualizer

A web application for exploring and visualizing token transfer paths in the Circles V2 network. Built with React, TypeScript, and ECharts.

## Features

- **Transaction Analysis**: Visualize all transfer paths within a single transaction
- **Address Explorer**: Track all incoming and outgoing transfers for any address
- **Interactive Sankey Diagrams**: Understand complex multi-hop transfers
- **Path Details**: See detailed breakdowns of each transfer hop
- **Export Functionality**: Export visualizations as PNG/SVG or data as JSON
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js 16+ and npm/yarn
- A Circles V2 subgraph endpoint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/circles-path-viz.git
cd circles-path-viz
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your subgraph URL:
```
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/circles-v-2-hub/version/latest
VITE_BLOCK_EXPLORER_URL=https://gnosisscan.io
```

## Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

The app will be available at http://localhost:3000

## Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Usage

### Search by Transaction Hash

1. Enter a transaction hash in the search bar
2. Select "Transaction" search type
3. View all transfer paths that occurred in that transaction
4. Each path is visualized as a Sankey diagram showing the flow of tokens

### Search by Address

1. Enter an address in the search bar
2. Select "Address" search type
3. Browse through all transfers involving that address
4. Click "View" on any transfer to see its visualization

### Understanding the Visualizations

- **Purple nodes**: Original sender
- **Green nodes**: Final recipient
- **Yellow indicators**: Circular transfers
- **Node colors**: Based on avatar type (Human, Group, Organization)
- **Flow colors**: Unique color per token
- **Flow width**: Proportional to transfer amount

## Tech Stack

- **Frontend**: React, TypeScript
- **Routing**: React Router
- **State Management**: React hooks and context
- **Data Fetching**: Apollo Client (GraphQL)
- **Visualization**: ECharts
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the Circles V2 ecosystem
- Subgraph data provided by The Graph Protocol