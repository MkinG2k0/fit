# Roadmap: MagFitDiary

## Overview

Roadmap is built around the core user loop: quickly log sets, keep data safe locally, organize exercises with categories, review workout history, and see progress trends by weight/reps. Each v1 requirement is mapped to exactly one phase.

## Phases

- [ ] **Phase 1: Quick Logging Core & Local Persistence** - Fast set logging flow with stable local data between sessions.
- [ ] **Phase 2: Exercise Categories & Assignment** - Category-based exercise selection, filtering, and assignment.
- [ ] **Phase 3: Workout History & Calendar Review** - Date-based history browsing and day-level workout details.
- [ ] **Phase 4: Progress Charts by Exercise** - Weight/reps trends with period switching and explicit empty states.
- [ ] **Phase 5: Data Backup Export/Import** - User-controlled JSON/CSV export and safe backup import.

## Phase Details

### Phase 1: Quick Logging Core & Local Persistence
**Goal**: User can complete the primary workout logging flow quickly and trust that data remains after browser restart.
**Depends on**: Nothing (first phase)
**Requirements**: LOG-01, LOG-02, LOG-03, LOG-04, DATA-01
**Success Criteria** (what must be TRUE):
  1. User can log a set with weight and reps in 1-2 actions during a workout.
  2. User can add multiple sets to one exercise and edit/delete any set before finishing the session.
  3. User sees previous set values suggested when logging the same exercise again.
  4. User closes and reopens browser and still sees saved workout data.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Exercise Categories & Assignment
**Goal**: User can organize and select exercises through a clear category system.
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04
**Success Criteria** (what must be TRUE):
  1. User can choose exercises from a predefined category list.
  2. User can filter exercise list by selected category and see only relevant exercises.
  3. User can create a custom category and use it immediately.
  4. User can assign or change one category for an exercise during create/edit flow.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Workout History & Calendar Review
**Goal**: User can reliably review past workouts by date and inspect day-level details.
**Depends on**: Phase 1
**Requirements**: HIST-01, HIST-02, HIST-03
**Success Criteria** (what must be TRUE):
  1. User can view workout history grouped by date.
  2. User can navigate workouts through calendar view.
  3. User can open any date and inspect workout details with exercises and sets.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Progress Charts by Exercise
**Goal**: User can observe measurable progress in weight and reps for selected exercises.
**Depends on**: Phase 1, Phase 3
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04
**Success Criteria** (what must be TRUE):
  1. User can open weight trend chart for a selected exercise.
  2. User can open reps trend chart for a selected exercise.
  3. User can switch chart period between week, month, and all time.
  4. User sees an explicit empty/no-data state when chart data is insufficient.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Data Backup Export/Import
**Goal**: User can back up and restore workout data safely in a local-first workflow.
**Depends on**: Phase 1, Phase 3
**Requirements**: DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. User can export workout data as a JSON file.
  2. User can export workout data as a CSV file.
  3. User can import a backup file without app crash.
  4. User can continue using restored data after successful import.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Quick Logging Core & Local Persistence | 0/0 | Not started | - |
| 2. Exercise Categories & Assignment | 0/0 | Not started | - |
| 3. Workout History & Calendar Review | 0/0 | Not started | - |
| 4. Progress Charts by Exercise | 0/0 | Not started | - |
| 5. Data Backup Export/Import | 0/0 | Not started | - |
