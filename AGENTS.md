# PathMeasure — AGENTS.md

## Project Goal

A very simple mobile-first GPS distance measurement web app.

The app should:
- track walking path using browser GPS
- display walked route on map
- calculate:
  - real walked distance
  - straight-line distance
- work well on any cellphone browser with GPS support
- behave like a lightweight measurement tool
- avoid unnecessary complexity

---

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Leaflet
- OpenStreetMap
- Browser Geolocation API

---

## Rules

- No backend
- No authentication
- No database
- No analytics
- No subscriptions
- No social features
- No fitness tracking features
- No unnecessary dependencies

---

## GPS Logic

- Ignore GPS points with poor accuracy (>20m)
- Ignore tiny movements (<5m)
- Use watchPosition only while recording
- Stop GPS tracking immediately after recording stops

---

## UI Principles

- Mobile-first
- Extremely simple
- One-screen experience
- Large buttons
- Minimal text
- Fast loading

---

## Code Style

- Keep components small
- Prefer readable code over abstraction
- Avoid premature optimization
- Avoid overengineering
- Use TypeScript types everywhere

---

## Definition of Done

The app is complete when:
- route is drawn live
- distances are accurate
- app works on cellphone browsers with GPS support
- deploys successfully on Vercel
- no paid services are required
