# Dubai Market Analysis AI Tool

A comprehensive real estate market analysis tool for Dubai. This application provides in-depth analysis of property markets, developer history, demographic data, price forecasts, and infrastructure impact.

## Features

- **Property Lookup**: Search properties by location and get detailed information about property types, prices, and amenities.
- **Developer Analysis**: Analyze developers' track records, including historical projects, sold prices, current projects, and future plans.
- **Demographic & Population Analysis**: Access population statistics and demographic information, including high-net-worth individuals and growth trends.
- **Dynamic Price Forecast**: Generate price predictions for properties at intervals of 6 months, 1 year, 2 years, 3 years, and 5 years.
- **Infrastructure & Future Projects**: View nearby upcoming projects and their estimated impact on property values.
- **Hugging Face Integration**: Get AI-powered property market insights using the Hugging Face API.

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Data Visualization**: Chart.js with react-chartjs-2
- **Maps**: Leaflet with react-leaflet
- **API Integration**: Axios

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dubai-market-analysis-tool.git
   ```

2. Navigate to the project directory:
   ```bash
   cd dubai-market-analysis-tool
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create a `.env.local` file in the root directory and add your API keys:
   ```
   # OpenAI API Key (required for all AI analysis features)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Hugging Face API Key (optional)
   NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   **For Windows PowerShell users:**
   If you encounter issues with command separators in PowerShell, use one of these methods instead:
   
   ```powershell
   # Option 1: Use semicolon instead of && in PowerShell
   cd dubai-market-analysis-tool; npm run dev
   
   # Option 2: Run commands separately
   cd dubai-market-analysis-tool
   npm run dev
   
   # Option 3: Use cmd.exe syntax
   cmd /c "cd dubai-market-analysis-tool && npm run dev"
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Property Lookup

Enter a location (e.g., "Dubai Marina") in the search bar on the property lookup page to get AI-powered market insights about property values, rental yields, and investment potential in that area.

### Detailed Analysis

Navigate to specific modules using the navigation bar to perform more detailed analysis:

- **Property Lookup**: Search for properties in a specific location and view detailed market insights.
- **Developer Analysis**: Select a developer to view their track record and project history.
- **Demographics**: Analyze population statistics and demographic information for a specific area.
- **Price Forecast**: Generate dynamic price forecasts based on various parameters.
- **Infrastructure**: View infrastructure projects and their impact on property values.

### API Integration

For AI-powered market insights, this application uses OpenAI's API. You must provide your OpenAI API key in the `.env.local` file for the application to function properly. You can also add a Hugging Face API key for additional features. If you don't provide the necessary API keys, some features may not work as expected.

## Data Source

Currently, the application uses a combination of AI-generated insights via the Hugging Face API and mock data for demonstration purposes. In a production environment, this would be enhanced with actual API calls to real estate databases and market data sources.

## Future Enhancements

- Integration with real property databases
- Machine learning model for more accurate price predictions
- Advanced visualization features with 3D maps
- Mobile application for on-the-go market analysis

## License

This project is licensed under the MIT License - see the LICENSE file for details.
