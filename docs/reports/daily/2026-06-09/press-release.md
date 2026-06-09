FOR IMMEDIATE RELEASE

# HHS Website Accessibility Report: June 9, 2026

*Washington, D.C. -- June 9, 2026* -- A daily scan of 33 of the most-visited HHS government websites found 59 accessibility barriers across 75 URLs today. The most common issues include Focus Order Predictability, Document Structure Navigation, and Primary Content Identification.

These barriers prevent Americans with disabilities from independently accessing essential HHS government services. This is a single daily snapshot of the most popular ~75 pages in HHS web properties, as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services) (powered by the Digital Analytics Program, DAP).

## Americans Being Left Out

Based on page traffic data and U.S. Census disability prevalence estimates (ACS 2022), today's accessibility barriers are estimated to affect the following groups of Americans:

| Disability Group | Affected Page Loads | Estimated People Affected |
|-----------------|---------------------|--------------------------|
| Limited Manipulation | 1,597,669 | ~35,149 |
| Without Vision | 1,546,980 | ~15,470 |
| Without Hearing | 1,546,980 | ~4,641 |
| Limited Reach and Strength | 56,367 | ~3,269 |
| Without Perception of Color | 42,085 | ~1,810 |
| Limited Vision | 75,011 | ~1,800 |
| Limited Language, Cognitive, and Learning Abilities | 258 | ~12 |

*Total page loads across all scanned URLs today: 1,871,925*

*Estimates use disability prevalence rates from the U.S. Census Bureau American Community Survey (ACS) 2022, supplemented by CDC, NIDCD, AFB, and NIH/NEI data. These are rough estimates intended to illustrate the scale of accessibility barriers, not precise measurements.*

## Top Accessibility Barriers

The following accessibility issues were most frequently found across today's scanned government websites. Each issue prevents specific groups of Americans from independently accessing government services.

### 1. `tabindex`: Focus Order Predictability

*Found on 6 government websites today*

Positive tabindex values create unpredictable focus sequences that jump around the page in ways that differ from the visual reading order. For keyboard users and screen reader users on government websites, an erratic tab order makes it difficult to reliably navigate forms and interactive content, increasing errors and the time needed to complete tasks, and creating particular frustration for users with cognitive disabilities who need a predictable, logical interaction flow.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf using keyboard-only navigation
- People with motor disabilities using keyboard or switch access

### 2. `heading-order`: Document Structure Navigation

*Found on 6 government websites today*

Screen reader users navigate complex government websites primarily through heading structure, using headings as a table of contents to jump between sections. Skipped heading levels break the logical document outline, causing confusion about the hierarchy of information and forcing users to re-read sections to understand the relationship between topics, adding significant time and effort to information-gathering tasks.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

### 3. `landmark-one-main`: Primary Content Identification

*Found on 6 government websites today*

Without a main landmark, screen reader users lose their most efficient way to skip to the primary content of a government page. Every page visit requires tabbing through the entire navigation structure to reach the actual content, a significant time and effort burden that accumulates across repeated visits to government websites for citizens managing ongoing benefit cases or legal matters.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

### 4. `link-name`: Link Purpose Clarity

*Found on 5 government websites today*

Links without accessible names are completely useless to screen reader users who navigate government pages by jumping between links. An unnamed link could lead anywhere, and activating it unknowingly could trigger downloads, open unexpected pages, or initiate unintended processes. On government websites, unnamed links undermine the informed consent principle by preventing citizens from knowing where a link will take them.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

### 5. `skip-link`: Skip Link Functional Effectiveness

*Found on 5 government websites today*

A skip link that points to a non-existent or non-focusable target provides no actual benefit and may confuse keyboard users who activate it and experience no apparent result. For screen reader and keyboard users on government websites with extensive navigation, a broken skip link means they must navigate through the entire repeated header every time, negating the accessibility feature entirely and creating a cruel illusion of accessibility that does not function.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf using keyboard-only navigation
- People with motor disabilities using keyboard navigation

## Accessibility Scores

Aggregate Lighthouse scores across 33 scanned HHS government websites today:

| Metric | Score |
|--------|-------|
| Accessibility | 90.92 |
| Performance | 57.4 |
| Best Practices | 89.72 |
| SEO | 87.8 |

## About This Report

This report captures a daily snapshot of the most-visited HHS government web pages as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services), powered by the Digital Analytics Program (DAP). Scans use Lighthouse (Google's automated web quality tool, which includes axe-core for accessibility testing). Reports are published automatically each day.

- [View full interactive report](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-06-09/index.html)
- [Download accessibility findings (JSON)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-06-09/axe-findings.json)
- [Download accessibility findings (CSV)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-06-09/axe-findings.csv)

---

*Generated by [Daily HHS](https://github.com/mgifford/daily-hhs) | Source: [analytics.usa.gov/health-human-services](https://analytics.usa.gov/health-human-services) (Digital Analytics Program) | Methodology: Lighthouse + axe-core | Date: 2026-06-09*
