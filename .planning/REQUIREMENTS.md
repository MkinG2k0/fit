# Requirements: MagFitDiary

**Defined:** 2026-04-14
**Core Value:** A beginner can log each workout quickly and clearly, and see measurable progress in weight and reps without friction.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Logging

- [ ] **LOG-01**: User can log a set with weight and reps in 1-2 actions during a workout
- [ ] **LOG-02**: User can add multiple sets to the same exercise in one workout session
- [ ] **LOG-03**: User can edit or delete any logged set before finishing the session
- [ ] **LOG-04**: User sees previous set values suggested when logging the same exercise

### Categories

- [ ] **CAT-01**: User can select exercises from a predefined category list
- [ ] **CAT-02**: User can filter exercise list by selected category
- [ ] **CAT-03**: User can create a custom category for exercises
- [ ] **CAT-04**: User can assign an exercise to one category at creation or edit time

### Progress

- [ ] **PROG-01**: User can view weight trend chart for a selected exercise
- [ ] **PROG-02**: User can view reps trend chart for a selected exercise
- [ ] **PROG-03**: User can switch chart period between week, month, and all time
- [ ] **PROG-04**: User sees explicit empty state when there is not enough data for charts

### History

- [ ] **HIST-01**: User can view list of past workouts grouped by date
- [ ] **HIST-02**: User can navigate workouts in calendar view
- [ ] **HIST-03**: User can open any day and view workout details (exercises and sets)

### Data

- [ ] **DATA-01**: User data persists locally between browser sessions
- [ ] **DATA-02**: User can export workout data in JSON format
- [ ] **DATA-03**: User can export workout data in CSV format
- [ ] **DATA-04**: User can import data from backup file without app crash

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Account and Sync

- **SYNC-01**: User can create account and sign in
- **SYNC-02**: User data can sync across devices
- **SYNC-03**: User can resolve local/cloud data conflicts safely

### Templates and Guidance

- **TMPL-01**: User can start from ready-made workout templates
- **TMPL-02**: User receives rule-based progression suggestions
- **TMPL-03**: User can receive weekly summary digest

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social feed / likes / subscriptions | Does not improve core quick-log value in v1 |
| Advanced metrics by default (RPE/RIR/readiness) | Increases complexity for beginner audience |
| Native mobile apps | Web-first release is prioritized |
| AI-generated training plans in v1 | High complexity and low confidence for first release |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LOG-01 | Phase 1 | Pending |
| LOG-02 | Phase 1 | Pending |
| LOG-03 | Phase 1 | Pending |
| LOG-04 | Phase 1 | Pending |
| CAT-01 | Phase 2 | Pending |
| CAT-02 | Phase 2 | Pending |
| CAT-03 | Phase 2 | Pending |
| CAT-04 | Phase 2 | Pending |
| PROG-01 | Phase 4 | Pending |
| PROG-02 | Phase 4 | Pending |
| PROG-03 | Phase 4 | Pending |
| PROG-04 | Phase 4 | Pending |
| HIST-01 | Phase 3 | Pending |
| HIST-02 | Phase 3 | Pending |
| HIST-03 | Phase 3 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 5 | Pending |
| DATA-03 | Phase 5 | Pending |
| DATA-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 after roadmap mapping*
