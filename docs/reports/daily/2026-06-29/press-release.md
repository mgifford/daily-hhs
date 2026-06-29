FOR IMMEDIATE RELEASE

# HHS Website Accessibility Report: June 29, 2026

*Washington, D.C. -- June 29, 2026* -- A daily scan of 10 of the most-visited HHS government websites found 16 accessibility barriers across 47 URLs today. The most common issues include Skip Link Functional Effectiveness, Link Purpose Clarity, and Focus Order Predictability.

These barriers prevent Americans with disabilities from independently accessing essential HHS government services. This is a single daily snapshot of the most popular ~47 pages in HHS web properties, as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services) (powered by the Digital Analytics Program, DAP).

## Americans Being Left Out

Based on page traffic data and U.S. Census disability prevalence estimates (ACS 2022), today's accessibility barriers are estimated to affect the following groups of Americans:

| Disability Group | Affected Page Loads | Estimated People Affected |
|-----------------|---------------------|--------------------------|
| Limited Manipulation | 700,099 | ~15,402 |
| Without Vision | 680,864 | ~6,809 |
| Without Hearing | 680,864 | ~2,043 |
| Limited Vision | 72,714 | ~1,745 |
| Limited Reach and Strength | 19,235 | ~1,116 |
| Without Perception of Color | 24,805 | ~1,067 |

*Total page loads across all scanned URLs today: 758,894*

*Estimates use disability prevalence rates from the U.S. Census Bureau American Community Survey (ACS) 2022, supplemented by CDC, NIDCD, AFB, and NIH/NEI data. These are rough estimates intended to illustrate the scale of accessibility barriers, not precise measurements.*

## Top Accessibility Barriers

The following accessibility issues were most frequently found across today's scanned government websites. Each issue prevents specific groups of Americans from independently accessing government services.

### 1. `skip-link`: Skip Link Functional Effectiveness

*Found on 4 government websites today*

A skip link that points to a non-existent or non-focusable target provides no actual benefit and may confuse keyboard users who activate it and experience no apparent result. For screen reader and keyboard users on government websites with extensive navigation, a broken skip link means they must navigate through the entire repeated header every time, negating the accessibility feature entirely and creating a cruel illusion of accessibility that does not function.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf using keyboard-only navigation
- People with motor disabilities using keyboard navigation

### 2. `link-name`: Link Purpose Clarity

*Found on 3 government websites today*

Links without accessible names are completely useless to screen reader users who navigate government pages by jumping between links. An unnamed link could lead anywhere, and activating it unknowingly could trigger downloads, open unexpected pages, or initiate unintended processes. On government websites, unnamed links undermine the informed consent principle by preventing citizens from knowing where a link will take them.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

### 3. `tabindex`: Focus Order Predictability

*Found on 3 government websites today*

Positive tabindex values create unpredictable focus sequences that jump around the page in ways that differ from the visual reading order. For keyboard users and screen reader users on government websites, an erratic tab order makes it difficult to reliably navigate forms and interactive content, increasing errors and the time needed to complete tasks, and creating particular frustration for users with cognitive disabilities who need a predictable, logical interaction flow.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf using keyboard-only navigation
- People with motor disabilities using keyboard or switch access

### 4. `target-size`: Digital Motor Access

*Found on 2 government websites today*

Small touch targets act as a digital gatekeeper, excluding individuals with tremors, arthritis, or limited dexterity from accessing essential services independently. These technical failures transform a routine interaction into a source of failure, stripping away the autonomy of citizens who require a frictionless, accessible interface to participate in digital life. The approximately 58 million Americans with ambulatory or self-care disabilities are disproportionately impacted by inadequate touch target sizing on government mobile websites.

**Affected groups:**

- People with Parkinson's disease, arthritis, or hand tremors
- Older adults with reduced fine motor control
- People with motor disabilities using alternative pointing devices
- People in situational impairment contexts (e.g., commuting, holding a child)

### 5. `aria-required-parent`: Widget Context Integrity

*Found on 1 government website today*

ARIA elements without their required parent context lose semantic meaning for screen readers. A list item without a list, or a tab panel without a tab list, strips away the structural context that screen reader users depend on to understand and navigate government websites. This disorientation forces repeated and often futile navigation attempts.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities navigating by keyboard

## Accessibility Scores

Aggregate Lighthouse scores across 10 scanned HHS government websites today:

| Metric | Score |
|--------|-------|
| Accessibility | 94 |
| Performance | 55 |
| Best Practices | 91.33 |
| SEO | 85.89 |

## About This Report

This report captures a daily snapshot of the most-visited HHS government web pages as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services), powered by the Digital Analytics Program (DAP). Scans use Lighthouse (Google's automated web quality tool, which includes axe-core for accessibility testing). Reports are published automatically each day.

- [View full interactive report](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-06-29/index.html)
- [Download accessibility findings (JSON)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-06-29/axe-findings.json)
- [Download accessibility findings (CSV)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-06-29/axe-findings.csv)

---

*Generated by [Daily HHS](https://github.com/mgifford/daily-hhs) | Source: [analytics.usa.gov/health-human-services](https://analytics.usa.gov/health-human-services) (Digital Analytics Program) | Methodology: Lighthouse + axe-core | Date: 2026-06-29*
