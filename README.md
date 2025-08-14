# Validate Content App

A React application that uses the Kontent.ai Custom App SDK to validate content items using the Management API validate endpoint. This app provides a comprehensive interface for content editors and administrators to identify and resolve validation errors and warnings across their Kontent.ai project.

## Features

- **Content Validation**: Validate all content items in your Kontent.ai project
- **Real-time Progress**: Track validation progress with visual indicators
- **Error & Warning Display**: Clear presentation of validation issues with detailed information
- **Search & Filtering**: Find specific content items or filter by validation status
- **Direct Links**: Quick access to view and edit content items directly in Kontent.ai
- **Responsive Design**: Modern UI built with Tailwind CSS that works on all devices
- **Custom App Ready**: Automatically detects when running within Kontent.ai platform

## Technology Stack

- **React 18+** - Latest React with modern hooks and features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for modern UI
- **Zustand** - Lightweight state management
- **Kontent.ai SDKs** - Management and Delivery APIs
- **Lucide React** - Beautiful, consistent icon library

## Prerequisites

- Node.js 18+ (latest LTS recommended)
- npm, yarn, or pnpm package manager
- Kontent.ai project with Management API access
- Valid API keys for your project

## Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd validate-content-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Kontent.ai Configuration
   VITE_KONTENT_PROJECT_ID=your_project_id_here
   VITE_KONTENT_ENVIRONMENT_ID=your_environment_id_here
   VITE_KONTENT_MANAGEMENT_API_KEY=your_management_api_key_here
   VITE_KONTENT_DELIVERY_API_KEY=your_delivery_api_key_here
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` to view the application.

## Configuration

### Environment Variables

| Variable                          | Description                                | Required |
| --------------------------------- | ------------------------------------------ | -------- |
| `VITE_KONTENT_PROJECT_ID`         | Your Kontent.ai project identifier         | Yes      |
| `VITE_KONTENT_ENVIRONMENT_ID`     | Environment ID (e.g., production, staging) | Yes      |
| `VITE_KONTENT_MANAGEMENT_API_KEY` | Management API key for content operations  | Yes      |
| `VITE_KONTENT_DELIVERY_API_KEY`   | Delivery API key for content retrieval     | Yes      |

### Custom App Configuration

When running as a Custom App within Kontent.ai, the application automatically detects the platform environment and retrieves configuration from the platform. No manual configuration is required in this mode.

## Usage

### Starting Validation

1. Click the **"Start Validation"** button to begin validating all content items
2. Monitor progress through the progress bar and status indicators
3. View real-time results as validation completes

### Understanding Results

- **Valid Items**: Content items with no errors or warnings
- **Items with Errors**: Content items that have validation errors (must be fixed)
- **Items with Warnings**: Content items with validation warnings (should be reviewed)

### Filtering and Search

- Use the search bar to find specific content items by name or content type
- Apply status filters to focus on specific validation states
- Toggle between showing only errors or warnings

### Taking Action

- Click on any validation result to expand and see detailed information
- Use the **"View Item"** button to open the content item in Kontent.ai
- Use the **"Edit Item"** button to directly edit the content item

## Building for Production

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Preview the build**

   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder** to your hosting provider

## Custom App Deployment

To deploy as a Kontent.ai Custom App:

1. Build the application: `npm run build`
2. Upload the `dist` folder contents to your Custom App hosting
3. Configure the Custom App in your Kontent.ai project
4. The app will automatically detect the Custom App environment

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Application header
│   ├── ValidationControls.jsx  # Validation start/stop controls
│   ├── ProgressBar.jsx # Validation progress indicator
│   ├── ValidationResults.jsx   # Results display and filtering
│   ├── ValidationResultItem.jsx # Individual result item
│   └── ErrorBoundary.jsx       # Error handling
├── config/             # Configuration files
│   └── kontent.js      # Kontent.ai configuration
├── services/           # Business logic
│   └── kontentService.js # Kontent.ai API service
├── store/              # State management
│   └── validationStore.js # Zustand store
├── App.jsx             # Main application component
└── index.css           # Global styles and Tailwind imports
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## Troubleshooting

### Common Issues

1. **"Failed to initialize Kontent.ai service"**

   - Check your environment variables are correctly set
   - Verify your API keys have the necessary permissions
   - Ensure your project ID and environment ID are correct

2. **"Missing required Kontent.ai configuration"**

   - Verify all required environment variables are present
   - Check for typos in your `.env` file
   - Restart your development server after changing environment variables

3. **Validation errors not appearing**
   - Check browser console for JavaScript errors
   - Verify your Management API key has validation permissions
   - Ensure content items exist in your project

### Debug Mode

In development mode, the application provides detailed error information and logging. Check the browser console for additional debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Check the troubleshooting section above
- Review Kontent.ai documentation
- Open an issue in the repository

## Changelog

### Version 1.0.0

- Initial release
- Content validation functionality
- Modern React UI with Tailwind CSS
- Kontent.ai Custom App integration
- Real-time validation progress
- Comprehensive error and warning display
