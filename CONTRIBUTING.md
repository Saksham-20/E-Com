# Contributing to E-Commerce Project

Thank you for your interest in contributing to our e-commerce project! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Git Workflow](#git-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Code Review Process](#code-review-process)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 16+ installed
- MySQL 8.0+ or compatible database
- Git for version control
- A code editor (VS Code recommended)
- Basic knowledge of React, Node.js, and MySQL

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ecom.git
   cd ecom
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/original-owner/ecom.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Environment Configuration

```bash
# Copy environment files
cp .env.example .env
cp client/.env.example client/.env

# Configure your environment variables
# See .env.example for required variables
```

### 3. Database Setup

```bash
# Navigate to server directory
cd server

# Run database setup
npm run db:setup

# Seed initial data (optional)
npm run db:seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend development server
cd client
npm start
```

## Code Style Guidelines

### JavaScript/React

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications:

#### General Rules

- Use ES6+ features when possible
- Prefer `const` and `let` over `var`
- Use arrow functions for callbacks
- Use template literals for string concatenation
- Use destructuring for objects and arrays

#### React Components

```javascript
// ✅ Good
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MyComponent = ({ title, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <div className="my-component">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

MyComponent.defaultProps = {
  children: null,
};

export default MyComponent;
```

#### Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard`, `UserProfile`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables/Functions**: camelCase (e.g., `getUserData`, `isValidEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_FILE_SIZE`)
- **CSS Classes**: kebab-case (e.g., `product-card`, `user-profile`)

### CSS/Styling

- Use Tailwind CSS utility classes when possible
- Follow BEM methodology for custom CSS
- Use CSS variables for consistent theming
- Ensure responsive design for all components

### Database/SQL

- Use descriptive table and column names
- Follow snake_case for database objects
- Include proper indexes for performance
- Use transactions for multi-table operations

## Git Workflow

### Branch Naming

Use descriptive branch names following this pattern:

```
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
docs/documentation-update
refactor/component-name
```

Examples:
- `feature/user-authentication`
- `bugfix/cart-total-calculation`
- `hotfix/payment-processing-error`
- `docs/api-endpoints`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

feat(auth): add JWT token refresh functionality
fix(cart): resolve duplicate items in cart
docs(api): update authentication endpoints
style(ui): improve button component styling
refactor(products): optimize database queries
test(orders): add unit tests for order service
chore(deps): update dependencies to latest versions
```

### Pull Request Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat(component): add new feature description"
   ```

3. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your feature branch
   - Fill out the PR template
   - Submit for review

5. **Keep Branch Updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Testing Guidelines

### Frontend Testing

- Write unit tests for all components using Jest and React Testing Library
- Test user interactions and component behavior
- Ensure accessibility standards are met
- Test responsive design across different screen sizes

```javascript
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  it('displays product information correctly', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 29.99,
      image: 'test-image.jpg'
    };

    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockOnAddToCart = jest.fn();
    const product = { id: 1, name: 'Test Product', price: 29.99 };

    render(<ProductCard product={product} onAddToCart={mockOnAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockOnAddToCart).toHaveBeenCalledWith(product);
  });
});
```

### Backend Testing

- Write unit tests for all services and controllers
- Test API endpoints with different input scenarios
- Mock external dependencies (Stripe, email services)
- Test error handling and edge cases

```javascript
// Example test
const request = require('supertest');
const app = require('../app');
const { setupTestDB } = require('./testUtils');

describe('Product API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  describe('GET /api/products', () => {
    it('returns list of products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('applies pagination correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=2&limit=5')
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(5);
    });
  });
});
```

### Test Coverage

- Aim for at least 80% test coverage
- Focus on critical business logic
- Test error scenarios and edge cases
- Run tests before submitting PRs

## Pull Request Process

### PR Template

Use the provided PR template and fill out all sections:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented code
```

### Review Process

1. **Self-Review**: Review your own code before submitting
2. **Code Review**: Address feedback from maintainers
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update relevant documentation
5. **Merge**: PR will be merged after approval

## Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Description**: Clear description of the problem
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable
- **Console Logs**: Any error messages

### Feature Requests

For feature requests, include:

- **Description**: What you'd like to see
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: How you think it should work
- **Alternatives**: Any alternatives you've considered

## Code Review Process

### What We Look For

- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?
- **Testing**: Are there adequate tests?
- **Documentation**: Is the code well-documented?

### Review Guidelines

- Be constructive and respectful
- Focus on the code, not the person
- Suggest improvements when possible
- Ask questions to understand the code better
- Provide specific feedback

## Documentation

### Code Documentation

- Use JSDoc for function documentation
- Include examples for complex functions
- Document API endpoints with clear examples
- Keep README files updated

```javascript
/**
 * Calculates the total price of items in the cart
 * @param {Array} items - Array of cart items
 * @param {Object} options - Calculation options
 * @param {boolean} options.includeTax - Whether to include tax
 * @param {number} options.taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns {number} Total price
 * @example
 * const total = calculateCartTotal(cartItems, { includeTax: true, taxRate: 0.08 });
 */
const calculateCartTotal = (items, options = {}) => {
  // Implementation
};
```

### API Documentation

- Document all endpoints with examples
- Include request/response schemas
- Document error codes and messages
- Keep API documentation in sync with code

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and open to feedback
- Focus on what is best for the community
- Show empathy towards other community members

### Communication

- Use clear and respectful language
- Ask questions when you need clarification
- Provide constructive feedback
- Be patient with new contributors
- Use appropriate channels for different types of communication

### Getting Help

If you need help:

1. Check existing documentation
2. Search existing issues and PRs
3. Ask questions in discussions
4. Reach out to maintainers directly
5. Join community channels if available

## Recognition

### Contributors

All contributors will be recognized in:

- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors page

### Types of Contributions

We welcome various types of contributions:

- **Code**: Bug fixes, new features, improvements
- **Documentation**: README updates, API docs, tutorials
- **Testing**: Test cases, bug reports, testing tools
- **Design**: UI/UX improvements, accessibility
- **Community**: Helping others, organizing events
- **Infrastructure**: CI/CD, deployment, monitoring

## Getting Started with Your First Contribution

1. **Choose an Issue**: Look for issues labeled "good first issue" or "help wanted"
2. **Fork and Clone**: Follow the setup instructions above
3. **Make Changes**: Implement your solution
4. **Test**: Ensure your changes work correctly
5. **Submit PR**: Create a pull request following the guidelines
6. **Iterate**: Address feedback and make improvements

## Questions?

If you have questions about contributing:

- Open a discussion on GitHub
- Create an issue for general questions
- Reach out to maintainers directly
- Check existing documentation

Thank you for contributing to our e-commerce project! Your contributions help make this project better for everyone.
