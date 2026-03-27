# Link Shortener Project - Agent Instructions

This file defines coding standards and best practices for LLMs assisting with this Next.js 16.2.1 project. All AI-assisted code generation must adhere to these guidelines.

## 🚨 CRITICAL: ALWAYS Read Individual Instruction Files BEFORE Coding

**This is the single most important requirement for this project.**

Before writing, modifying, or reviewing ANY code in this project, you MUST:

1. **Identify the domain** of the work (e.g., UI components, authentication, database, etc.)
2. **Load and read the appropriate instruction file** from `/.github/instructions` directory (e.g., `/.github/instructions/shadcn-ui-only.instructions.md`)
3. **Review all standards and requirements** in that file
4. **ONLY THEN proceed** with code generation or modification

**Failure to read the relevant instruction file WILL result in non-compliant code.** This is not optional, not a suggestion, and not a preference—it is a mandatory blocking requirement.

**Example**: If asked to build a form → Read `.github/instructions/components-ui.instructions.md` + `.github/instructions/typescript-standards.instructions.md` FIRST, THEN generate code.

## Quick Reference

- **Framework**: Next.js 16.2.1 with App Router
- **Language**: TypeScript 5
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Linting**: ESLint 9

## Core Principles

1. **Type Safety First** - Strict TypeScript, no `any` types
2. **Dark Mode Support** - All UI components must support light/dark modes
3. **Consistency** - Follow existing patterns in the codebase
4. **Error Handling** - Graceful error handling with proper logging
5. **Performance** - Optimize for Web Vitals and database queries

## Directory Structure

```
.
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable React components
│   └── ui/          # shadcn/ui components
├── db/              # Database schema and utilities
├── lib/             # Utility functions and helpers
└── public/          # Static assets
```

## Key Files to Know

- **`drizzle.config.ts`** - Database config (localhost connection)
- **`next.config.ts`** - Next.js configuration
- **`postcss.config.mjs`** - Tailwind CSS 4 PostCSS configuration
- **`tsconfig.json`** - TypeScript strict mode enabled
- **`db/schema.ts`** - Drizzle schema definitions

## Documentation Structure - MANDATORY BLOCKING REQUIREMENT

Agent instructions are organized by domain in the `.github/instructions/` directory.

### Domain-Specific Instruction Files (MUST READ BEFORE WORK):

| Domain | File |
|--------|------|
| UI Components (shadcn/ui) | `.github/instructions/shadcn-ui-only.instructions.md` |
| General Components & UI | `.github/instructions/components-ui.instructions.md` |
| Authentication (Clerk) | `.github/instructions/auth-clerk.instructions.md` |
| API Routes | `.github/instructions/api-routes.instructions.md` |
| Database & Drizzle ORM | `.github/instructions/database-drizzle.instructions.md` |
| Data Fetching | `.github/instructions/data-fetching.instructions.md` |
| Error Handling | `.github/instructions/error-handling.instructions.md` |
| TypeScript Standards | `.github/instructions/typescript-standards.instructions.md` |
| Next.js Conventions | `.github/instructions/nextjs-conventions.instructions.md` |
| Quick Reference | `.github/instructions/quick-reference.instructions.md` |
| Server Actions | `.github/instructions/server-actions.instructions.md` |
| Server Action Validation | `.github/instructions/server-actions-validation.instructions.md` |
