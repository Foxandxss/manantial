# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

# CI Error Guidelines

If the user wants help with fixing an error in their CI pipeline, use the following flow:
- Retrieve the list of current CI Pipeline Executions (CIPEs) using the `nx_cloud_cipe_details` tool
- If there are any errors, use the `nx_cloud_fix_cipe_failure` tool to retrieve the logs for a specific task
- Use the task logs to see what's wrong and help the user fix their problem. Use the appropriate tools if necessary
- Make sure that the problem is fixed by running the task that you passed into the `nx_cloud_fix_cipe_failure` tool


<!-- nx configuration end-->

# Project Overview

This is "Manantial", an Angular 20 application built with Nx 22. It's a standalone Angular application using Vite for builds and Vitest for testing.

# Development Commands

## Running the application
```bash
npx nx serve manantial        # Start dev server (uses @angular/build:dev-server)
npx nx serve-static manantial # Serve the production build statically
```

## Building
```bash
npx nx build manantial                    # Production build (default)
npx nx build manantial --configuration=development  # Development build
```
Output is in `dist/manantial`. Production builds use output hashing and have bundle budgets (500kb warning, 1mb error for initial bundles).

## Testing
```bash
npx nx test manantial           # Run all tests with Vitest
npx nx test manantial --watch   # Run tests in watch mode
```
Tests use Vitest with jsdom environment. Test setup file is at `src/test-setup.ts`. Coverage reports go to `coverage/manantial`.

## Linting
```bash
npx nx lint manantial   # Run ESLint
```

## Code Generation
```bash
npx nx g @nx/angular:app <name>     # Generate new application
npx nx g @nx/angular:lib <name>     # Generate new library
npx nx list                         # List available plugins
npx nx list <plugin-name>           # List generators for a plugin
```

# Architecture

## Technology Stack
- **Framework**: Angular 20.3.0 (standalone components)
- **Build Tool**: Vite 7 with @analogjs/vite-plugin-angular
- **Testing**: Vitest 3 with @analogjs/vitest-angular and jsdom
- **Monorepo Tool**: Nx 22.0.1
- **TypeScript**: 5.9.2 with strict Angular compiler options
- **Linting**: ESLint 9 with angular-eslint and Nx ESLint plugin

## Project Structure
- `src/app/` - Main application code
  - `app.ts` - Root component
  - `app.config.ts` - Application configuration with routing
  - `app.routes.ts` - Route definitions
- `src/main.ts` - Application bootstrap
- `src/index.html` - HTML entry point
- `src/styles.css` - Global styles
- `public/` - Static assets (copied to dist)

## Configuration Files
- `project.json` - Nx project configuration with build/serve/test targets
- `nx.json` - Nx workspace configuration with caching and target defaults
- `vite.config.mts` - Vite configuration for development and testing
- `eslint.config.mjs` - Flat ESLint config with Angular rules
- `tsconfig.json` - Base TypeScript configuration with Angular strict mode
- `tsconfig.app.json` - Application-specific TypeScript config
- `tsconfig.spec.json` - Test-specific TypeScript config

## Angular Configuration
- **Component prefix**: `app`
- **Directive selector style**: camelCase with 'app' prefix
- **Component selector style**: kebab-case with 'app' prefix
- **Style format**: CSS (default)
- **Test runner**: Vitest (not Karma/Jasmine)
- **Strict mode**: Enabled (strictTemplates, strictInjectionParameters, strictInputAccessModifiers)

## Build Configuration
- Default build target is production
- Development builds have no optimization, source maps enabled, and no license extraction
- Production builds use output hashing and enforce bundle budgets
- TypeScript uses "bundler" module resolution with "preserve" module format

## Testing Configuration
- Vitest runs with jsdom environment
- Tests are located alongside source files with `.spec.ts` or `.test.ts` extensions
- Coverage provider is v8
- Test files pattern: `{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`

## Nx Features
- Caching enabled for build, lint, and test targets
- Build targets depend on upstream builds (`dependsOn: ["^build"]`)
- Nx Cloud configured (ID: 6900fcdeb98d7a00a905a750)
- Default base branch: master
- CI workflow defined in `.github/workflows/ci.yml`
