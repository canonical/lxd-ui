# LXD-UI Agents and Skills Guide

This guide explains how to use LXD-UI agents and skills in:

- VS Code Copilot Chat
- GitHub Copilot CLI

It focuses on invocation patterns that match current public docs for Agent Skills, custom agents, and plugins.

## Quick Reference Table

| Name                       | Type               | VS Code Invocation                           | Copilot CLI Invocation                          | When to Use                                       | Tools                                        | Handoff / Delegation                        |
| -------------------------- | ------------------ | -------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| LXD-UI Feature Planner     | Agent (plugin)     | Agent picker -> `LXD-UI Feature Planner`     | `/agent` -> select `LXD-UI Feature Planner`     | Plan implementation before coding                 | Read-only exploration/search (agent-defined) | Yes -> Feature Implementer                  |
| LXD-UI Feature Implementer | Agent (plugin)     | Agent picker -> `LXD-UI Feature Implementer` | `/agent` -> select `LXD-UI Feature Implementer` | Implement feature end-to-end from plan/spec       | Read/edit/search/execute (agent-defined)     | Yes -> Test Writer                          |
| LXD-UI Test Writer         | Agent (plugin)     | Agent picker -> `LXD-UI Test Writer`         | `/agent` -> select `LXD-UI Test Writer`         | Write and run unit/E2E tests                      | Read/edit/search/execute (agent-defined)     | Usually terminal step (no required handoff) |
| code-review                | Skill (local repo) | `/code-review`                               | `/code-review`                                  | Review PR/diff for regressions, risk, and quality | Inherits active agent/session tools          | N/A                                         |
| lxd-ui-architecture-design | Skill (plugin)     | `/lxd-dev:lxd-ui-architecture-design`        | `/lxd-dev:lxd-ui-architecture-design`           | Architecture and major refactor design            | Inherits active agent/session tools          | Feeds Planner/Implementer                   |
| lxd-ui-qa-instructions     | Skill (plugin)     | `/lxd-dev:lxd-ui-qa-instructions`            | `/lxd-dev:lxd-ui-qa-instructions`               | Generate manual QA instructions for PRs           | Inherits active agent/session tools          | N/A                                         |
| lxd-ui-env-setup           | Skill (plugin)     | `/lxd-dev:lxd-ui-env-setup`                  | `/lxd-dev:lxd-ui-env-setup`                     | Produce LXD environment setup for validation      | Inherits active agent/session tools          | N/A                                         |
| lxd-ui-release-notes       | Skill (plugin)     | `/lxd-dev:lxd-ui-release-notes`              | `/lxd-dev:lxd-ui-release-notes`                 | Create release notes/changelog content            | Inherits active agent/session tools          | N/A                                         |

## Big Picture

There are three related concepts:

- Custom instructions: always-on or file-scoped guidance (`.github/copilot-instructions.md`, `AGENTS.md`, `*.instructions.md`)
- Skills: task-specific capabilities invoked as slash commands or auto-loaded when relevant
- Agents: specialized personas/tool configurations selected explicitly (agent picker, `/agent`, or `--agent`)

In this repo:

- One local skill lives in `.github/skills/code-review/SKILL.md`
- Additional skills and agents come from the `lxd-dev` plugin

## Most Important Invocation Rules

### VS Code Copilot Chat

- Skills are invoked from the slash command menu. Type `/` and pick one.
- Plugin skills can be namespaced by plugin name (for example `/lxd-dev:skill-name`).
- Agents are selected from the agent dropdown/picker in chat.

### Copilot CLI

- Start with `copilot`.
- Select an agent with `/agent`.
- Invoke a skill by slash command (for example `/skill-name` or namespaced `/plugin-name:skill-name` when provided by a plugin).
- Discover what is loaded with `/env`, `/skills list`, and `/skills info <name>`.

## LXD-UI Inventory

### Agents from plugin

- `LXD-UI Feature Planner`
- `LXD-UI Feature Implementer`
- `LXD-UI Test Writer`

Use these from:

- VS Code: select from the agent picker
- CLI: `/agent` then choose the agent.

### Skills

Local repo skill:

- `code-review`

Plugin skills:

- `lxd-ui-architecture-design`
- `lxd-ui-qa-instructions`
- `lxd-ui-env-setup`
- `lxd-ui-release-notes`

Invocation pattern:

- VS Code: type `/` and select the skill from the picker
- CLI: type `/` and select, or run by explicit command name

Namespacing note:

- Plugin-provided skills may appear with plugin prefix (for example `/lxd-dev:lxd-ui-qa-instructions`).
- Local skills are typically unprefixed (for example `/code-review`).
- Because naming display can vary by environment/version, prefer picker-based invocation instead of memorizing strings.

## Recommended Workflows

### Feature delivery

1. Select `LXD-UI Feature Planner`
2. Ask for implementation plan from acceptance criteria
3. Switch (or hand off) to `LXD-UI Feature Implementer`
4. Use `LXD-UI Test Writer` for tests

### Architecture-heavy change

1. Run skill `lxd-ui-architecture-design`
2. Use planner agent with the architecture output
3. Implement with implementer agent

### PR review

1. Run `/code-review` in VS Code chat or CLI
2. For GitHub PR UI, native Copilot review still applies repo instructions and local review guidance

### QA instructions for a PR

1. Run `lxd-ui-qa-instructions`
2. Paste generated steps into the PR template

## Troubleshooting Discovery and Invocation

If a skill or agent is not visible:

1. Confirm plugin is installed and enabled
2. In VS Code, open chat customizations and verify the item appears
3. In CLI, run `/env` and `/skills list`
4. For skills, verify `name` in `SKILL.md` is lowercase kebab-case and matches its folder name
5. If recently added, run `/skills reload` in CLI

## Where These Definitions Live

- Local skill: `.github/skills/code-review/SKILL.md`
- Repo-wide instructions: `.github/copilot-instructions.md`
- Project conventions: `agents.md`
- This guide: `.github/AGENTS_AND_SKILLS.md`

Plugin source for LXD-UI-specific plugin content:

- `canonical/anbox-agent-plugins` (plugin `lxd-dev`)

## Reference Links

- VS Code Agent Skills: https://code.visualstudio.com/docs/agent-customization/agent-skills
- VS Code Custom Agents: https://code.visualstudio.com/docs/agent-customization/custom-agents
- VS Code Agent Plugins: https://code.visualstudio.com/docs/agent-customization/agent-plugins
- GitHub Copilot CLI usage: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
- Copilot CLI command reference: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference
- Copilot CLI skills: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-skills
- Copilot CLI custom agents: https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/invoke-custom-agents
