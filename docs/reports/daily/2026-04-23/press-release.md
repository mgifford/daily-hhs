FOR IMMEDIATE RELEASE

# HHS Website Accessibility Report: April 23, 2026

*Washington, D.C. -- April 23, 2026* -- A daily scan of 25 of the most-visited HHS government websites found 55 accessibility barriers across 65 URLs today. The most common issues include Link Purpose Clarity, Primary Content Identification, and Focus Order Predictability.

These barriers prevent Americans with disabilities from independently accessing essential HHS government services. This is a single daily snapshot of the most popular ~65 pages in HHS web properties, as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services) (powered by the Digital Analytics Program, DAP).

## Americans Being Left Out

Based on page traffic data and U.S. Census disability prevalence estimates (ACS 2022), today's accessibility barriers are estimated to affect the following groups of Americans:

| Disability Group | Affected Page Loads | Estimated People Affected |
|-----------------|---------------------|--------------------------|
| Limited Manipulation | 1,279,452 | ~28,148 |
| Without Vision | 1,279,452 | ~12,795 |
| Without Hearing | 1,279,452 | ~3,838 |
| Limited Vision | 27,930 | ~670 |
| Limited Reach and Strength | 10,690 | ~620 |
| Without Perception of Color | 10,291 | ~443 |

*Total page loads across all scanned URLs today: 1,515,759*

*Estimates use disability prevalence rates from the U.S. Census Bureau American Community Survey (ACS) 2022, supplemented by CDC, NIDCD, AFB, and NIH/NEI data. These are rough estimates intended to illustrate the scale of accessibility barriers, not precise measurements.*

## Top Accessibility Barriers

The following accessibility issues were most frequently found across today's scanned government websites. Each issue prevents specific groups of Americans from independently accessing government services.

### 1. `link-name`: Link Purpose Clarity

*Found on 7 government websites today*

Links without accessible names are completely useless to screen reader users who navigate government pages by jumping between links. An unnamed link could lead anywhere, and activating it unknowingly could trigger downloads, open unexpected pages, or initiate unintended processes. On government websites, unnamed links undermine the informed consent principle by preventing citizens from knowing where a link will take them.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

### 2. `landmark-one-main`: Primary Content Identification

*Found on 7 government websites today*

Without a main landmark, screen reader users lose their most efficient way to skip to the primary content of a government page. Every page visit requires tabbing through the entire navigation structure to reach the actual content, a significant time and effort burden that accumulates across repeated visits to government websites for citizens managing ongoing benefit cases or legal matters.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

### 3. `tabindex`: Focus Order Predictability

*Found on 6 government websites today*

Positive tabindex values create unpredictable focus sequences that jump around the page in ways that differ from the visual reading order. For keyboard users and screen reader users on government websites, an erratic tab order makes it difficult to reliably navigate forms and interactive content, increasing errors and the time needed to complete tasks, and creating particular frustration for users with cognitive disabilities who need a predictable, logical interaction flow.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf using keyboard-only navigation
- People with motor disabilities using keyboard or switch access

### 4. `skip-link`: Skip Link Functional Effectiveness

*Found on 5 government websites today*

A skip link that points to a non-existent or non-focusable target provides no actual benefit and may confuse keyboard users who activate it and experience no apparent result. For screen reader and keyboard users on government websites with extensive navigation, a broken skip link means they must navigate through the entire repeated header every time, negating the accessibility feature entirely and creating a cruel illusion of accessibility that does not function.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf using keyboard-only navigation
- People with motor disabilities using keyboard navigation

### 5. `heading-order`: Document Structure Navigation

*Found on 5 government websites today*

Screen reader users navigate complex government websites primarily through heading structure, using headings as a table of contents to jump between sections. Skipped heading levels break the logical document outline, causing confusion about the hierarchy of information and forcing users to re-read sections to understand the relationship between topics, adding significant time and effort to information-gathering tasks.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

## Accessibility Scores

Aggregate Lighthouse scores across 25 scanned HHS government websites today:

| Metric | Score |
|--------|-------|
| Accessibility | 88.67 |
| Performance | 61.83 |
| Best Practices | 90.5 |
| SEO | 86.83 |

## About This Report

This report captures a daily snapshot of the most-visited HHS government web pages as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services), powered by the Digital Analytics Program (DAP). Scans use Lighthouse (Google's automated web quality tool, which includes axe-core for accessibility testing). Reports are published automatically each day.

- [View full interactive report](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-04-23/index.html)
- [Download accessibility findings (JSON)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-04-23/axe-findings.json)
- [Download accessibility findings (CSV)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-04-23/axe-findings.csv)

---

*Generated by [Daily HHS](https://github.com/mgifford/daily-hhs) | Source: [analytics.usa.gov/health-human-services](https://analytics.usa.gov/health-human-services) (Digital Analytics Program) | Methodology: Lighthouse + axe-core | Date: 2026-04-23*
