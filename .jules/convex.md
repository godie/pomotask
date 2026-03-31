# Convex Agent Journal

Este archivo documenta SOLO aprendizajes críticos descubiertos durante
la integración de Convex en Pomotask. No es un log de actividad.

## Cuándo agregar una entrada

Solo cuando descubras:

- Un comportamiento inesperado de Convex específico a este repo
- Un fix que tuvo efectos secundarios no obvios
- Un patrón reutilizable para este proyecto
- Una restricción importante que no está en el contexto

## Cuándo NO agregar una entrada

- Tareas completadas sin problemas
- Buenas prácticas genéricas
- Información ya documentada en contexto-convex.md

## Formato

## YYYY-MM-DD - [Título corto]

**Problema:** [Qué encontraste]
**Aprendizaje:** [Por qué existía o por qué no era obvio]
**Prevención:** [Cómo evitarlo la próxima vez]

## 2025-05-22 - Interfaces manuales en tasks.ts

**Problema:** El archivo `convex/tasks.ts` utiliza interfaces de TypeScript definidas manualmente para tipos que Convex genera automáticamente (como `Doc<"tasks">`, `MutationContext`, etc.).
**Aprendizaje:** Esto genera duplicidad de código y riesgo de desincronización con el schema. Se hizo así probablemente por rapidez inicial o falta de archivos generados en ese momento.
**Prevención:** En futuras tareas, se debe refactorizar `tasks.ts` para usar los tipos de `_generated/dataModel.ts` y `_generated/server.ts`. Los nuevos archivos deben usar los tipos generados desde el principio.

## 2025-03-30 - Solución: No definir tipos de contexto personalizados

**Problema:** Los handlers de mutations/queries fallaban con errores de tipo porque `MutationContext` y `QueryContext` personalizados no eran compatibles con los tipos generados de Convex.
**Aprendizaje:** La solución correcta es NO definir interfaces personalizadas para `ctx` en los handlers. Convex infiere los tipos automáticamente. Si se necesitan tipos para documentos, usar `Doc<"tableName">` del schema generado.
**Prevención:** En handlers de Convex, usar `async (ctx, args)` sin tipar `ctx` explícitamente. Para acceder a documentos tipados, importar `Doc` de `./_generated/dataModel`.
