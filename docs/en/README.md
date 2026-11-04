# bios-webapp technical documentation

🇧🇷 [Português](../README.md) · 🇺🇸 **English**

[← Back to the project README](../../README.en.md)

How the app works inside: each screen, the rules it follows and where it lives in the code. The
requirements, use cases and modeling live in the
[bios-docs](https://github.com/odavibatista/bios-docs) repository (in Portuguese); the same
identifiers (UC, RF, NF, INL) point back to them here.

## Index

| No. | Document                                             | Content                                                        |
| --- | ---------------------------------------------------- | -------------------------------------------------------------- |
| 01  | [Getting started](01-Getting-Started.md)             | Installation, scripts, API types and Windows paths             |
| 02  | [Architecture](02-Architecture.md)                   | Data layer, session, panel shell and screen states             |
| 03  | [Accounts and access](03-Accounts-and-Access.md)     | Sign-up, login, password, account, API keys and administration |
| 04  | [Companies and indexes](04-Companies-and-Indexes.md) | Profile, evidence, SDG indexes, search, export and sectors     |
| 05  | [Presentation data](05-Presentation-Data.md)         | How real API responses are captured, stored and checked        |
| 06  | [Quality and tests](06-Quality-and-Tests.md)         | Accessibility in e2e tests, accent check and contribution flow |
| 07  | [Theme and publishing](07-Theme-and-Publishing.md)   | BIOS palette on Material 3 and static publishing on Vercel     |

## Where to start

- **Going to run the app?** [01. Getting started](01-Getting-Started.md).
- **Going to create or change a screen?** [02. Architecture](02-Architecture.md), then the chapter of
  that area.
- **Going to integrate with the real API?** [02. Architecture](02-Architecture.md) and
  [05. Presentation data](05-Presentation-Data.md).
