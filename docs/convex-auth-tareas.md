# convex-auth-tareas.md

# Tareas para implementar Auth en Pomotask

## [x] Tarea 1: Instalar dependencias

- Ejecutar: `pnpm add @convex-dev/auth`
- No agregar otras dependencias sin justificación.

## [x] Tarea 2: Configurar auth.config.ts

- Actualizar `convex/auth.config.ts` con provider de email/password:

      import { Password } from "@convex-dev/auth/providers/Password";
      import { convexAuth } from "@convex-dev/auth/server";

      export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
        providers: [Password],
      });

- No agregar otros providers todavía.
- Ejecutar `npx convex codegen` después de este cambio.
- Nota: Requiere AUTH_SECRET en el dashboard de Convex para deploy.

## [x] Tarea 3: Actualizar schema para auth

- Convex Auth requiere tablas adicionales en el schema.
- Seguir la documentación oficial de `@convex-dev/auth` para agregar
  las tablas requeridas (`authAccounts`, `authSessions`, etc.).
- Ejecutar `npx convex codegen` después de cambios en schema.
- No modificar tablas existentes.
- Nota: `authTables` de `@convex-dev/auth/server` ya incluye todas las tablas necesarias.

## Tarea 4: Crear hook useDataSource

- Crear `src/hooks/useDataSource.ts`:

      import { useConvexAuth } from "convex/react";

      export type DataSource = "convex" | "dexie";

      export const useDataSource = (): DataSource => {
        const { isAuthenticated } = useConvexAuth();
        return isAuthenticated ? "convex" : "dexie";
      };

## Tarea 5: Crear hooks abstractos de datos

- Crear `src/hooks/useProjects.ts`:
  - Si `useDataSource()` retorna `"dexie"` → leer de Dexie.
  - Si retorna `"convex"` → usar `useQuery(api.tasks.listByProject, ...)`.
  - Exportar las mismas funciones en ambos casos para que los
    componentes no noten la diferencia.

- Crear `src/hooks/useTasks.ts` con la misma lógica.

- No modificar componentes existentes todavía.

## Tarea 6: Crear lógica de migración

- Crear `src/lib/migration.ts`:
  - Función `migrateLocalDataToConvex(userId)`:
    - Leer todos los proyectos de Dexie.
    - Leer todas las tareas de Dexie.
    - Escribir proyectos en Convex vía mutation.
    - Escribir tareas en Convex vía mutation.
    - Solo si todo fue exitoso → limpiar Dexie.
    - Si algo falla → no limpiar Dexie, lanzar error con detalle.
  - La función debe retornar `{ projects: number, tasks: number }`
    con los conteos migrados.

## Tarea 7: Crear MigrationModal

- Crear `src/components/auth/MigrationModal.tsx`:
  - Mostrar cuando el usuario completa sign up.
  - Preguntar: "¿Quieres migrar tus datos locales a la nube?"
  - Botones: "Migrar" y "No, empezar desde cero".
  - Al migrar: mostrar progreso y resultado.
  - Si falla: mostrar error, conservar Dexie, cerrar modal.
  - Si rechaza: cerrar modal, Convex empieza vacío.

## Tarea 8: Crear SignUpForm

- Crear `src/components/auth/SignUpForm.tsx`:
  - Campos: email, password, confirmar password.
  - Validación con Zod (ya está instalado en el repo).
  - Al completar sign up exitoso → mostrar MigrationModal.
  - Usar TanStack Form (ya está instalado en el repo).
  - No crear estilos nuevos — usar los componentes shadcn/ui existentes.

## Tarea 9: Crear SignInForm

- Crear `src/components/auth/SignInForm.tsx`:
  - Campos: email, password.
  - Validación con Zod.
  - Al completar sign in → redirigir a la ruta principal.
  - Usar TanStack Form y shadcn/ui existentes.
  - No mostrar MigrationModal en sign in.

## Tarea 10: Crear rutas de auth

- Agregar rutas en TanStack Router:
  - `/signin` → SignInForm
  - `/signup` → SignUpForm
- Seguir las convenciones de rutas existentes en `src/routes/`.
- No proteger rutas existentes todavía.

## Tarea 11: Agregar botones de auth en la UI

- Agregar en la navegación existente:
  - Si no autenticado → botones "Sign In" y "Sign Up".
  - Si autenticado → mostrar email del usuario y botón "Sign Out".
- Modificar el mínimo de componentes existentes.
- No rediseñar la navegación.

## Tarea 12: Prueba funcional mínima

- Crear cuenta nueva con email/password.
- Verificar que aparece el MigrationModal.
- Verificar migración exitosa desde Dexie a Convex.
- Verificar que sin auth los datos siguen en Dexie.
- Verificar que sign out vuelve a Dexie.
- Verificar que `pnpm build` pasa sin errores.
- Verificar que el deploy en Cloudflare Pages no se rompe.

## Tarea 13: Documentar cambios

- Actualizar `.jules/convex.md` si se descubrió algo no obvio.
- Actualizar `.env.example` si se necesitaron variables nuevas.
