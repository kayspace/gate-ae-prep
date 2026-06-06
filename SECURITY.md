# Security Policy

This document describes the security posture of gate-ae-prep, how to report a vulnerability responsibly, and what contributors and users should understand about the application's design as it relates to security.

---

## Table of Contents

1. [Supported Versions](#supported-versions)
2. [Reporting a Vulnerability](#reporting-a-vulnerability)
3. [What Happens After You Report](#what-happens-after-you-report)
4. [Security Design of This Application](#security-design-of-this-application)
5. [Known Limitations and Accepted Risks](#known-limitations-and-accepted-risks)
6. [Security Considerations for Contributors](#security-considerations-for-contributors)
7. [Dependency Security](#dependency-security)
8. [Out of Scope](#out-of-scope)

---

## Supported Versions

gate-ae-prep is a single-branch project. Only the latest version deployed from the `master` branch is actively supported. Security fixes are applied to `master` and deployed. Older releases are not patched separately.

| Version           | Supported |
| ----------------- | --------- |
| Latest (`master`) | Yes       |
| Older releases    | No        |

If you are using a locally cloned or self-hosted version, keep it up to date by pulling from `master` regularly.

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a vulnerability, report it privately so it can be investigated and fixed before being disclosed publicly. This protects users while the issue is being resolved.

**How to report:**

Open a [GitHub Security Advisory](https://github.com/kayspace/gate-ae-prep/security/advisories/new) using the private reporting feature. This is the preferred channel.

Alternatively, if you are unable to use that channel, contact the maintainer directly through GitHub by sending a message to [@kayspace](kayzspace@outlook.com).

**What to include in your report:**

- A clear description of the vulnerability
- The component or file involved (e.g., `api/feedback.ts`, `src/lib/youtube.ts`)
- Step-by-step instructions to reproduce the issue
- The potential impact (what could an attacker do by exploiting this?)
- Whether you have a suggested fix or patch

The more detail you provide, the faster the issue can be triaged and resolved.

---

## What Happens After You Report

1. **Acknowledgement.** You will receive an acknowledgement within 72 hours confirming the report has been received.
2. **Triage.** The maintainer will assess the severity and validity of the report. You may be asked follow-up questions.
3. **Fix.** A fix will be developed privately. The timeline depends on severity. Critical issues are prioritized immediately.
4. **Disclosure.** Once a fix is deployed, you will be notified. You are welcome to publish your own disclosure after the fix is live. If you would like credit in the release notes or advisory, please say so in your report.

---

## Security Design of This Application

Understanding the architecture helps clarify where security matters and where it does not apply.

### The application is local-first

gate-ae-prep is designed to run entirely in the user's browser. All study progress, notes, resource lists, video watch state, and theme preferences are stored in browser `localStorage`. Nothing is sent to a server, synced to a cloud service, or shared with any third party.

This means:

- There is no user account system and no authentication mechanism.
- There is no database.
- There is no server that holds user data.
- A user's data is isolated to their own browser. If they clear their browser storage, the data is gone.

### The only server-side component is the feedback endpoint

The one exception to the local-first design is the feedback system. When a user submits feedback from the app, the frontend sends a POST request to `/api/feedback`, which is a Vercel serverless function defined in `api/feedback.ts`. This function creates an entry in a Notion database owned by the maintainer.

The feedback endpoint:

- Accepts a nickname (chosen by the user, not tied to any account), a category, and a message.
- Does not collect IP addresses, browser fingerprints, or any personally identifying information beyond what the user explicitly types.
- Does not set cookies.
- Does not return sensitive data.
- Is rate-limited by Vercel's platform defaults.

### YouTube API key

The YouTube Data API key is provided by the user themselves through the app's UI on the Resources page. It is stored in the user's own `localStorage` under `gate-ae-yt-key-v1`. It is never sent to any server owned by this project. The key is passed directly from the browser to the YouTube Data API (`https://www.googleapis.com/youtube/v3/`) for playlist lookups.

Users are responsible for the security of their own YouTube API keys. They should use keys with read-only scope and restrict them by HTTP referrer in the Google Cloud Console.

---

## Known Limitations and Accepted Risks

These are design characteristics of the application that are intentional and not treated as security vulnerabilities:

**No data encryption at rest.** Data stored in `localStorage` is not encrypted. Anyone with physical access to the device and browser developer tools can read or modify it. This is an inherent limitation of browser storage. Given that the data stored (study progress, notes, resource URLs) is not sensitive, this risk is accepted.

**No Content Security Policy headers in local development.** When running with `npm run dev`, Vite does not add security headers. These headers are configured at the deployment layer (Vercel) for production. If you self-host the app, configure appropriate headers at your web server or CDN layer.

**The feedback endpoint does not authenticate callers.** Any party that knows the endpoint URL can POST feedback to it. There is no API key or token protecting the endpoint. Spam submissions are a known risk. This is a deliberate trade-off to keep the system simple. If spam becomes a significant problem, rate limiting or CAPTCHA will be evaluated.

**User-provided YouTube API keys are stored in plaintext.** As described above, the key lives in `localStorage` in plaintext. Users should not use their primary Google account's API key without restrictions. A restricted, purpose-specific key is strongly recommended.

---

## Security Considerations for Contributors

If you are contributing code, keep the following in mind:

**Do not log sensitive values.** Do not add `console.log` statements that output the YouTube API key, user notes, or any other data the user has stored. If you need to debug, use placeholder values or redact sensitive fields.

**Do not add new external requests without discussion.** The application is intentionally local-first. Any change that causes the browser to make a network request to a third-party service (other than the YouTube Data API and the YouTube IFrame API, which are already present) requires a discussion in a GitHub issue before implementation. This includes analytics, error reporting, CDN-hosted fonts, and similar services.

**Do not add server-side storage.** This project does not use a backend database. Contributions that introduce user data storage on a server are outside the project's scope.

**Validate and sanitize user input before use.** The feedback form and any future form-based inputs should validate input on the client before sending it to the serverless function. The serverless function in `api/feedback.ts` should never trust client input without validation.

**Keep the feedback endpoint hardened.** If you modify `api/feedback.ts`, ensure the following remain true:

- Input is validated and sanitized before being sent to Notion.
- The Notion API token is read from environment variables only, never from the request body or query string.
- The function does not return error messages that expose internal details (stack traces, environment variable names, Notion database IDs).

**Review dependencies before adding them.** Before adding a new npm package, check its weekly download count, last publish date, and the number of open issues on GitHub. Prefer well-maintained packages with a clear owner. Avoid packages that have not been updated in more than two years.

---

## Dependency Security

Dependencies are managed via npm. To check for known vulnerabilities in the current dependency tree, run:

```bash
npm audit
```

To automatically fix vulnerabilities where a compatible, non-breaking patch is available:

```bash
npm audit fix
```

Do not run `npm audit fix --force` without carefully reviewing the changes it proposes. Forced fixes can introduce breaking changes.

Contributors are encouraged to include a dependency audit as part of their testing process when their pull request modifies `package.json` or `package-lock.json`.

The maintainer periodically reviews and updates dependencies. If you notice a dependency with a known CVE that has not been addressed, open an issue or follow the vulnerability reporting process above if the risk is significant.

---

## Out of Scope

The following are not considered security vulnerabilities in the context of this project:

- A user being able to read or modify their own `localStorage` data using browser developer tools. This is expected browser behavior and the user has full access to their own storage.
- Missing security headers in the local development environment (`npm run dev`). Headers are applied at the deployment layer.
- Vulnerabilities in third-party services (YouTube, Notion, Vercel) that this project depends on. Report those directly to the respective services.
- Denial-of-service attacks against the feedback endpoint through high-volume requests. Rate limiting is handled at the platform layer by Vercel.
- Social engineering attacks. This project has no user account system and stores no credentials.

If you are unsure whether something qualifies as a security issue, report it privately anyway. It is better to over-report than to leave a genuine vulnerability undisclosed.

---

## Contact

For private security disclosures, use the [GitHub Security Advisory](https://github.com/kayspace/gate-ae-prep/security/advisories/new) feature or contact [@kayspace](kayzspace@outlook.com) directly.

For non-security questions about the project, open a public issue with the `question` label.
