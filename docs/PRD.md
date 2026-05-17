# Horizon Zero PRD

## Bilingual Product Principle

- Every user-facing experience should support both English and Chinese.
- The default homepage includes an EN/CN toggle at the top right.
- Core concepts such as `Horizon Day1`, low-budget freedom, and full-budget freedom must be written clearly in both languages.

## 1. Vision

Horizon Zero helps users plan `Horizon Day1`: the practical date when they can start a sustainable, liberated lifestyle based on spending needs, savings trajectory, and life priorities.

Core thesis:

- Freedom is date-based, not vanity-net-worth based.
- Users can choose between:
  - `Low-budget freedom` (simplified lifestyle, faster timeline)
  - `Full-budget freedom` (maintained lifestyle, higher income/savings target)

## 2. Problem Statement

Many people understand retirement as an abstract amount of money, but cannot answer:

- When can I stop compulsory work?
- How does my city, family situation, and lifestyle change my target?
- What exact actions move my timeline forward?

Horizon Zero provides an explainable answer and a repeatable plan.

## 3. Target Users

Primary users:

- China-based professionals and creators across income bands.
- Chinese-speaking users seeking practical, localized retirement planning.

Secondary users:

- Global FIRE users interested in date-based planning and lifestyle trade-offs.

## 4. Goals and Non-Goals

### Goals

- Generate a clear Day1 date from user profile and assumptions.
- Offer scenario analysis (base/optimistic/stress).
- Explain the action gap and how to close it.
- Localize assumptions for China context.

### Non-Goals (MVP)

- Direct brokerage execution.
- Personalized tax/legal advice.
- Guaranteed-return claims.

## 5. Inputs

Required:

- Age
- City
- Sex
- Marital status
- Dependents
- Current savings
- Monthly after-tax income
- Monthly expenses
- Housing status
- Desired lifestyle budget
- Risk tolerance

Optional:

- Expected pension/social insurance income
- Commercial pension plans
- Side-income expectation
- Healthcare assumptions
- One-off future expenses

## 6. Outputs

- Day1 projected date
- Required nest egg (with multiplier)
- Financial gap and recommended monthly delta
- Scenario confidence and assumptions summary
- Share-friendly anonymized snapshot

## 7. Product Principles

- Explainable math over black-box output
- User autonomy: adjust assumptions and see impact instantly
- Privacy-first defaults and anonymized sharing
- Compliance-safe language and disclaimers

## 8. Method and Logic

Deterministic baseline:

- Annual spending = monthly spending x 12
- Required capital = annual spending x multiplier
- Default multiplier = 25x

Projection model (MVP):

- Monthly contribution from current surplus
- Annualized growth assumption
- Inflation-adjusted target

Advanced model (Phase 2):

- Monte Carlo return paths
- Sequence risk stress testing
- Dynamic spending policies

## 9. China Localization Requirements

- Contextualize with 社保, 公积金, 企业年金, and commercial pension options
- City-tier living-cost presets and healthcare risk presets
- Clear disclaimer:
  - Educational planning tool only
  - Not investment, tax, or legal advice
- Avoid guarantee language and product-pushing claims

## 10. User Journey

1. Input profile and goals
2. Receive Day1 date and action plan
3. Adjust assumptions and compare scenarios
4. Save result and share anonymized card
5. Revisit monthly for iteration

## 11. MVP Scope (Current Build)

- Single-page planner UI
- Day1 deterministic engine
- Optional Supabase save endpoint
- Strategy docs and roadmap in repo

## 12. Success Metrics

- Profile completion rate
- Scenario rerun rate
- Saved-plan rate
- Returning users after 30 days
- Share conversion rate (anonymized)

## 13. Risks

- Oversimplified assumptions can mislead users
- China policy changes may quickly stale content
- Users may interpret projections as guaranteed outcomes

Mitigations:

- Assumption transparency
- Regular localization updates
- Explicit risk and uncertainty messaging
