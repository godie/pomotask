# convex-auth-contexto.md

# Contexto para implementar Auth en Pomotask

Este documento define el alcance, restricciones y lineamientos para implementar
autenticación en Pomotask con Convex Auth. Cualquier agente que trabaje en esta
integración debe seguir estas reglas estrictamente.

## 1. Arquitectura de datos

Pomotask usa una arquitectura híbrida:

    Sin autenticación → datos en Dexie (IndexedDB, local)
    Con autenticación → datos en Convex (cloud, sincronizado)

Los componentes NO deben saber de dónde vienen los datos.
Toda la lógica de fuente de datos vive en hooks o stores dedicados.

## 2. Stack de auth

Usar Convex Auth nativo (`@convex-dev/auth`).
No usar Clerk ni otros servicios externos.
El archivo `convex/auth.config.ts` ya existe con `providers: []`.
Solo activar provider de email/password en esta fase.
No implementar OAuth (Google, GitHub) todavía.

## 3. Flujo de autenticación

### 3.1 Sign Up

1. Usuario crea cuenta con email/password.
2. Se muestra modal: "¿Quieres migrar tus datos locales a la nube?"
3. Si acepta:
   - Leer proyectos y tareas de Dexie.
   - Escribir en Convex bajo el userId autenticado.
   - Limpiar Dexie después de migración exitosa.
   - Si la migración falla, NO limpiar Dexie y mostrar error.
4. Si rechaza:
   - Dexie se queda intacta.
   - Convex empieza vacío para ese usuario.

### 3.2 Sign In

1. Usuario ingresa con email/password.
2. Si tiene datos en Dexie y datos en Convex → priorizar Convex.
3. No hacer migración automática en sign in, solo en sign up.

### 3.3 Sign Out

1. Limpiar sesión de Convex Auth.
2. La app vuelve a leer de Dexie automáticamente.
3. No limpiar Dexie al hacer sign out.

## 4. Hook central de fuente de datos

Crear `src/hooks/useDataSource.ts`:

    import { useConvexAuth } from "convex/react";

    export type DataSource = "convex" | "dexie";

    export const useDataSource = (): DataSource => {
      const { isAuthenticated } = useConvexAuth();
      return isAuthenticated ? "convex" : "dexie";
    };

Todos los hooks de datos deben usar `useDataSource()` para decidir
de dónde leer y escribir. Nunca hardcodear la fuente en componentes.

## 5. Estructura de archivos nuevos

    src/
      hooks/
        useDataSource.ts       ← fuente de datos según auth
        useProjects.ts         ← abstracción sobre Dexie o Convex
        useTasks.ts            ← abstracción sobre Dexie o Convex
      components/
        auth/
          SignInForm.tsx
          SignUpForm.tsx
          MigrationModal.tsx   ← "¿migrar datos locales?"
      lib/
        migration.ts           ← lógica de migración Dexie → Convex

    convex/
      auth.config.ts           ← actualizar con provider email/password

## 6. Rutas nuevas

Agregar en TanStack Router:

- `/signin` → SignInForm
- `/signup` → SignUpForm

No proteger rutas existentes todavía — eso va en otra fase.

## 7. Lo que NO se debe hacer

- No usar Clerk ni servicios externos de auth.
- No implementar OAuth en esta fase.
- No proteger rutas todavía.
- No limpiar Dexie al hacer sign out.
- No hacer migración automática en sign in.
- No mezclar lógica de Dexie y Convex en los mismos componentes.
- No modificar componentes existentes más allá de lo necesario.

## 8. Migración de datos

La migración vive en `src/lib/migration.ts`.
Es una operación de una sola vez por usuario.
Debe ser transaccional: si falla algo, no limpiar Dexie.
Debe mostrar progreso al usuario (cuántos proyectos/tareas se migraron).
Debe manejar errores sin crashear la app.

## 9. Estándares de código

- TypeScript estricto. No usar `any`.
- No mezclar lógica de UI con lógica de datos.
- Hooks abstractos para acceso a datos — no llamar Dexie o Convex directamente desde componentes.
- Seguir convenciones de TanStack Router para rutas nuevas.

## 10. Journal del agente

Leer `.jules/convex.md` antes de empezar.
Actualizar solo cuando se descubra algo no obvio o inesperado.
No duplicar información que ya está en este documento.

## 11. Resultado esperado

Al finalizar:

- Sign up y sign in funcionan con email/password.
- Sin auth → datos en Dexie (sin cambios en comportamiento actual).
- Con auth → datos en Convex.
- Modal de migración aparece en sign up.
- Migración exitosa limpia Dexie.
- Migración fallida preserva Dexie y muestra error.
- No se rompe el build ni el deploy.
