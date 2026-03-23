# Link Shortener Project - Agent Instructions

This file defines coding standards and best practices for LLMs assisting with this Next.js 16.2.1 project. All AI-assisted code generation must adhere to these guidelines.

## 🚨 CRITICAL: ALWAYS Read Individual Instruction Files BEFORE Coding

**This is the single most important requirement for this project.**

Before writing, modifying, or reviewing ANY code in this project, you MUST:

1. **Identify the domain** of the work (e.g., UI components, authentication, database, etc.)
2. **Load and read the appropriate instruction file** from `/docs` directory (e.g., `docs/shadcn-ui-only.md`)
3. **Review all standards and requirements** in that file
4. **ONLY THEN proceed** with code generation or modification

**Failure to read the relevant instruction file WILL result in non-compliant code.** This is not optional, not a suggestion, and not a preference—it is a mandatory blocking requirement.

**Example**: If asked to build a form → Read `docs/components-ui.md` + `docs/typescript-standards.md` FIRST, THEN generate code.

## Quick Reference

- **Framework**: Next.js 16.2.1 with App Router
- **Language**: TypeScript 5
- **Database**: PostgreSQL via Neon + Drizzle ORM
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
├── public/          # Static assets
└── docs/            # Agent instruction skills (separate by domain)
```

## Key Files to Know

- **`drizzle.config.ts`** - Database config (Neon connection)
- **`next.config.ts`** - Next.js configuration
- **`tailwind.config.js`** - Tailwind theme and customization
- **`tsconfig.json`** - TypeScript strict mode enabled
- **`db/schema.ts`** - Drizzle schema definitions

## Documentation Structure - MANDATORY BLOCKING REQUIREMENT

Agent instructions are organized by domain in the `/docs` directory. 

### ⚠️ BLOCKING REQUIREMENT: ALWAYS READ FIRST ⚠️

Every single coding task requires you to read the relevant instruction file FIRST. This is not a suggestion—it is mandatory and blocks all code generation until completed.

**The process is:**
1. Determine what domain/area you're working in
2. Locate the corresponding `.md` file in `/docs/`
3. Read it completely
4. Only after reading, proceed with code generation

**Consequence of not reading**: Non-compliant implementation that violates project standards

### Domain-Specific Instruction Files (MUST READ BEFORE WORK):

| Domain | Instruction File | Read When |
|--------|------------------|-----------|
| **Authentication** | `docs/auth-clerk.md` | Working with Clerk, protected routes, login, user sessions |
| **UI Components** | `docs/shadcn-ui-only.md` | Creating/modifying any UI element (SHADCN ONLY - no custom components) |
| **Next.js Routing** | `docs/nextjs-conventions.md` | Creating pages, layouts, routes, or page structure |
| **TypeScript Types** | `docs/typescript-standards.md` | Writing types, interfaces, type annotations, or any TS code |
| **Database/ORM** | `docs/database-drizzle.md` | Working with schema, queries, migrations, database operations |
| **Components** | `docs/components-ui.md` | Building React components, component composition, props |
| **API Endpoints** | `docs/api-routes.md` | Creating or modifying API routes, handlers, responses |
| **Error Handling** | `docs/error-handling.md` | Implementing errors, logging, try-catch blocks, user feedback |
| **Common Tasks** | `docs/quick-reference.md` | Quick lookup for patterns and snippets |

**MANDATORY WORKFLOW**: Identify domain → Load `/docs/*.md` → Review standards → Generate code (NOT the other way around)
