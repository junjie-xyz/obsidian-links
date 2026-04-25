# Product

## Register

product

## Users

People who use Obsidian and need to share supported `obsidian://` actions in places that do not make custom protocols clickable, such as chat apps, documentation, issue trackers, and agent workflows.

They are usually doing a quick utility task: paste a local Obsidian URI, generate a safe HTTPS gateway link, review what it will open, then copy or share it. They need confidence more than persuasion.

## Product Purpose

Obsidian Links is a tiny static HTTPS gateway for documented Obsidian URI actions. It turns supported `obsidian://` links into reviewable HTTPS pages that can copy or launch the matching local Obsidian action.

Success means a user can inspect the action, vault, file, query, or note name before opening anything; generate links with fictional or user-provided values only; and understand that the site avoids arbitrary redirects, third-party resources, analytics, and unsupported parameters.

## Brand Personality

Precise, quiet, trustworthy.

The interface should feel warm and intentional, but the tool should still disappear into the task. Editorial styling is welcome when it improves clarity; it should not make the converter or confirmation pages feel like a marketing surface.

## Anti-references

- SaaS landing pages where the hero competes with the actual tool.
- Dashboard templates, decorative card grids, and generic productivity-app chrome.
- Neon, gradient-heavy, or futuristic protocol-link visuals.
- Hidden auto-open behavior, ambiguous destination previews, or unclear copy states.
- Examples that use real local paths, real vault names, real note names, or personal data.

## Design Principles

- Put the converter before branding.
- Make every generated destination inspectable before launch.
- Keep security and privacy constraints visible, short, and concrete.
- Use fictional examples only, such as `DemoVault`, `Inbox/Test.md`, and `Example query`.
- Preserve the static, dependency-light nature of the project.
- Prefer warm restraint over decoration; the product should feel considered, not loud.

## Accessibility & Inclusion

Use readable contrast, visible focus states, 44px minimum touch targets, keyboard-friendly controls, and reduced-motion support. Generated URLs and Obsidian URIs must wrap safely on small screens without hiding critical destination details.
