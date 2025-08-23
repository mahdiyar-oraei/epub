# EPUB Reader Application

A modern, feature-rich EPUB reader built with Next.js, TypeScript, and Tailwind CSS. This application provides a professional reading experience similar to iPad readers with extensive customization options.

## Features

### 🚀 Enhanced Reader Interface
- **Professional UI**: Clean, modern interface inspired by iPad readers
- **Responsive Design**: Optimized for all screen sizes and devices
- **Dark/Light Themes**: Multiple theme options including sepia and night modes
- **RTL Support**: Full right-to-left language support for Persian/Arabic content

### 📚 Reading Features
- **EPUB Support**: Full EPUB format support with proper parsing
- **Progress Tracking**: Automatic progress saving and restoration
- **Bookmarks**: Add, edit, and manage bookmarks with notes
- **Table of Contents**: Navigate between chapters easily
- **Search Functionality**: Full-text search within book content

### 🎨 Customization Options
- **Font Settings**: Adjustable font size (12px - 32px)
- **Font Families**: Serif, Sans-serif, and Monospace options
- **Line Height**: Customizable line spacing (1.2x - 2.5x)
- **Page Margins**: Adjustable margins (20px - 80px)
- **Page Width**: Narrow, standard, and wide layout options
- **Text Alignment**: Justified or right-aligned text
- **Hyphenation**: Optional automatic word breaking

### 🎯 Navigation & Controls
- **Floating Navigation**: Easy page navigation with floating buttons
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Touch Gestures**: Swipe and tap navigation for mobile devices
- **Progress Bar**: Visual progress indicator with chapter information
- **Quick Actions**: Fast access to common reader functions

### 🛠️ Toolbar Management
- **Flexible Positioning**: Move toolbar to top, bottom, or floating
- **Minimize Option**: Collapse toolbar for distraction-free reading
- **Hide/Show**: Toggle toolbar visibility
- **Customizable Layout**: Arrange controls according to preference

### 📱 User Experience
- **Auto-save Settings**: All preferences automatically saved per book
- **Export/Import**: Backup and restore reader settings
- **Responsive Panels**: Collapsible side panels for better space usage
- **Smooth Animations**: Professional transitions and micro-interactions

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate between pages |
| `Space` | Next page |
| `B` | Add bookmark |
| `T` | Toggle table of contents |
| `S` | Toggle search panel |
| `C` | Toggle settings panel |
| `ESC` | Close all panels |

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React icons
- **State Management**: React hooks and local storage
- **EPUB Parsing**: Custom EPUB parser implementation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd epub

# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://your-api-url/api/v1
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── reader/           # Reader pages
│   └── ...
├── components/            # React components
│   ├── reader/           # Reader-specific components
│   │   ├── EnhancedReader.tsx      # Main reader component
│   │   ├── FloatingNavigation.tsx  # Navigation controls
│   │   ├── TableOfContents.tsx     # Chapter navigation
│   │   ├── BookmarkPanel.tsx       # Bookmark management
│   │   ├── SearchPanel.tsx         # Search functionality
│   │   ├── SettingsPanel.tsx       # Reader settings
│   │   ├── ProgressBar.tsx         # Progress indicator
│   │   └── ReaderToolbar.tsx       # Main toolbar
│   └── ...
├── lib/                  # Utility libraries
│   ├── epub-parser.ts   # EPUB parsing logic
│   └── api.ts           # API client
└── types/               # TypeScript type definitions
```

## Component Architecture

### EnhancedReader
The main reader component that orchestrates all reader functionality:
- Manages reader state and settings
- Handles EPUB parsing and rendering
- Coordinates between different panels and tools
- Manages keyboard shortcuts and navigation

### FloatingNavigation
Provides floating navigation controls:
- Page navigation buttons (prev/next)
- Quick access to reader tools
- Expandable tools panel
- Keyboard shortcuts display

### ReaderToolbar
Main toolbar with comprehensive controls:
- Book information and progress
- Quick access to panels
- Settings controls
- Position and visibility options

### Side Panels
Collapsible panels for different functions:
- **TableOfContents**: Chapter navigation
- **BookmarkPanel**: Bookmark management
- **SearchPanel**: Full-text search
- **SettingsPanel**: Reader customization

## Customization

### Adding New Themes
To add a new theme, update the `getThemeColors` function in `EnhancedReader.tsx`:

```typescript
const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'your-theme':
      return { 
        background: '#your-color', 
        text: '#your-color',
        accent: '#your-color',
        muted: '#your-color',
        blockquote: '#your-color'
      };
    // ... existing themes
  }
};
```

### Adding New Fonts
To add new font families, update the `getFontFamily` function:

```typescript
const getFontFamily = (family: string) => {
  switch (family) {
    case 'your-font':
      return 'Your Font Name, fallback';
    // ... existing fonts
  }
};
```

## Performance Features

- **Lazy Loading**: Components load only when needed
- **Debounced Search**: Search queries are debounced for better performance
- **Efficient Rendering**: Optimized re-renders using React.memo and useCallback
- **Local Storage**: Settings and progress cached locally
- **Progressive Enhancement**: Core functionality works without JavaScript

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: CSS Grid, Flexbox, CSS Custom Properties, ES2020+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
