# ADR-0001: Next.js Modular Monolith

- **Status:** Accepted
- **Date:** 2026-09-28

## Context

V1 must be delivered quickly while remaining maintainable for approximately one year and understandable to both human developers and AI coding agents.

The product includes:

- storefront;
- footage browsing and search;
- footage detail pages;
- phone + OTP authentication;
- user library;
- payments;
- invoices;
- protected downloads;
- administration;
- blog.

V1 does not require an independent backend, mobile application, microservices, or multiple independent clients.

Introducing a separate backend such as NestJS at this stage would increase:

- repository and deployment complexity;
- API surface area;
- duplicated validation;
- authentication integration complexity;
- CI complexity;
- context required by AI agents.

At the same time, placing business logic directly inside React components or route handlers would make the application difficult to maintain.

## Decision

V1 will be implemented as a **Next.js modular monolith**.

The storefront, admin interface, and server-side application logic will live in a single Next.js application and repository.

The codebase must be organized around business capabilities rather than becoming a collection of unrelated utility files.

A possible high-level structure is:

```text
src/
  app/
    (storefront)/
    (auth)/
    admin/
    api/

  modules/
    auth/
    footage/
    media/
    search/
    orders/
    payments/
    invoices/
    downloads/
    blog/

  components/
  lib/
```

The exact directory structure may be refined during project bootstrap.

The architectural requirement is the preservation of clear module ownership and boundaries, not this exact folder tree.

## Server-Side Access

The presence of Next.js does not imply that every server-side operation requires an internal REST API.

For server-rendered application code, prefer:

```text
Server Component
      ↓
Application / Domain Function
      ↓
Database / Infrastructure
```

over:

```text
Server Component
      ↓
Internal HTTP API
      ↓
Application Function
```

Route Handlers should be introduced when a genuine HTTP boundary exists.

Examples include:

- payment callbacks;
- authentication endpoints where required by the selected auth implementation;
- upload authorization and signing;
- protected download authorization;
- external service callbacks.

## Module Boundaries

Each module owns the behavior associated with its business capability.

For example:

- the `orders` module must not implement object-storage behavior;
- the `media` module must not independently change payment state;
- UI components must not contain payment or entitlement business rules.

Cross-module interaction should happen through deliberate module contracts rather than arbitrary imports from another module's internal implementation.

## Avoid Premature Layering

This ADR does not require:

- formal Domain-Driven Design;
- Clean Architecture in every module;
- repository classes for every database model;
- generic service layers;
- a dependency-injection framework;
- CQRS;
- event sourcing;
- an event bus.

Such abstractions may only be introduced when they solve a demonstrated requirement.

The preferred rule is:

> Use the narrowest architecture that correctly satisfies the current requirement.

## Consequences

### Positive

- one repository;
- one primary deployment unit;
- less infrastructure;
- less context for AI agents;
- direct use of Next.js server capabilities;
- reduced API boilerplate;
- faster V1 development;
- business modules remain separable if future requirements justify extraction.

### Negative

- frontend and backend application lifecycles are coupled;
- module boundaries require discipline;
- without governance, business logic could gradually leak into `app/`, `components/`, or generic utility directories.

## AI Agent Constraints

AI agents must not:

- introduce NestJS or another independent backend;
- introduce microservices;
- create internal REST APIs without a genuine HTTP-boundary requirement;
- place business logic directly inside React components;
- create generic abstractions for hypothetical future requirements;
- introduce a competing architecture without an approved ADR.

If a task appears to require changing this architecture, the agent must stop and report the architectural conflict before implementation.
