# Contributing to Katax Core

Thank you for your interest in contributing to Katax Core! 🎉

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/katax-core.git
   cd katax-core
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run tests to ensure everything works:
   ```bash
   npm test
   npm run test:all
   ```

## Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Add tests for new features
4. Ensure all tests pass:
   ```bash
   npm run test:all
   npm run build
   ```
5. Commit with descriptive messages:
   ```bash
   git commit -m "feat: add new validation method"
   ```

## Pull Request Guidelines

- **Clear description** of what your PR does
- **Include tests** for new features
- **Update documentation** if needed
- **Keep PRs focused** - one feature per PR
- **Follow existing code style**

## Types of Contributions Welcome

- 🐛 Bug fixes
- ✨ New validation schemas
- 📚 Documentation improvements
- 🧪 Additional test cases
- 🚀 Performance improvements
- 💡 API enhancements

## Code Style

- Use TypeScript
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Ensure type safety

## Questions?

Feel free to open an issue for discussion before working on large features!