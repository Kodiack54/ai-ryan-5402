# Ryan - AI Project Manager
**Port:** 5402  
**Role:** Strategic project oversight across the NextBid/Kodiack ecosystem  
**Version:** 1.0.0  

---

## What Ryan Does

Ryan is the project management brain that:
- Tracks **8 projects** and their phases
- Understands **cross-project dependencies** (can't do X until Y is complete)
- On-demand answers **"what's next?"** based on all available data
- Provides **briefings to Claude** at session start via Susan

---

## The 8 Projects

| # | Project | Purpose | Status |
|---|---------|---------|--------|
| 1 | **Kodiack Studios** | Dev platform - Studio + Dashboard + AI team | Active |
| 2 | **NextBid Core** | Infrastructure - authenticator, gateway, patcher | Active |
| 3 | **NextBid Engine** | 20 tradelines for gov/state/federal/local bid discovery | Active |
| 4 | **NextBid Portal** | Full CRM - user-facing bid management | Active |
| 5 | **NextBid Sources** | Finding/authenticating procurement portals | Active |
| 6 | **NextBidder** | Goods auction - GSA price comparison | Pending |
| 7 | **NextTech** | Field ops - job assignment, SOP, tracking | Pending |
| 8 | **NextTask** | MMO-style task system - feeds AI with real data | Pending |

### Data Flow
```
Sources → finds portals → Engine
Engine → finds opportunities → Portal  
Portal → manages bids → uses NextTask data for proposals
NextBidder → finds goods deals → integrates with proposals
NextTech → tracks field work → feeds NextTask
NextTask → gathers real intel → makes AI proposal writer smarter
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/status` | Full status of all projects/phases |
| GET | `/api/whats-next` | Ryan's recommendation for next focus |
| POST | `/api/complete` | Mark current focus complete, get next |
| GET | `/api/project/:id/phases` | Get phases for a project |
| POST | `/api/project/:id/phase` | Add a phase |
| PATCH | `/api/phase/:id` | Update phase status |
| POST | `/api/dependency` | Add dependency between phases |
| GET | `/api/tradelines` | Get all tradelines with status |
| PATCH | `/api/tradeline/:id` | Update tradeline status |
| GET | `/api/briefing` | Full briefing for Claude |

---

## Database Tables

- `dev_project_phases` - Milestones for each project
- `dev_phase_dependencies` - Cross-project blocking relationships
- `dev_tradelines` - Engine sub-items (20 tradelines)
- `dev_current_focus` - Ryan's active directives

---

## Project Phases

### 1. Kodiack Studios
- [x] Phase 1: Dev Dashboard base
- [x] Phase 2: Dev Studio + AI team
- [ ] Phase 3: Ryan project management ← **IN PROGRESS**
- [ ] Phase 4: Full CI/CD pipeline

### 2. NextBid Core
- [x] Phase 1: Authenticator
- [x] Phase 2: Gateway
- [ ] Phase 3: Patcher/deployment system
- [ ] Phase 4: Multi-droplet orchestration

### 3. NextBid Engine
- [x] Stage 1: Single tradeline discovery (Low Voltage live)
- [ ] Stage 2: Multi-tradeline support (5 tradelines, monitor 1 week)
- [ ] Stage 3: Canonizer - duplicate detection
- [ ] Stage 4: AI-assisted proposal data extraction

### 4. NextBid Portal
- [ ] Phase 1: Discovery filters UI *(depends: Engine Stage 2)*
- [ ] Phase 2: Bid detail pages + pipeline view
- [ ] Phase 3: Proposal writing workflow
- [ ] Phase 4: AI proposal integration *(depends: NextTask Phase 2)*

### 5. NextBid Sources
- [~] Phase 1: Portal discovery (~50 authenticated, 350+ in CA)
- [ ] Phase 2: Bulk authentication/validation
- [ ] Phase 3: Integration with Engine *(depends: Engine Stage 2)*
- [ ] Phase 4: Auto-add to live tradelines

### 6. NextBidder (Pending)
- [ ] Phase 1: GSA price scraping *(trigger: Portal Phase 2)*
- [ ] Phase 2: Distributor price comparison
- [ ] Phase 3: Margin calculator + deal flagging
- [ ] Phase 4: Auto-bid recommendations

### 7. NextTech (Pending)
- [ ] Phase 1: Job assignment system *(trigger: Portal Phase 3)*
- [ ] Phase 2: SOP gathering interface
- [ ] Phase 3: Field worker tracking
- [ ] Phase 4: Job completion reporting → NextTask

### 8. NextTask (Pending)
- [ ] Phase 1: Task definition system *(trigger: NextTech Phase 1)*
- [ ] Phase 2: Worker task assignment (MMO-style)
- [ ] Phase 3: Data collection (competitor prices, install times)
- [ ] Phase 4: AI training data pipeline → Portal proposals

---

## Tradelines (20 Total)

| Tradeline | Status | Port | Notes |
|-----------|--------|------|-------|
| Low Voltage | LIVE | 5101 | Working great |
| *19 others* | Pending | TBD | Add as Engine scales |

---

## Implementation Roadmap

### Phase 1: Core Infrastructure ✓
- [x] Database tables created
- [x] Base structure (config, db, logger)
- [x] Health endpoint
- [x] Status endpoint

### Phase 2: Phase Management (Current)
- [ ] Phase CRUD endpoints
- [ ] Dependency management
- [ ] Tradeline tracking

### Phase 3: Intelligence
- [ ] Priority engine ("what's next" algorithm)
- [ ] Dependency checker
- [ ] Bug/blocker integration

### Phase 4: Integration
- [ ] Briefing endpoint
- [ ] Susan integration
- [ ] Seed all 8 projects with phases

### Phase 5: UI (Future)
- [ ] Project roadmap visualization in Studio
- [ ] Phase status updates from UI
- [ ] Dependency graph view

---

## How "What's Next" Works

When asked `/api/whats-next`, Ryan:

1. Gets all projects and their phases
2. Filters to phases that are `pending` or `in_progress`
3. Checks dependencies - removes phases whose blockers aren't `complete`
4. Checks for critical bugs blocking progress
5. Considers tradeline stability (if testing, needs monitoring time)
6. Returns prioritized recommendation with rationale

---

## Integration with Susan

Susan's `/api/context` calls Ryan's `/api/briefing` to include:
- Current focus project/phase
- What's blocked and why
- Recent completions
- Next 2-3 priorities

This gives Claude strategic context at every session start.

---

## File Structure

```
ryan-5402/
├── index.js                 # Entry point
├── package.json             # Dependencies
├── PLAN.md                  # This file
├── .env                     # Configuration
├── pm2.config.js            # Process manager
├── sql/
│   └── tables.sql           # Database schema
└── src/
    ├── lib/
    │   ├── config.js        # Environment config
    │   ├── db.js            # Supabase client
    │   └── logger.js        # Logging
    ├── routes/
    │   ├── index.js         # Route aggregator
    │   ├── health.js        # Health check
    │   ├── status.js        # Full status
    │   ├── whatsNext.js     # Recommendations
    │   ├── phases.js        # Phase CRUD
    │   ├── dependencies.js  # Dependency mgmt
    │   ├── tradelines.js    # Tradeline tracking
    │   └── briefing.js      # Claude briefing
    └── services/
        ├── priorityEngine.js    # "What's next" algorithm
        └── dependencyChecker.js # Blocker detection
```

---

*Last updated: December 2024*
