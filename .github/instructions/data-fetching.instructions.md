---
description: Read this file to understand how to fetch data in the project.
---
# Data Fetching Guidelines
This document outlines the best practices for fetching data in our Next.js application, adhering to these guidelines will ensure consistency, performance and maintainability accross  the codebase.

## 1. Use Server Components for Data Fetching

In Next.js ALWAYS using server components for data fetching. NEVER use client components to fetch data. 

## 2. Data fetching methods 

ALWAYS use the helper functions defined in the /data directory to fetch data. NEVER fetch data directly in the components.

ALL help functions in the /data directory should use Drizzle ORM for database interactions.
