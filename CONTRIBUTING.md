# Contributing to Golf Scorecard

Thank you for your interest in contributing!

## Getting Started with GitHub Codespaces

The fastest way to start developing is with GitHub Codespaces:

1. Fork this repository
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for the environment to set up (~2 minutes)
4. Start developing!

### Running the App

```bash
cd golf-scorecard
npm run web
```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates

### Making Changes

1. Create a new branch from `main`
2. Make your changes
3. Run type checking: `npm run typecheck`
4. Test in the web browser: `npm run web`
5. Submit a pull request

### Code Style

- TypeScript is required
- Use functional components with hooks
- Follow existing code patterns
- Use NativeWind/TailwindCSS for styling

## Project Structure

```
golf-scorecard/
├── App.tsx           # App entry point
├── src/
│   ├── db/           # SQLite database layer
│   │   ├── db.ts     # Database connection
│   │   ├── schema.ts # Table definitions
│   │   ├── repo.ts   # Data access layer
│   │   └── types.ts  # TypeScript types
│   ├── input/        # User input handling
│   │   ├── voice.ts  # Voice recognition
│   │   └── parseLine.ts # Input parsing
│   ├── screens/      # Screen components
│   └── ui/           # Reusable UI components
```

## Testing

Currently testing is manual. Run the web version and verify your changes work correctly.

## Questions?

Open an issue for discussion!

