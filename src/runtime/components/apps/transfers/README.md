# Transit Analyst Components

A comprehensive suite of TypeScript components for analyzing transit station accessibility, pathway connectivity, transfer times, and service patterns in GTFS feeds.

## Overview

The Transit Analyst provides tools for evaluating and visualizing transit system quality, particularly focused on:

- **Transfer Analysis**: Computing realistic transfer times between routes at stations, including walking time through complex station layouts with stairs, elevators, escalators, and fare gates
- **Pathway Routing**: Finding optimal paths through station infrastructure using A* algorithm with multiple accessibility profiles (default, no stairs, wheelchair accessible)
- **Service Headways**: Analyzing service frequency patterns throughout the day for routes and shared segments
- **Station Accessibility**: Evaluating wheelchair-accessible routes and identifying potential barriers
- **Multi-Feed Comparison**: Comparing scenarios across different feed versions (e.g., current vs. proposed service changes)

Originally developed in JavaScript (2020-2024), this codebase was fully migrated to TypeScript in November 2025. The migration included converting Vue components from Options API with mixins to Composition API and refactoring core modules with full type safety.

---

## Core Modules

### 1. `scenario.ts` - Scenario Management

The central orchestrator for all analyst functionality. Manages query parameters, feed version selection, and coordinates GraphQL queries.

**Key Responsibilities:**
- GraphQL query construction and execution
- URL query parameter serialization/deserialization
- Feed version management and validation
- Transfer computation and scoring
- Route filtering by category/subcategory

**Main Data Structures:**
- `Scenario`: Configuration for analysis (feed versions, time window, routing profile, scoring breakpoints)
- `ScenarioResult`: Results of transfer analysis (departures, transfer groups, computed walking times)
- `TransferGroup`: Transfers grouped by incoming trip
- `Transfer`: Individual transfer opportunity with buffer time and walking time

### 2. `graph.ts` - Pathway Routing

Implements A* pathfinding algorithm for computing optimal routes through station infrastructure. Handles multiple accessibility profiles and pathway types.

**Key Features:**
- A* pathfinding with haversine distance heuristic
- Multiple accessibility profiles (default, no stairs, wheelchair, etc.)
- Cost functions that account for pathway types and accessibility constraints
- Returns pathway sequences with distances and walking times

**Pathway Modes (GTFS Standard):**
- Walkway, Stairs, Moving sidewalk, Escalator, Elevator, Fare gate, Exit gate
- Each mode has different speed modifiers and fixed time penalties

**Main Functions:**
- `Route()`: Finds optimal path between two stops, returns null if no accessible route exists
- `NewGraph()`: Creates graph from station pathway data

### 3. `station.ts` - Data Models

Class-based data models for GTFS station entities. Provides constructors that normalize API responses into consistent internal representations.

**Key Classes:**
- `Station`: Parent station with stops, pathways, and levels
- `Stop`: Individual stop/platform/entrance with location and pathway connections
- `Pathway`: Connection between stops with mode, length, and traversal time
- `Level`: Floor/level grouping for stops

**Utilities:**
- `addStreetPathways()`: Generates synthetic pathways connecting disconnected platforms

### 4. `bins.ts` - Transfer Time Scoring

Utility functions for categorizing transfer buffer times into quality bins (good, acceptable, poor).

**Key Features:**
- Transfer quality scoring based on buffer time thresholds
- Configurable breakpoints for different transfer quality levels
- Used by visualization components to color-code transfers

### 5. `types.ts` - Type Definitions

TypeScript type definitions and interfaces used across all transit-transfers components.

**Key Types:**
- Core data structures for transfers, departures, and routing
- GraphQL response types
- Component prop and emit types
- Accessibility profile enums

---

## Data Flow

### Transfer Analysis Flow

1. **Page Load**: User navigates to transfer analysis page with station parameter
2. **Data Loading**: `scenario-data.vue` component loads:
   - Available feed versions (GraphQL)
   - Station geometry and stops (GraphQL)
   - Constructs Scenario from URL query params
3. **Computation**: `Scenario.compute()` executes:
   - Fetches departure/arrival times for time window
   - For each incoming trip, finds all outgoing trips
   - Computes walking times using A* pathfinding
   - Groups transfers by trip and scores by buffer time
4. **Visualization**: Page components receive ScenarioResult and render:
   - Data grids with sortable/filterable transfers
   - Maps with colored routes by transfer quality
   - Controls for adjusting scenario parameters

---

## Key Components

### Data Components

#### `scenario-data.vue`
Data loading component that handles GraphQL queries, scenario construction, and data computation.

**Responsibilities:**
- Load available feed versions
- Load station geometry and stops
- Construct Scenario from props
- Execute Scenario.compute()
- Emit dataReady event with ScenarioResult

#### `scenario-with-controls.vue`
Wrapper component that combines scenario-data with scenario-controls for easy reuse.

### UI Components

#### `scenario-controls.vue`
Central control panel for scenario configuration with feed version selection, time window, route filters, accessibility profiles, and transfer scoring controls.

#### `breadcrumbs.vue`
Navigation component for switching between different analysis reports at a station.

#### `platform-map.vue`
Interactive Maplibre map for visualizing station layouts, pathways, stops, and geographic data. Renders stops as markers and pathways as lines with color coding.

#### `data-grid.vue`
Generic sortable/filterable data table with CSV export. Supports client-side sorting, column filtering, pagination, and custom cell renderers.

#### `platform-pathway-map.vue`
Modal dialog showing step-by-step walking directions for a specific transfer, with interactive map and pathway segment details.

#### `platform-pathway.vue`
Component for displaying individual pathway segments with mode icons and details.

#### Other Components

- `time-scoring-control.vue`: Adjustable transfer time thresholds
- `time-scoring-histogram.vue`: Vega-Lite histogram of transfer buffer times
- `time-event.vue`: Display component for arrival/departure time events
- `time-override.vue`: Component for manually adjusting transfer times
- `station-bbox-select-map.vue`: Map with bounding box selection for custom region queries
- `station-select-map.vue`: Map displaying station hubs with click selection
- `pathway-icons.ts`: Icon definitions for pathway modes (stairs, elevator, escalator, etc.)

### Page Components

#### Transfer Analysis Pages

Located in `pages/` subdirectory:

- `summary.vue`: Aggregated analysis grouped by route pairs
- `transfers.vue`: Individual transfer opportunities with full details
- `maps.vue`: Geographic visualization of transfers
- `routes.vue`: Matrix view by route pair
- `comparison.vue`: Multi-feed version comparison view

---

## Testing

### Test Suite

**Running Tests:**
```bash
yarn test                    # Run all tests
yarn test graph.spec.ts      # Run specific file
yarn test --watch            # Watch mode
```

**Test Data:**
- `testdata/powell.json`: Powell Street BART station with full pathway network
- `testdata/ftvl/`: Fruitvale BART station data

### Manual Testing

Key scenarios to verify:

1. **Transfer Analysis:**
   - Navigate to station with complex pathway network (e.g., Powell BART)
   - Select feed version and service date
   - Verify transfers are computed with walking times
   - Click transfer → verify pathway map shows correct route

2. **Accessibility Profiles:**
   - Select "Wheelchair" profile
   - Verify transfers with stairs-only paths are marked inaccessible
   - Verify elevator paths are shown

3. **Multi-Feed Comparison:**
   - Select 2+ feed versions
   - Verify UI handles multiple feeds
   - Verify data aggregates correctly

4. **Headway Analysis:**
   - Navigate to route-headways page
   - Verify headway statistics match departure data
   - Verify filtering by category works

---

## Common Issues & Debugging

### Issue: "No accessible route found"

**Symptoms:** Transfer shows "N/A" for walking time.

**Causes:**
1. Station has disconnected pathway network (platforms not connected to entrances)
2. Accessibility profile excludes all available paths (e.g., "Wheelchair" but only stairs exist)
3. Missing pathway data in GTFS feed

**Solutions:**
1. Call `addStreetPathways(station)` to generate synthetic pathways
2. Switch to "Default" profile to see if any route exists
3. Check station data in platform-map component to visualize pathway network

### Issue: "No departures found"

**Symptoms:** Transfer analysis shows 0 incoming trips.

**Causes:**
1. Selected service date has no service (e.g., holiday)
2. Time window doesn't overlap with service (e.g., selecting 2am-4am)
3. Feed version doesn't cover the station's location

**Solutions:**
1. Check feed version's `earliest_calendar_date` and `latest_calendar_date`
2. Expand time window to "All Day" (00:00-48:00)
3. Verify station geometry overlaps with feed version's service area

