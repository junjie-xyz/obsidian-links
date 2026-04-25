# Obsidian Links

A tiny static HTTPS gateway for opening Obsidian notes from Discord, Slack, and other apps that do not render `obsidian://` links as clickable links.

## Access

Visit either domain:

- https://obsidian-links.junjie.xyz/
- https://ob.junjie.xyz/

## Usage

Open note:

```text
https://obsidian-links.junjie.xyz/open/#vault=DemoVault&file=Inbox%2FTest.md
```

Generated URI:

```text
obsidian://open?vault=DemoVault&file=Inbox%2FTest.md
```

Search:

```text
https://obsidian-links.junjie.xyz/search/#vault=DemoVault&query=Example%20query
```

Generated URI:

```text
obsidian://search?vault=DemoVault&query=Example%20query
```

Create note:

```text
https://obsidian-links.junjie.xyz/new/#vault=DemoVault&name=Example%20Note
```

Generated URI:

```text
obsidian://new?vault=DemoVault&name=Example%20Note
```

Auto-open:

```text
https://obsidian-links.junjie.xyz/open/#vault=DemoVault&file=Inbox%2FTest.md&autoopen=1
```

The `autoopen=1` parameter controls the gateway page. It is not included in the generated `obsidian://` URI.

Query strings are also supported for debugging:

```text
https://obsidian-links.junjie.xyz/open/?vault=DemoVault&file=Inbox%2FTest.md
https://obsidian-links.junjie.xyz/search/?vault=DemoVault&query=Example%20query
```

Hash parameters take priority over query strings.

The home page also includes a local converter. Paste a documented `obsidian://` URI to generate a clickable HTTPS link.

## Why Hash Parameters?

URL fragments are not sent to the server when requesting the page, so note names are less likely to appear in server-side request logs.

Fragments are not private. They can still appear in Discord messages, the browser address bar, browser history, screenshots, and local logs.

## Supported Actions

Supported routes mirror documented Obsidian URI actions:

- `/open/`
- `/new/`
- `/daily/`
- `/unique/`
- `/search/`
- `/choose-vault/`
- `/hook-get-address/`

`autoopen=1` may be added to any route hash to attempt opening Obsidian when the page loads.

## Security

This project does not support arbitrary target URLs.

It only generates:

- `obsidian://open`
- `obsidian://new`
- `obsidian://daily`
- `obsidian://unique`
- `obsidian://search`
- `obsidian://choose-vault`
- `obsidian://hook-get-address`

The following parameters are rejected:

- `target`
- `url`
- `redirect`
- `callback`

Documented callback parameters such as `x-success` and `x-error` are only allowed on actions that officially support them.

The pages do not load third-party resources, fonts, analytics, or CDN assets.

## SEO

The home page is indexable as the product page for this tool.

Generated gateway routes are marked `noindex,nofollow`, and `robots.txt` disallows those route directories to avoid encouraging indexing of note-specific links.

## GitHub Pages Deployment

1. Push this repository to GitHub.
2. Open `Settings -> Pages`.
3. Set source to `Deploy from a branch`.
4. Set branch to `main`.
5. Set folder to `/root`.
6. Set custom domain to `obsidian-links.junjie.xyz`.
7. Enable `Enforce HTTPS` after GitHub finishes DNS and certificate checks.

## DNS

Create a DNS record:

```text
Type: CNAME
Name: obsidian-links
Target: junjie-xyz.github.io
Proxy: DNS only
```

The repository includes a `CNAME` file with:

```text
obsidian-links.junjie.xyz
```

## Development

Run tests with Node.js:

```sh
npm test
```

No build step is required.

## Disclaimer

Unofficial tool. Not affiliated with Obsidian.
