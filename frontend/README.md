# Todo Frontend Application

A modern, responsive frontend application for the Todo system built with vanilla JavaScript, featuring authentication, todo management, and a clean user interface.

## Features

- **Authentication System**

  - User login and registration
  - JWT token-based authentication
  - Protected routes
  - Auto-redirect based on auth status

- **Todo Management**

  - Create, read, update, and delete todos
  - Mark todos as complete/incomplete
  - Filter todos (all, pending, completed)
  - Real-time updates with optimistic UI
  - Inline editing

- **User Experience**

  - Responsive design (mobile-first)
  - Loading states and error handling
  - Form validation
  - Keyboard shortcuts
  - Offline detection

- **Modern UI**
  - Clean, minimalist design
  - CSS Grid and Flexbox layouts
  - Smooth animations and transitions
  - Accessible components

## Project Structure

```
frontend/
├── index.html              # Main HTML file
├── css/
│   ├── main.css           # Global styles and variables
│   ├── auth.css           # Authentication page styles
│   ├── todo.css           # Todo management styles
│   └── components.css     # Reusable component styles
├── js/
│   ├── main.js            # Application entry point
│   ├── auth.js            # Authentication logic
│   ├── todo.js            # Todo management logic
│   ├── api.js             # API communication
│   ├── router.js          # Routing system
│   └── utils.js           # Utility functions
├── assets/
│   └── images/            # Static assets
├── package.json           # Project configuration
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running on `http://localhost:3000`
- Python 3 (for local development server)

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Start the development server:

   ```bash
   npm start
   # or
   python3 -m http.server 8080
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

### Alternative Setup

You can also serve the files using any static file server:

- **Node.js**: `npx serve . -p 8080`
- **PHP**: `php -S localhost:8080`
- **Live Server** (VS Code extension)

## Usage

### Authentication

1. **Registration**: Create a new account with username, email, and password
2. **Login**: Sign in with your email and password
3. **Auto-redirect**: Authenticated users are automatically redirected to the todos page

### Todo Management

1. **Create Todo**: Enter a title and optional description, then click "Add Todo"
2. **View Todos**: See all your todos with creation dates
3. **Filter**: Use the filter buttons to view all, pending, or completed todos
4. **Edit**: Click the edit button to modify todo title and description
5. **Complete**: Click the checkbox to mark todos as complete/incomplete
6. **Delete**: Click the delete button to remove todos (with confirmation)

### Keyboard Shortcuts

- `Escape`: Close error/success messages
- `Ctrl/Cmd + K`: Focus search (if implemented)

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`:

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/verify` - Token verification
- `POST /auth/logout` - User logout

### Todo Endpoints

- `GET /todos` - Get user's todos
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Code Organization

- **Modular Architecture**: Each feature is organized into separate modules
- **Event-Driven**: Uses event listeners for user interactions
- **State Management**: Centralized state management with local storage
- **Error Handling**: Comprehensive error handling with user feedback

### Key Classes

- `TodoApp`: Main application controller
- `AuthManager`: Handles authentication logic
- `TodoManager`: Manages todo CRUD operations
- `ApiClient`: Handles API communication
- `Router`: Manages client-side routing

### Styling

- **CSS Variables**: Consistent theming with CSS custom properties
- **Mobile-First**: Responsive design starting from mobile
- **Component-Based**: Reusable CSS components
- **Accessibility**: ARIA labels and keyboard navigation

## Configuration

### API Base URL

To change the API base URL, modify the `baseURL` in `js/api.js`:

```javascript
const api = new ApiClient("http://your-api-url/api");
```

### Styling

Customize the color scheme by modifying CSS variables in `css/main.css`:

```css
:root {
  --primary-color: #007bff;
  --success-color: #28a745;
  --danger-color: #dc3545;
  /* ... other variables */
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from the frontend origin
2. **API Connection**: Verify the backend is running on the correct port
3. **Authentication**: Check that JWT tokens are being stored and sent correctly
4. **Styling Issues**: Clear browser cache if styles aren't loading

### Debug Mode

Open browser developer tools and check the console for error messages. The app provides detailed error logging for debugging.

## Performance

- **Optimized Loading**: Minimal initial bundle size
- **Efficient DOM Updates**: Uses document fragments for bulk updates
- **Lazy Loading**: Non-critical components loaded on demand
- **Caching**: Local storage for user data and preferences

## Security

- **XSS Prevention**: HTML escaping for user input
- **Token Storage**: Secure token handling in localStorage
- **Input Validation**: Client-side validation with server-side verification
- **HTTPS Ready**: Works with HTTPS in production

## Contributing

1. Follow the existing code style and structure
2. Add comments for complex logic
3. Test in multiple browsers
4. Ensure responsive design works on all screen sizes

## License

MIT License - see LICENSE file for details.
