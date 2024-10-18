# Peer Protocol

Peer Protocol is a decentralized peer-to-peer lending platform built on Starknet, enabling transparent and efficient borrowing and lending of digital assets.


## Overview

Peer Protocol facilitates direct lending between users through:
- Creation and management of loan proposals
- Customizable interest rates and loan terms
- Counter-proposal mechanisms
- Transparent transaction history
- Real-time market analytics

### Key Features
- **Direct P2P Lending**: Connect borrowers and lenders without intermediaries
- **Flexible Terms**: Customizable loan amounts, durations, and interest rates
- **Counter Proposals**: Negotiate terms through counter-proposals
- **Market Analytics**: Real-time data on lending trends and rates
- **Wallet Integration**: Seamless connection with Starknet-compatible wallets
- **Dark/Light Mode**: User-friendly interface with theme options

## Getting Started

### Prerequisites
- Node.js (v18.20.4 or later)
- npm 
- Git
- A Starknet wallet (like Argent X or Braavos)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Dprof-in-tech/peer-on-strk.git
cd peer-on-strk
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev

```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production
```bash
npm run build
```

## Contributing to Peer Protocol

We welcome contributions from the community! Here's how you can help make Peer Protocol better.

### Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (see CODE_OF_CONDUCT.md).

### How to Contribute

1. **Fork the Repository**
   - Click the 'Fork' button on GitHub
   - Clone your fork locally
   ```bash
   git clone https://github.com/your-username/peer-on-strk.git
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

3. **Make Your Changes**
   - Follow the coding style guidelines
   - Write clear, concise commit messages
   - Add tests if applicable
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run test
   # and
   npm run lint
   ```

5. **Submit a Pull Request**
   - Push your changes to your fork
   - Create a Pull Request from your fork to our main repository
   - Fill out the PR template with all relevant information

### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain your changes and their impact
- **Issue Reference**: Link any related issues
- **Screenshots**: Include for UI changes
- **Tests**: Add/update as needed

### Development Guidelines

#### Code Style
- Use TypeScript for type safety
- Follow existing code formatting (Prettier configuration)
- Use meaningful variable and function names
- Keep components small and focused
- Comment complex logic

#### Component Structure
```typescript
// Use TypeScript interfaces
interface ComponentProps {
  prop1: string;
  prop2: number;
}

// Functional components with clear typing
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Implementation
};
```

#### State Management
- Use React hooks appropriately
- Keep state as local as possible
- Document complex state interactions

#### Commit Messages
Follow conventional commits:
```
feat: add new borrower dashboard
fix: correct interest rate calculation
docs: update setup instructions
```

### What We're Looking For

- Bug fixex
- Feature implementations
- Documentation improvements
- Performance optimizations
- UI/UX enhancements
- Test coverage improvements

### Getting Help

- Check existing issues and discussions
- Join our Discord / Telegram community
- Read the documentation
- Reach out to maintainers

## Project Structure

```
peer-protocol/app
├── components/         # Reusable React components
├── public/            # Static assets
├── app/              # The main peer protocol app
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you need help or have questions:
- Open an issue
- Join our Discord server / Telegram Channel
- Email us at peerprotocol.protonmail.com

---

Thank you for considering contributing to Peer Protocol! Together we can build a more accessible and efficient lending platform for everyone.
