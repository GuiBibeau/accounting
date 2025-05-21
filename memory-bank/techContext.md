# Technical Context

## Core Technologies & Frameworks

_List the primary programming languages, frameworks, libraries, and platforms used in the project (e.g., Python/Django, React/Node.js, AWS/GCP, PostgreSQL/MongoDB)._

## Development Environment Setup

_Provide instructions or links to documentation on how to set up the local development environment. Include necessary tools, versions, and configuration steps._

Key requirements for the local development environment:

- An always-running Firebase emulator suite. Start this with the command: `firebase emulators:start`. This is crucial for testing Firebase-dependent features locally.

## Key Dependencies & Integrations

_List critical external dependencies (e.g., APIs, third-party services, specific libraries with non-obvious usage). Describe how the system integrates with them._

## Build & Deployment Process

_Outline the steps involved in building, testing, and deploying the application. Include information on CI/CD pipelines if applicable._

Firebase Functions Development:

- After making changes to Firebase Functions (located in the `functions/src` directory), a manual build step is required for those changes to be reflected in the local emulators.
- Navigate to the `functions` directory and run: `npm run build`.

## Technical Constraints & Known Issues

_Document any known technical limitations, performance bottlenecks, or persistent issues that developers should be aware of._

## Tool Usage Patterns

_Describe any specific tools or utilities used for development, debugging, testing, or monitoring, along with any established patterns for their use (e.g., "Use X debugger for backend issues," "Run Y linter before committing")._

## Version Control Strategy

_Briefly outline the branching model, commit message conventions, and any other important aspects of the version control workflow (e.g., Gitflow, feature branches, squash merging)._
