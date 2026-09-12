# BUILD: DEALR — UNIVERSAL AI MARKETPLACE + BROKER NETWORK

Act as a senior founding engineer, product designer, AI engineer, marketplace architect, and startup CTO.

Build a polished, production-quality MVP called:

# DEALR

**Tagline: Find it. List it. Deal it.**

DEALR is a modern, AI-native, all-purpose marketplace where people and businesses can list, discover, negotiate, buy, sell, rent, hire, or broker almost anything of legitimate value.

Think beyond a traditional classifieds website.

DEALR combines:

- universal listings
- AI listing creation
- conversational AI search
- intelligent buyer/listing matching
- messaging
- offers and negotiation
- optional professional brokers
- seller tools
- buyer tools
- trust and verification
- transaction workflows
- future escrow/payment infrastructure
- future blockchain-backed verification

The long-term goal is to become:

> **The AI transaction layer for the internet.**

A user should eventually be able to say:

> “I need a used work truck under $30K within 50 miles.”

or:

> “Find me a profitable business in North Carolina under $500K.”

or:

> “Find a 2-bedroom apartment near downtown under $2,000.”

or:

> “I need someone to pressure wash my apartment complex.”

or:

> “Find me a Rolex under $8,000 from a verified seller.”

DEALR should understand the request, search the marketplace, rank opportunities and help move the transaction forward.

---

# 1. MVP OBJECTIVE

Build ONE marketplace engine capable of supporting MANY listing categories.

Do not build separate applications for cars, real estate, businesses, services, etc.

Build a flexible universal listing architecture.

The core loop is:

SELLER CREATES LISTING

↓

AI STRUCTURES LISTING

↓

MARKETPLACE INDEXES IT

↓

BUYER DESCRIBES WHAT THEY WANT

↓

AI FINDS & RANKS MATCHES

↓

BUYER CONTACTS SELLER

↓

NEGOTIATION / OFFER

↓

OPTIONAL BROKER ASSISTANCE

↓

TRANSACTION

The MVP must make this loop functional.

---

# 2. CORE CATEGORIES

Launch with these major categories:

## Marketplace

- Electronics
- Furniture
- Fashion
- Collectibles
- Jewelry
- Tools
- General Goods

## Vehicles

- Cars
- Trucks
- Motorcycles
- Boats
- RVs
- Commercial Vehicles

## Real Estate

- Homes for Sale
- Apartments
- Rentals
- Commercial Property
- Land

## Businesses

- Local Businesses
- SaaS
- Websites
- E-commerce
- Routes
- Franchises

## Services

- Home Services
- Contractors
- Cleaning
- Automotive
- Professional Services
- Creative Services
- Technology Services

## Equipment

- Construction
- Restaurant
- Medical
- Manufacturing
- Agricultural
- Commercial Equipment

Design category configuration so new categories can be added without rebuilding the listing system.

---

# 3. UNIVERSAL LISTING SCHEMA

This is extremely important.

Do NOT create a database architecture that assumes every listing is a business.

Every listing should share universal fields:

- id
- seller\_id
- broker\_id optional
- title
- description
- category
- subcategory
- transaction\_type
- price
- currency
- price\_type
- location
- latitude/longitude when available
- condition
- images
- video
- attributes
- verification status
- negotiable
- delivery/shipping options
- created\_at
- updated\_at
- status

Use a flexible structured attribute system for category-specific data.

Example:

VEHICLE:

{
"year": 2021,
"make": "Toyota",
"model": "Tacoma",
"mileage": 42000,
"transmission": "Automatic"
}

REAL ESTATE:

{
"bedrooms": 3,
"bathrooms": 2,
"sqft": 1800,
"property\_type": "Single Family"
}

BUSINESS:

{
"annual\_revenue": 410000,
"sde": 117000,
"employees": 6,
"seller\_financing": true
}

SERVICE:

{
"service\_area": "Charlotte Metro",
"pricing\_type": "Quote",
"insured": true
}

The marketplace engine must understand these attributes dynamically.

---

# 4. TRANSACTION TYPES

Support:

**For Sale**

**For Rent**

**Service Offered**

**Wanted**

**Business Opportunity**

Architect for future:

**Auction**

**Make Me an Offer**

**Trade**

---

# 5. BRAND & DESIGN

Product:

# DEALR

Tagline:

**Find it. List it. Deal it.**

Secondary:

**One marketplace. Anything you need. Powered by AI.**

The design should feel like a modern consumer technology company.

Take broad inspiration from:

- Airbnb
- Linear
- Stripe
- Robinhood
- modern marketplaces

Do not copy any specific product.

Visual principles:

- large intelligent search
- beautiful listing imagery
- strong typography
- generous whitespace
- clean cards
- subtle shadows
- restrained color
- rounded surfaces
- fast interactions
- excellent mobile UX
- minimal clutter

Avoid looking like Craigslist.

Avoid looking like a crypto application.

Avoid excessive gradients.

The product should communicate:

**Trust + discovery + opportunity + speed.**

---

# 6. HOMEPAGE

Hero:

# What are you looking for?

Large conversational search field.

Placeholder rotates between examples:

> “Find me a Toyota Tacoma under $30K near Charlotte.”

> “Find a 2-bedroom apartment under $2,000.”

> “I need someone to pressure wash my driveway.”

> “Find me a profitable business under $500K.”

> “Show me used gaming PCs under $1,000.”

Primary actions:

**Search DEALR**

**List Something**

Below search display category icons/cards.

Then:

### Recommended for You

### Trending Near You

### Recently Listed

### High-Value Deals

### Services Near You

### Businesses for Sale

Do not overwhelm the homepage.

Personalize sections when user preference data exists.

---

# 7. AI SEARCH — CORE DIFFERENTIATOR

Traditional marketplaces force users through filters.

DEALR should allow:

> Tell us what you want.

Example:

> “I need a reliable SUV under $25K, less than 70K miles and preferably Toyota or Honda.”

AI converts this into structured filters.

Another:

> “Find a laundromat within 100 miles of Charlotte under $400K with seller financing.”

Another:

> “I need somebody to install a fence next week.”

Another:

> “Show me a 3-bedroom rental that allows dogs.”

Search architecture:

NATURAL LANGUAGE

↓

INTENT EXTRACTION

↓

CATEGORY DETECTION

↓

STRUCTURED FILTERS

↓

SEMANTIC SEARCH

↓

HARD-CONSTRAINT FILTERING

↓

RANKING

↓

MATCH EXPLANATION

Never let semantic similarity override explicit hard requirements such as maximum price.

---

# 8. AI SEARCH RESULTS

Every result may display:

**93% Match**

But scores MUST be deterministic and based on known criteria.

Show:

### Why this matches

Example vehicle:

- $2,400 below your budget
- Toyota
- 41K miles
- 14 miles away

Example property:

- 3 bedrooms requested
- Pet friendly
- $150 below monthly budget
- 4.2 miles from preferred area

Example business:

- Within acquisition budget
- $120K SDE
- Seller financing available

Never generate random match percentages.

---

# 9. SMART CATEGORY FILTERS

Filters should dynamically change based on category.

VEHICLES:

- make
- model
- year
- mileage
- price
- condition
- drivetrain

REAL ESTATE:

- price
- rent
- beds
- baths
- property type
- sqft
- pets
- parking

BUSINESS:

- asking price
- revenue
- cash flow/SDE
- category
- financing
- location

ELECTRONICS:

- brand
- condition
- model
- price
- shipping

SERVICES:

- service type
- service area
- availability
- pricing
- verified provider

The system must derive filter definitions from category configuration.

---

# 10. LIST SOMETHING WITH AI

Route:

`/sell`

Start with ONE field:

# What are you listing?

Example:

> “2021 Toyota Tacoma TRD with 42k miles. Great condition. Asking $29,500.”

AI extracts:

Category: Vehicle

Make: Toyota

Model: Tacoma

Year: 2021

Mileage: 42,000

Condition: Great

Price: $29,500

Then ask ONLY for missing important information.

Another:

> “3 bedroom house in Charlotte for $425K.”

Automatically switch to real-estate fields.

Another:

> “Pressure washing around Charlotte starting at $150.”

Automatically switch to services.

Another:

> “Cleaning company making $400K/year, asking $250K.”

Automatically switch to business acquisition fields.

AI must NEVER invent missing facts.

---

# 11. AI LISTING CREATOR

AI can generate:

- title
- description
- highlights
- category
- subcategory
- attributes
- tags
- search keywords

Seller must approve generated information before publishing.

AI should identify missing information:

> Adding mileage will help buyers find your vehicle.

> Adding annual revenue will improve business buyer matching.

> Adding square footage may improve your property listing.

This creates category-aware listing assistance.

---

# 12. UNIVERSAL LISTING PAGE

Route:

`/listing/[id]`

Every listing page includes:

- gallery
- title
- price
- location
- seller
- verification
- save
- share
- message
- make offer

Then dynamically render category-specific information.

A vehicle should NOT display business financial metrics.

A property should NOT display mileage.

A business should NOT display bedrooms.

Create reusable category-aware components.

---

# 13. ASK DEALR AI

Every listing has:

# Ask DEALR AI

AI receives actual listing data.

Possible questions:

Vehicle:

> Is this priced reasonably?

Property:

> Does this match what I'm looking for?

Business:

> What's the asking-price-to-SDE multiple?

Electronics:

> Compare these specifications to what I need.

Service:

> Does this provider cover my location?

AI must distinguish:

KNOWN FACT

CALCULATED VALUE

AI ASSESSMENT

UNKNOWN INFORMATION

Never fabricate missing listing data.

---

# 14. WANTED LISTINGS

This is strategically important.

Users can post what they WANT.

Example:

# Wanted

> Looking for Toyota Tacoma under $25K near Charlotte.

or:

> Looking for a landscaping business under $300K.

or:

> Need commercial pressure washing for apartment complex.

Now DEALR can match sellers to buyers instead of relying entirely on buyers finding listings.

AI automatically compares new supply against wanted listings.

This creates a two-way marketplace.

---

# 15. BUYER PREFERENCES

Users can save preferences.

Examples:

- categories
- price ranges
- locations
- brands
- condition
- financing
- property requirements
- vehicle requirements
- business requirements

Use preferences for:

**Recommended for You**

and match scoring.

---

# 16. MATCH ENGINE

Create a generic match engine.

Score components:

### Hard Constraints

Examples:

maximum price

required location

required category

minimum bedrooms

vehicle mileage maximum

### Preferences

Examples:

preferred brand

preferred neighborhood

preferred financing

preferred condition

### Semantic Similarity

Description/query relevance.

Possible scoring model:

Hard constraint compatibility: 50%

Structured preferences: 30%

Semantic relevance: 20%

Adjust configuration by category.

Expose:

**Why this matches**

and:

**Potential mismatches**

---

# 17. MESSAGING

Build internal messaging.

Every conversation attaches to:

- listing
- buyer
- seller
- optional broker

Support:

- messages
- timestamps
- unread status
- listing preview
- offer references

Reliable persistence matters more than unnecessary complexity.

---

# 18. UNIVERSAL OFFER SYSTEM

Allow:

# Make an Offer

Core fields:

- offer amount
- message
- expiration optional

Category-specific additions may appear.

Vehicle:

- trade-in optional

Real estate:

- financing
- closing timeline

Business:

- cash at closing
- seller financing
- due diligence

Services:

- proposed budget
- requested date

Seller can:

**Accept for Discussion**

**Counter**

**Decline**

Track negotiation history.

Where appropriate state:

**Offers made through DEALR may be non-binding unless the parties execute a separate binding agreement.**

Do not pretend DEALR itself creates legally binding contracts unless that capability actually exists.

---

# 19. AI NEGOTIATION ASSISTANT

AI can help users formulate offers.

Example:

> Seller wants $12,000.

> Similar listing data and your stated budget suggest opening around $10,500.

For high-value transactions:

> Asking: $350K

> Offer: $300K

> Potential compromise structures could include financing, contingencies or staged payments.

AI provides suggestions.

AI NEVER automatically accepts offers.

Human approval is mandatory.

---

# 20. BROKER NETWORK

Brokers are OPTIONAL.

Not every transaction needs one.

Allow categories/listings to enable:

# Broker Assistance Available

High-value categories might include:

- businesses
- real estate
- commercial equipment
- luxury assets
- large B2B transactions

A buyer or seller can press:

**Get Broker Help**

The system creates a broker lead.

---

# 21. BROKER MARKETPLACE

Create broker profiles.

Fields:

- name
- photo
- specialties
- categories
- locations
- transactions completed
- verification
- rating
- commission structure where applicable

Users may request a broker.

Future architecture can automatically match brokers based on:

- category
- geography
- transaction size
- performance
- availability

---

# 22. BROKER DASHBOARD

Route:

`/broker`

Pipeline:

NEW LEAD

↓

CONTACTED

↓

QUALIFIED

↓

NEGOTIATING

↓

DUE DILIGENCE

↓

CLOSING

↓

WON / LOST

Each opportunity includes:

- listing
- buyer
- seller
- transaction value
- offer
- stage
- last activity
- match score
- potential commission
- recommended next action

---

# 23. AI BROKER COPILOT

Provide:

# Today's Opportunities

AI identifies:

- hottest buyers
- stalled negotiations
- unanswered messages
- new matches
- strong wanted/listing combinations
- deals close to agreement
- missing information

Example:

> Buyer offered $24,500 on a vehicle listed at $27,000.

Suggested action:

> Ask seller whether $25,500 would close today.

Another:

> Business buyer meets 91% of seller criteria and has viewed financials repeatedly.

Suggested action:

> Contact buyer and qualify financing.

AI recommends.

Human decides.

---

# 24. TRUST & VERIFICATION

Support verification states.

Examples:

**Identity Verified**

**Ownership Verified**

**Business Verified**

**Professional Verified**

**Broker Verified**

**Financials Verified**

**Vehicle Information Verified**

Never display verification unless backed by actual application state.

---

# 25. REPORTING & SAFETY

Users must be able to:

- report listing
- report seller
- block user
- flag suspicious messages

Admin can:

- review reports
- remove listing
- suspend user
- mark suspicious activity
- manage verification

Build basic anti-spam controls.

---

# 26. AUTHENTICATION

Support:

- email/password
- Google if convenient

A user can simultaneously be:

- buyer
- seller
- service provider
- broker

Do NOT force rigid single-role accounts.

---

# 27. DASHBOARD

Route:

`/dashboard`

Sections:

### Buying

Saved

Messages

Offers

Wanted Listings

Recommended

### Selling

Active Listings

Drafts

Views

Saves

Messages

Offers

### Broker

Only when applicable.

---

# 28. DATABASE

Create a robust category-agnostic relational architecture.

Suggested core entities:

users

profiles

categories

category\_attributes

listings

listing\_attributes

listing\_media

saved\_listings

wanted\_listings

buyer\_preferences

matches

conversations

conversation\_participants

messages

offers

offer\_history

broker\_profiles

broker\_leads

deals

deal\_activities

verification\_records

reports

documents

ai\_interactions

analytics\_events

Use PostgreSQL JSONB selectively for flexible attributes.

Do not put everything into one JSON blob.

Important searchable values should remain indexable.

---

# 29. SEARCH ARCHITECTURE

Support:

### Traditional Search

Keyword + filters

### Semantic Search

Embeddings

### AI Search

Natural language → structured query

### Recommendation Engine

Preferences + behavior + listing similarity

### Wanted Matching

Buyer demand → seller inventory

Use PostgreSQL + pgvector initially.

Do not introduce unnecessary infrastructure.

---

# 30. LOCATION

Location-aware discovery should support:

- city
- state
- ZIP/postal code
- radius
- remote
- shipping
- nationwide

Examples:

**Near Me**

**Within 10 miles**

**Within 50 miles**

**Nationwide**

**Remote**

Do not expose exact private addresses unnecessarily.

---

# 31. MAP VIEW

For geographically relevant categories, provide optional map/list view.

Useful for:

- real estate
- vehicles
- services
- local goods
- businesses

Do not show maps where location provides little value.

---

# 32. MONETIZATION

Prepare architecture for multiple revenue models.

## Featured Listings

Seller pays for exposure.

## Broker Success Fees

Commission when appropriate and legally permitted.

## DEALR Pro

Professional seller tools.

## Broker Pro

Lead management and AI tools.

## Transaction Services

Future payment/escrow fees.

## Advertising

Future promoted listings.

MVP should remain Stripe-ready.

Do not overbuild billing.

---

# 33. BLOCKCHAIN LAYER

Blockchain should NOT dominate the UX.

Do NOT require wallets for normal marketplace use.

Architect future support for:

- listing provenance
- document hashes
- ownership records
- transaction timestamps
- offer audit trail
- verified transaction history
- escrow
- tokenized assets where legally permitted

To users this should eventually appear as:

**Verified Transaction Record**

rather than crypto jargon.

For MVP, an internal tamper-evident audit log is sufficient.

---

# 34. DEMO MARKETPLACE

Seed at least 30 realistic fictional listings across categories.

Include examples such as:

### Vehicles

Toyota Tacoma

Honda Civic

Ford F-150

### Real Estate

Charlotte apartment

Single-family home

Commercial storefront

### Businesses

Cleaning company

Laundromat

SaaS company

ATM route

### Electronics

Gaming PC

MacBook

Camera

### Services

Pressure washing

Web development

House cleaning

Landscaping

### Equipment

Commercial oven

Excavator

Pressure washer

### Collectibles/Luxury

Watch

Trading card

Designer item

Use fictional sellers.

Do not imply real businesses or individuals are participating.

---

# 35. MODERN UI DETAILS

Implement:

- instant search
- command-style AI search
- skeleton loading
- image galleries
- responsive cards
- saved-item animation
- sticky mobile actions
- filter drawer
- AI assistant drawer
- messaging UI
- notification indicators
- dashboard analytics
- beautiful empty states

Performance should feel fast.

---

# 36. TECH STACK

Preferred:

Next.js latest stable App Router

TypeScript

Tailwind CSS

shadcn/ui

Supabase

PostgreSQL

pgvector

OpenAI-compatible LLM abstraction

Stripe-ready architecture

Vercel

Use server-side validation.

Never expose secrets client-side.

---

# 37. ANALYTICS

Track:

listing\_created

listing\_published

listing\_viewed

listing\_saved

search\_performed

ai\_search\_performed

wanted\_listing\_created

match\_generated

message\_sent

offer\_submitted

offer\_countered

broker\_requested

broker\_lead\_created

deal\_created

deal\_stage\_changed

deal\_won

These events will determine whether marketplace liquidity is improving.

---

# 38. NORTH STAR METRIC

Primary:

# Successful Buyer ↔ Seller Connections

Supporting metrics:

Listings

Wanted Listings

Search → Listing CTR

Listing → Message conversion

Message → Offer conversion

Offer → Transaction conversion

Time to first inquiry

Time to first offer

Broker-assisted close rate

Do not optimize vanity metrics over transactions.

---

# 39. MARKETPLACE LIQUIDITY ENGINE

DEALR should not behave like a passive classifieds board.

Whenever a new listing is created:

1. Identify compatible Wanted listings.
2. Identify users with matching preferences.
3. Calculate matches.
4. Surface the listing to relevant users.

Whenever a Wanted listing is created:

1. Search existing inventory.
2. Calculate matches.
3. Recommend the best listings.
4. Continue matching against future listings.

This creates:

SUPPLY → DEMAND

and

DEMAND → SUPPLY

The system should actively create market liquidity.

---

# 40. MVP SUCCESS LOOP

Optimize around:

LIST SOMETHING

↓

AI STRUCTURES IT

↓

PUBLISH

↓

MATCH

↓

DISCOVER

↓

MESSAGE

↓

OFFER

↓

NEGOTIATE

↓

TRANSACT

↓

REPUTATION / REPEAT

Broker intervention is optional:

HIGH VALUE / COMPLEX DEAL

↓

BROKER REQUEST

↓

AI + HUMAN CLOSING

---

# 41. EXECUTION ORDER

Build:

1. Design system
2. Universal schema
3. Category configuration
4. Seed marketplace
5. Homepage
6. Marketplace
7. Dynamic filters
8. Listing page
9. AI listing creator
10. Authentication
11. Seller dashboard
12. AI search
13. Match engine
14. Wanted listings
15. Messaging
16. Offers
17. AI listing assistant
18. Broker network
19. Broker dashboard
20. Admin
21. Trust/reporting
22. Mobile polish
23. Analytics
24. Production verification

Test after every major stage.

---

# 42. BUILD REQUIREMENTS

Do NOT merely generate mock screens.

Build working functionality.

Critical buttons must work.

Forms must persist.

Search must search.

Filters must filter.

Messages must persist.

Offers must persist.

Matches must be calculated.

Authentication must protect private data.

Role/ownership authorization must exist server-side.

Production build must pass.

If something cannot be implemented fully, implement the simplest REAL version.

Do not fake functionality.

---

# 43. GAUNTLET LOOP

After implementation automatically enter:

# GAUNTLET MODE

Loop:

BUILD

↓

RUN

↓

TEST

↓

ATTACK

↓

BREAK

↓

DIAGNOSE ROOT CAUSE

↓

FIX

↓

REGRESSION TEST

↓

REPEAT

Do not stop because the first build succeeds.

---

# 44. UNIVERSAL CATEGORY GAUNTLET

The marketplace must successfully handle fundamentally different listings.

Create and test:

### Vehicle

2021 Toyota Tacoma

$29,500

42K miles

Charlotte

### Property

3-bedroom house

$425,000

Charlotte

### Business

Queen City Commercial Cleaning

$265,000 asking

$410K revenue

$117K SDE

Seller financing

### Service

Pressure Washing

Starting at $150

Charlotte metro

### Electronics

Gaming PC

$1,200

Used — Excellent

### Wanted

Toyota Tacoma

Maximum $25K

Within 50 miles

The SAME marketplace infrastructure must support all six.

If category-specific assumptions break another category:

FIX THE ARCHITECTURE.

Do not patch each listing individually.

---

# 45. AI SEARCH GAUNTLET

Test:

> Find me a Toyota truck under $30K.

Expected:

Tacoma should rank strongly.

Test:

> Find me a three-bedroom house around Charlotte under $450K.

Expected:

House should rank strongly.

Test:

> Find me a business under $300K making at least $100K cash flow.

Expected:

Queen City Commercial Cleaning should rank strongly.

Test:

> Find somebody to pressure wash my driveway.

Expected:

Pressure Washing service.

Test:

> Find me a gaming PC under $1,500.

Expected:

Gaming PC.

Hard constraints must be respected.

A $40K truck must NOT receive a strong match for a $30K maximum merely because its description is semantically similar.

---

# 46. SELLER GAUNTLET

Test listing creation using natural language.

Attempt:

- missing price
- no image
- strange punctuation
- dollar signs
- commas
- long text
- extremely short text
- wrong category suggestion
- edit
- unpublish
- republish
- refresh

AI must request important missing information instead of inventing it.

---

# 47. AI TRUTH GAUNTLET

Ask AI questions whose answers exist.

Then ask questions whose answers DO NOT exist.

Example vehicle:

> Has this truck ever been in an accident?

If accident history is unavailable:

AI MUST say it does not know.

Property:

> Does this house have foundation damage?

Unknown means unknown.

Business:

> What was 2023 net profit?

If unavailable, do not infer a fake number.

Trust is more important than producing an answer.

---

# 48. OFFER GAUNTLET

Submit valid offers.

Then test:

- $0
- negative amount
- malformed input
- duplicate submission
- unauthorized offer modification
- seller trying to offer on own listing
- deleted listing
- expired listing

Invalid states must fail cleanly.

---

# 49. PERMISSION GAUNTLET

Attempt:

- edit another seller's listing
- read private messages
- modify another buyer's offer
- access broker data
- access admin
- manipulate listing ownership from client
- manipulate verification state

Authorization must be enforced server-side.

UI hiding is NOT authorization.

---

# 50. MARKETPLACE GAUNTLET

Test:

- no results
- thousands of theoretical listings
- missing images
- deleted sellers
- incomplete attributes
- category changes
- unusual prices
- location missing
- pagination
- sorting
- filtering
- AI search failure

No blank pages.

No crashes.

---

# 51. MOBILE GAUNTLET

Test approximately:

375px

430px

768px

Desktop

Verify:

- homepage
- search
- filters
- cards
- listing
- AI assistant
- sell wizard
- messages
- offers
- dashboard
- broker pipeline

Important actions must remain accessible.

---

# 52. BROKER GAUNTLET

Request broker assistance on a high-value listing.

Verify:

USER REQUESTS BROKER

↓

LEAD CREATED

↓

BROKER RECEIVES LEAD

↓

BROKER OPENS DEAL

↓

AI SUMMARIZES OPPORTUNITY

↓

BROKER CHANGES STAGE

↓

STATE PERSISTS

Broker functionality must NOT interfere with ordinary peer-to-peer listings.

---

# 53. LIQUIDITY GAUNTLET

Create Wanted listing:

> Toyota Tacoma under $30K near Charlotte.

Then publish compatible Tacoma.

System should identify a match.

Reverse test:

Publish listing first.

Then create Wanted request.

System should also identify the match.

Matching must work:

**Supply → Demand**

AND

**Demand → Supply**

---

# 54. GAUNTLET SCORING

Score 0–10:

Build Stability

Universal Listing Architecture

Category Flexibility

Search

AI Search

Match Accuracy

Seller UX

Buyer UX

Messaging

Offers

Broker Workflow

Authorization

Data Integrity

AI Truthfulness

Mobile

Visual Polish

Marketplace Liquidity

Revenue Readiness

Any score below 9:

Identify highest-impact deficiency.

Fix it.

Retest.

Rescore.

Do not inflate scores.

---

# 55. CRITICAL FAILURE

Critical failure includes:

- build failure
- crash
- authentication bypass
- unauthorized data access
- listing cannot publish
- search fails
- wrong category corrupts listing
- messages disappear
- offers disappear
- match engine ignores hard constraints
- AI invents material listing facts
- broker workflow breaks
- mobile primary flow unusable

If ANY exists:

DO NOT DECLARE COMPLETE.

---

# 56. ROOT-CAUSE RULE

When something breaks:

1. Reproduce.
2. Find root cause.
3. Fix architecture or implementation.
4. Search for same issue elsewhere.
5. Retest.
6. Regression test.

Do not repeatedly patch symptoms.

---

# 57. FINAL BOSS

Simulate THREE complete marketplace transactions.

## TRANSACTION A — SIMPLE P2P

Seller lists:

2021 Toyota Tacoma

$29,500

Buyer searches:

> Toyota truck under $30K near Charlotte.

Buyer:

- discovers
- opens
- saves
- messages
- offers $27,500

Seller:

- receives offer
- counters $28,500

Buyer:

- receives counter

PASS.

---

## TRANSACTION B — SERVICE

Provider lists:

Pressure Washing

Charlotte Metro

Starting $150

Buyer searches:

> I need someone to pressure wash my driveway.

Buyer:

- discovers provider
- messages
- requests service

Provider:

- receives inquiry
- responds

PASS.

---

## TRANSACTION C — BROKER-ASSISTED

Seller lists:

Queen City Commercial Cleaning

$265K

$410K revenue

$117K SDE

Buyer searches:

> Business under $300K with $100K+ cash flow and seller financing.

Buyer:

- discovers listing
- asks AI
- messages
- offers $235K
- requests broker assistance

Broker:

- receives lead
- sees listing
- sees buyer
- sees offer
- receives AI summary
- moves deal to negotiation

PASS.

---

# 58. PERSISTENCE FINAL BOSS

After completing all transactions:

REFRESH.

Verify everything remains.

LOG OUT.

LOG BACK IN.

Verify:

- listings
- saved items
- wanted listings
- conversations
- messages
- offers
- counters
- broker leads
- pipeline stages

All must persist.

---

# 59. EXIT CRITERIA

The MVP is complete ONLY when:

Production build passes

AND

No critical failures remain

AND

P2P Final Boss passes

AND

Service Final Boss passes

AND

Broker Final Boss passes

AND

Persistence passes

AND

Authorization passes

AND

AI truthfulness passes

AND

Supply ↔ Demand matching passes

AND

Mobile core flows pass

AND

Every Gauntlet category scores ≥9/10.

Otherwise:

# LOOP AGAIN.

---

# 60. COMPLETION REPORT

Only after exit criteria pass output:

# DEALR MVP — GAUNTLET PASSED

Build: PASS

Universal Marketplace: PASS

P2P Transaction: PASS

Service Transaction: PASS

Broker Transaction: PASS

AI Search: PASS

Matching: PASS

Wanted Matching: PASS

Authentication: PASS

Authorization: PASS

Persistence: PASS

Mobile: PASS

Then provide:

- scores
- bugs discovered
- bugs fixed
- remaining non-critical limitations
- required environment variables
- database setup
- demo accounts
- deployment instructions
- production URL if actually deployed

Never claim something was tested when it was not.

---

# FINAL INSTRUCTION

Start building immediately.

Do not ask unnecessary clarification questions.

Make reasonable product decisions autonomously.

Do not optimize exclusively for one category.

Whenever implementation creates tension between categories, prefer the reusable marketplace abstraction.

DEALR is not:

**a business marketplace with extra categories.**

DEALR is:

# A UNIVERSAL MARKETPLACE ENGINE.

AI should make listing and discovery dramatically easier.

Wanted listings should expose demand.

Matching should connect supply with demand.

Brokers should enter when human dealmaking creates value.

Blockchain should remain invisible until it solves a genuine trust or transaction problem.

The product is not finished because the screens look good.

It is finished when real users can:

**LIST → FIND → MATCH → MESSAGE → OFFER → NEGOTIATE**

across fundamentally different categories.

Then survive the Gauntlet.

# BUILD IT.

# BREAK IT.

# FIX IT.

# LOOP.

# SHIP IT.