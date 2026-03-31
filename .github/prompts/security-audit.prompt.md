---
name: security-audit
agent: ask
description: This prompt is designed to assist in conducting a security audit of a software project. It provides guidelines and questions to consider when evaluating the security of the codebase, dependencies, and overall architecture.
---

Perform a security audit of this codebase to detect any potential security vulnerabilities in this project.

Output your findings as a markdown formatted table with the following columns (ID should start at 1 and auto increment, File Path should be an actual link to the file): "ID", "Severity", "Issue", "File Path", "Line Number(s)", and "Recommendation".

Next, ask the user which issues they want to fix by either replying "all" or by providing a comma-separated list of issue IDs. After their reply, run a separate sub agent (#runSubagent) to fix each issue that the user has specified. Each sub agent should report back with a simple `subAgentSuccess: true | false`.