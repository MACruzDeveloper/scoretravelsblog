# Plan: Arquitectura de Tests para Front (Client) - Score Travels Blog

## TL;DR
Crear una estructura modular de tests para lograr **cobertura moderada (50-80%)** del frontend usando Vitest (ya instalado) + Testing Library + MSW para mocks, con tests unitarios, de integración y E2E con Playwright.

## Decisiones Clave
- **Coverage target**: Moderada (50-80%)
- **Tools**: Vitest ✅, Testing Library ✅, MSW ✅, Playwright 🆕
- **Scope**: Frontend (client/) solo
- **Total tests**: 48 tests (25 unit + 15 integration + 8 E2E)
- **Tiempo estimado**: 6-7 horas

## Arquitectura de Carpetas

```
client/src/tests/
├── __fixtures__/
│   ├── data/
│   │   ├── experiences.fixture.ts
│   │   ├── categories.fixture.ts
│   │   ├── users.fixture.ts
│   │   ├── comments.fixture.ts
│   │   └── scores.fixture.ts
│   └── handlers/
│       ├── authHandlers.ts
│       ├── experiencesHandlers.ts
│       ├── categoriesHandlers.ts
│       ├── commentsHandlers.ts
│       └── index.ts
├── utils/
│   ├── renderWithProviders.tsx
│   ├── testHelpers.ts
│   └── mockData.ts
├── unit/
│   ├── components/
│   │   ├── common/ (Header, Footer)
│   │   ├── pages/ (Home, Gallery, Contact, About)
│   │   ├── experiences/ (AllExperiences, Experience, ExperienceCard)
│   │   └── admin/ (AdminPanel, Categories, Images)
│   ├── hooks/ (useExperienceHooks, useExperienceFilters, useOutsideClick, useScrollPosition)
│   ├── stores/ (experienceStore, categoriesStore, usersStore)
│   └── utils/ (utils.js, constants.ts)
├── integration/
│   ├── user-flows/ (auth, search, admin-crud)
│   ├── api-integration/ (experiences, comments, auth)
│   └── store-interactions/ (store+API, multi-store)
└── e2e/
    ├── auth.spec.ts
    ├── user-journey.spec.ts
    ├── admin-panel.spec.ts
    └── lighthouse.spec.ts (opcional)
```

## Fases de Implementación (46 tareas: 5-15 min c/u)

### Bloque 1: Infraestructura (45-60 min)
- Crear carpetas
- Fixtures data: experiences, users, categories, comments
- MSW handlers: auth, experiences, categories, comments
- Utils: renderWithProviders, testHelpers

### Bloque 2-4: Unit Tests (135-170 min)
- Componentes (7): Header, Home, Gallery, AllExperiences, Experience, Contact, AdminPanel
- Hooks (4): useExperienceHooks, useExperienceFilters, useOutsideClick, useScrollPosition
- Stores & Utils (5): stores, utils, constants

### Bloque 5-6: Integration (75-105 min)
- Flujos usuario: auth, search, admin CRUD
- API integration: experiences, comments, auth
- Store sync

### Bloque 7-8: E2E (55-75 min)
- Install Playwright
- Auth flows, user journey, admin panel

### Bloque 9: CI/CD (10-15 min)
- Scripts npm
- GitHub Actions (opcional)

## Scripts a Agregar (package.json)

```json
{
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:unit": "vitest run --include='**/unit/**'",
  "test:integration": "vitest run --include='**/integration/**'",
  "test:e2e": "playwright test",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:ui": "playwright test --ui"
}
```

## Notas Importantes
1. **MSW handlers** — handlers.js solo tiene 1 mock; necesita expandirse
2. **Zustand reset** — Cada test debe resetear stores para evitar state pollution
3. **Auth mocking** — Tests de admin deben mockear token + usuario autenticado
4. **Localhost** — Tests deben forzar localhost (config.js cambia URL en producción)
