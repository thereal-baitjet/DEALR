# 32. GAUNTLET LOOP — AUTONOMOUS BUILD, TEST, BREAK, FIX

After implementing the MVP, DO NOT stop after the first successful build.

Enter **GAUNTLET MODE**.

The purpose of the Gauntlet is to force the application through repeated adversarial testing and repair cycles until the critical DEALR transaction loop works reliably.

Use this autonomous loop:

BUILD

↓

RUN

↓

TEST

↓

ATTACK

↓

IDENTIFY FAILURES

↓

FIX ROOT CAUSES

↓

RETEST

↓

POLISH

↓

REPEAT

Do not ask the user for permission between cycles.

Continue until the exit criteria defined below are satisfied.

---

## GAUNTLET 1 — BUILD INTEGRITY

Run the complete production build.

Check for:

- TypeScript errors
- compilation errors
- dependency errors
- broken imports
- invalid routes
- hydration errors
- environment-variable problems
- database errors
- API errors
- console errors
- warnings that indicate real problems

Fix all critical failures.

Run the build again.

Do not continue until the application builds successfully.

---

## GAUNTLET 2 — ROUTE CRAWL

Visit every important route.

At minimum test:

- `/`
- `/marketplace`
- `/sell`
- `/dashboard`
- `/broker`
- `/login`
- `/signup`
- `/listing/[valid-id]`
- `/listing/[invalid-id]`
- admin routes
- messaging routes
- offer flows

Check:

- page loads
- navigation
- authentication
- authorization
- responsive layout
- missing data
- loading states
- error states
- browser console

Fix every critical problem found.

---

## GAUNTLET 3 — SELLER ATTACK

Act as a real seller who does not understand the product.

Attempt to create:

**Queen City Commercial Cleaning**

Charlotte, NC

Asking price: $265,000

Revenue: $410,000

SDE: $117,000

Seller financing: available

Try:

- incomplete fields
- strange formatting
- dollar signs
- commas
- missing image
- long descriptions
- short descriptions
- going backward in wizard
- refreshing
- editing after creation
- publishing
- unpublishing
- republishing

Confirm that valid information persists correctly.

AI must NEVER invent missing financial information.

Repair all discovered failures.

---

## GAUNTLET 4 — BUYER ATTACK

Create a buyer profile.

Use:

Budget: $300,000

Available cash: $100,000

Location: Charlotte

Minimum SDE: $100,000

Seller financing: preferred

Search:

> Find me a Charlotte business under $300K producing at least $100K cash flow with seller financing.

Queen City Commercial Cleaning should rank as a strong match.

Test:

- normal search
- AI search
- filters
- sorting
- saving
- unsaving
- malformed queries
- zero-result searches
- changing preferences

Verify that the match score is deterministic and explainable.

Never use random numbers for match percentages.

---

## GAUNTLET 5 — AI ATTACK

Ask DEALR AI:

> Summarize this opportunity.

Then:

> Is this overpriced?

Then:

> What's the SDE multiple?

Then:

> What are the biggest risks?

Then deliberately ask for information that does not exist:

> What were the company's exact profits in 2022?

The assistant must distinguish between:

- known facts
- calculated metrics
- estimates
- unavailable information

It must not fabricate data.

If AI is unavailable, the product must fail gracefully instead of breaking.

---

## GAUNTLET 6 — OFFER ATTACK

Submit:

Offer price: $235,000

Cash at closing: $100,000

Seller financing requested: $135,000

Due diligence: 30 days

Verify:

- offer persists
- seller receives it
- broker receives it
- buyer can see it
- correct listing is attached
- timestamps work
- status works
- non-binding disclosure appears

Attempt:

- negative offer
- $0 offer
- offer above reasonable numeric limits
- missing fields
- duplicate submission
- unauthorized submission

Reject invalid states cleanly.

---

## GAUNTLET 7 — BROKER ATTACK

Login as broker.

Verify Queen City Commercial Cleaning appears.

Verify buyer appears.

Verify offer appears.

Move deal:

NEW LEAD

→ QUALIFIED

→ DUE DILIGENCE

→ OFFER

→ NEGOTIATION

Confirm every transition persists after refresh.

Calculate potential commission correctly.

Test AI Broker Copilot.

It should recognize:

Asking price: $265K

Offer: $235K

Gap: $30K

It may suggest deal structures but must NEVER accept or modify an offer without human action.

---

## GAUNTLET 8 — PERMISSION ATTACK

Attempt unauthorized actions.

Buyer attempts to:

- edit another seller's listing
- access broker-only information
- access admin
- modify another buyer's offer

Seller attempts to:

- modify another seller's listing
- access unrelated private conversations

Broker attempts to:

- modify deals they do not control

Unauthenticated visitor attempts protected routes.

Enforce authorization SERVER-SIDE wherever appropriate.

Hiding a button is not security.

Repair any permission vulnerability discovered.

---

## GAUNTLET 9 — DATA ATTACK

Test unusual inputs.

Examples:

- `$1,000,000`
- `1000000`
- `0`
- negative numbers
- enormous values
- apostrophes
- quotation marks
- emoji
- HTML
- script-like strings
- extremely long descriptions
- blank strings
- malformed URLs

Prevent:

- application crashes
- broken layouts
- unsafe rendering
- invalid financial calculations
- corrupted database records

Validate important inputs on the server.

---

## GAUNTLET 10 — MOBILE ATTACK

Test major screens at approximately:

375px

430px

768px

Desktop

Verify:

- navigation
- search
- filters
- listing cards
- listing page
- AI assistant
- forms
- messaging
- offers
- dashboards
- broker pipeline

No important action should become inaccessible on mobile.

Fix overflow, clipping and unusable controls.

---

## GAUNTLET 11 — UX ATTACK

Pretend you have never seen DEALR.

Attempt the primary journey without developer knowledge.

At every screen ask:

**What should the user do next?**

There should normally be one obvious primary action.

Remove:

- confusing duplicate CTAs
- dead buttons
- placeholder copy
- unnecessary technical terminology
- fake statistics
- meaningless dashboard elements
- unnecessary steps

Improve:

- hierarchy
- copy
- empty states
- loading states
- success feedback
- error messages
- trust indicators

The product should feel understandable without instructions.

---

## GAUNTLET 12 — REVENUE ATTACK

Evaluate the product from the perspective of a real business broker.

Ask:

> Would this product help me sell a business or qualify buyers faster?

Prioritize features that directly support:

LISTING

→ DISCOVERY

→ QUALIFIED LEAD

→ CONVERSATION

→ OFFER

→ NEGOTIATION

→ CLOSE

Remove or deprioritize functionality that distracts from this loop.

Ensure every qualified inquiry clearly enters the broker pipeline.

---

# GAUNTLET SCORING

After every full cycle, score the application from 0–10 on:

- Build Stability
- Core Functionality
- Marketplace UX
- Seller UX
- Buyer UX
- Broker UX
- AI Reliability
- Data Integrity
- Security
- Mobile UX
- Visual Polish
- Revenue Readiness

Do not inflate scores.

For every category below 9, identify the highest-impact deficiency and fix it.

Then rerun the affected tests.

---

# CRITICAL FAILURE RULE

A critical failure includes:

- application cannot build
- application crashes
- authentication bypass
- unauthorized data access
- listing cannot be created
- marketplace cannot search
- listing cannot be opened
- offer cannot be submitted
- broker cannot receive lead
- deal stage does not persist
- important data disappears after refresh
- AI fabricates financial facts
- core mobile flow is unusable
- primary CTA does nothing

If ANY critical failure exists:

**DO NOT DECLARE THE MVP COMPLETE.**

Fix it and restart the relevant Gauntlet.

---

# ROOT-CAUSE RULE

Do not patch symptoms repeatedly.

When a failure occurs:

1. Reproduce it.
2. Identify the root cause.
3. Fix the underlying problem.
4. Check for the same problem elsewhere.
5. Retest the original failure.
6. Run regression tests on affected flows.

Avoid unnecessary rewrites of functioning systems.

---

# AUTONOMOUS REPAIR RULE

During the Gauntlet:

Do not stop merely because:

- a test failed
- a dependency needs adjustment
- a type error appeared
- the UI needs refinement
- seed data is broken
- a route is incorrect
- an implementation needs restructuring

Diagnose the issue and continue working.

Only request user input when progress genuinely requires an external credential, irreversible business decision, payment, legal authorization, or information that cannot reasonably be inferred.

---

# FINAL BOSS — COMPLETE TRANSACTION SIMULATION

The final test is a complete DEALR transaction.

### Seller/Broker

Create:

**Queen City Commercial Cleaning**

Charlotte, NC

$265K asking price

$410K revenue

$117K SDE

Seller financing available

### Buyer

Search:

> Find me a Charlotte business under $300K producing at least $100K cash flow with seller financing.

Buyer must be able to:

1. Discover Queen City Commercial Cleaning
2. See a strong explainable match
3. Open the listing
4. Review financials
5. Ask DEALR AI questions
6. Save the business
7. Contact the broker
8. Submit a $235K offer
9. Request $135K seller financing

### Broker

Broker must:

10. Receive the lead
11. See buyer information
12. See the offer
13. See the match explanation
14. Receive an AI next-action suggestion
15. Move the opportunity to NEGOTIATION

### Persistence

Refresh the application.

Verify that:

- listing remains
- saved state remains
- conversation remains
- offer remains
- deal remains
- pipeline stage remains

Then log out and back in.

Verify persistence again.

---

# EXIT CRITERIA

The Gauntlet ends only when:

**Production build passes**

AND

**No known critical failures remain**

AND

**Final Boss transaction passes end-to-end**

AND

**All core persistence tests pass**

AND

**All authorization tests pass**

AND

**No major console errors remain**

AND

**Core mobile journey works**

AND

**Every Gauntlet score is at least 9/10**

If these conditions are not satisfied:

**LOOP AGAIN.**

---

# GAUNTLET COMPLETION REPORT

Only after the exit criteria are satisfied, produce a concise report:

### DEALR MVP — GAUNTLET PASSED

**Build:** PASS

**Final Boss:** PASS

**Authentication:** PASS

**Authorization:** PASS

**Persistence:** PASS

**AI:** PASS

**Mobile:** PASS

**Broker Pipeline:** PASS

Then provide:

- final scores
- major bugs discovered and fixed
- remaining non-critical limitations
- environment variables required
- database setup instructions
- deployment instructions
- demo accounts
- exact production URL if deployed

Do not claim PASS for anything that was not actually tested.

---

# FINAL INSTRUCTION

Start building immediately.

Make reasonable product decisions without repeatedly asking for clarification.

After implementation, automatically enter the **GAUNTLET LOOP**.

Do not consider visually complete screens equivalent to a completed product.

The MVP is complete only when the actual seller → buyer → broker → offer → negotiation workflow survives the Gauntlet.

**Build it. Break it. Fix it. Test it again. Ship only when the core loop passes.**