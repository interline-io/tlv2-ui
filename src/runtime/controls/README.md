# t-* Controls

This directory contains **general-purpose UI controls** that are **domain-agnostic** and have **no application-specific dependencies**.

## Purpose

Controls in this directory should be:

- ✅ **Pure presentational components** - UI-only logic with no business rules
- ✅ **Reusable across any application** - No transit/GTFS/domain-specific knowledge
- ✅ **Self-contained** - No dependencies on code outside this directory (except Vue, Bulma, MDI)
- ✅ **Simple, stable APIs** - TypeScript interfaces with clear prop contracts

## Examples of appropriate controls:
- Form inputs (button, checkbox, input, select)
- Layout components (field, card, modal)
- Feedback components (notification, loading, tooltip)
- Generic patterns (tabs, tree structures without domain logic)

Key principle: If the component could be copied to a completely different project and work without modification, it belongs here.

