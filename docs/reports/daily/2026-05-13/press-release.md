FOR IMMEDIATE RELEASE

# HHS Website Accessibility Report: May 13, 2026

*Washington, D.C. -- May 13, 2026* -- A daily scan of 6 of the most-visited HHS government websites found 8 accessibility barriers across 6 URLs today. The most common issues include Digital Motor Access, Widget Context Integrity, and Button Discoverability.

These barriers prevent Americans with disabilities from independently accessing essential HHS government services. This is a single daily snapshot of the most popular ~6 pages in HHS web properties, as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services) (powered by the Digital Analytics Program, DAP).

## Americans Being Left Out

Based on page traffic data and U.S. Census disability prevalence estimates (ACS 2022), today's accessibility barriers are estimated to affect the following groups of Americans:

| Disability Group | Affected Page Loads | Estimated People Affected |
|-----------------|---------------------|--------------------------|
| Limited Manipulation | 276,256 | ~6,078 |
| Without Vision | 256,627 | ~2,566 |
| Without Perception of Color | 44,457 | ~1,912 |
| Limited Reach and Strength | 19,955 | ~1,157 |
| Limited Vision | 44,783 | ~1,075 |
| Without Hearing | 256,627 | ~770 |

*Total page loads across all scanned URLs today: 375,421*

*Estimates use disability prevalence rates from the U.S. Census Bureau American Community Survey (ACS) 2022, supplemented by CDC, NIDCD, AFB, and NIH/NEI data. These are rough estimates intended to illustrate the scale of accessibility barriers, not precise measurements.*

## Top Accessibility Barriers

The following accessibility issues were most frequently found across today's scanned government websites. Each issue prevents specific groups of Americans from independently accessing government services.

### 1. `target-size`: Digital Motor Access

*Found on 3 government websites today*

Small touch targets act as a digital gatekeeper, excluding individuals with tremors, arthritis, or limited dexterity from accessing essential services independently. These technical failures transform a routine interaction into a source of failure, stripping away the autonomy of citizens who require a frictionless, accessible interface to participate in digital life. The approximately 58 million Americans with ambulatory or self-care disabilities are disproportionately impacted by inadequate touch target sizing on government mobile websites.

**Affected groups:**

- People with Parkinson's disease, arthritis, or hand tremors
- Older adults with reduced fine motor control
- People with motor disabilities using alternative pointing devices
- People in situational impairment contexts (e.g., commuting, holding a child)

### 2. `aria-required-parent`: Widget Context Integrity

*Found on 1 government website today*

ARIA elements without their required parent context lose semantic meaning for screen readers. A list item without a list, or a tab panel without a tab list, strips away the structural context that screen reader users depend on to understand and navigate government websites. This disorientation forces repeated and often futile navigation attempts.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities navigating by keyboard

### 3. `button-name`: Button Discoverability

*Found on 1 government website today*

Unlabeled buttons are silent black holes in the government digital experience. When a screen reader announces a button with no name, blind users cannot know what action it will perform. Submit, cancel, search, and navigation buttons without accessible names prevent citizens from completing applications, accessing benefits, or finding essential government resources independently.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools

### 4. `link-in-text-block`: Color-Independent Link Identification

*Found on 1 government website today*

When links are distinguished only by color, people with color vision deficiency cannot identify them as links and may miss critical references to additional information, forms, or resources. On government websites, overlooked links in informational content can mean missing essential instructions, deadlines, or procedures that affect a citizen's ability to access services or comply with requirements.

**Affected groups:**

- People with low vision who may not perceive color differences
- People who are color blind (approximately 8% of men, 0.5% of women)

### 5. `landmark-one-main`: Primary Content Identification

*Found on 1 government website today*

Without a main landmark, screen reader users lose their most efficient way to skip to the primary content of a government page. Every page visit requires tabbing through the entire navigation structure to reach the actual content, a significant time and effort burden that accumulates across repeated visits to government websites for citizens managing ongoing benefit cases or legal matters.

**Affected groups:**

- People who are blind using screen readers
- People who are deaf and rely on visual-to-text tools
- People with motor disabilities using keyboard navigation

## Accessibility Scores

Aggregate Lighthouse scores across 6 scanned HHS government websites today:

| Metric | Score |
|--------|-------|
| Accessibility | 95.5 |
| Performance | 40.5 |
| Best Practices | 91.5 |
| SEO | 89.33 |

## About This Report

This report captures a daily snapshot of the most-visited HHS government web pages as ranked by traffic data from [analytics.usa.gov](https://analytics.usa.gov/health-human-services), powered by the Digital Analytics Program (DAP). Scans use Lighthouse (Google's automated web quality tool, which includes axe-core for accessibility testing). Reports are published automatically each day.

- [View full interactive report](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-05-13/index.html)
- [Download accessibility findings (JSON)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-05-13/axe-findings.json)
- [Download accessibility findings (CSV)](https://mgifford.github.io/daily-hhs/docs/reports/daily/2026-05-13/axe-findings.csv)

---

*Generated by [Daily HHS](https://github.com/mgifford/daily-hhs) | Source: [analytics.usa.gov/health-human-services](https://analytics.usa.gov/health-human-services) (Digital Analytics Program) | Methodology: Lighthouse + axe-core | Date: 2026-05-13*
