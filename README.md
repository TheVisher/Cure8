# Cure8 - Smart Health Platform

Cure8 is a modern web application for organizing and managing health resources efficiently. Built with a beautiful glassmorphism design and responsive CSS Grid layout.

## Features

- **Smart Health Resource Management**: Organize your medical resources, articles, and health-related content
- **Beautiful Glassmorphism UI**: Modern design with glass-like effects and smooth animations
- **Responsive Grid Layout**: CSS Grid-based layout that adapts to any screen size
- **Search Functionality**: Quickly find your health resources
- **Category Organization**: Organize resources into custom categories
- **Local Storage**: All data is stored locally in your browser
- **Thumbnail Generation**: Automatic thumbnail generation for health resources

## Getting Started

### Prerequisites

- A modern web browser
- Python 3 (for local development server)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cure8.git
cd cure8
```

2. Start the local development server:
```bash
cd visual-bookmarks
python3 -m http.server 8000
```

3. Open your browser and navigate to `http://localhost:8000`

### Using npm (Alternative)

You can also use npm to start the development server:

```bash
npm start
```

## Usage

1. **Adding Health Resources**: Click the "+" button to add new health resources
2. **Organizing**: Use categories to organize your resources
3. **Searching**: Use the search bar to quickly find specific resources
4. **Managing**: Delete resources with the delete button (with undo functionality)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Layout**: CSS Grid
- **Styling**: Custom CSS with glassmorphism effects
- **Storage**: Local Storage API
- **Icons**: Favicon integration with Google's favicon service

## Project Structure

```
cure8/
├── visual-bookmarks/
│   ├── index.html          # Main HTML file
│   ├── style.css           # All styles and glassmorphism effects
│   ├── app.js              # Main application logic
│   ├── package.json        # Project dependencies
│   └── node_modules/       # Dependencies
├── public/                 # React app public files
├── src/                    # React app source files
├── package.json            # Root package.json
└── README.md               # This file
```

## Customization

### Adding New Categories

Categories can be added through the sidebar interface. The system supports unlimited categories.

### Styling

The application uses a modular CSS approach with glassmorphism effects. Key styling files:
- `style.css`: Main stylesheet with glassmorphism effects
- CSS Grid layout for responsive design
- Custom animations and transitions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support, email support@cure8s.com or visit our website at [https://cure8s.com](https://cure8s.com).

## Roadmap

- [ ] User authentication
- [ ] Cloud synchronization
- [ ] Mobile app
- [ ] Advanced search filters
- [ ] Resource sharing
- [ ] API integration with health services

---

**Cure8** - Organizing health resources for a better tomorrow.