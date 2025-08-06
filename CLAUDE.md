# CLAUDE.md

## Reglas Generales de Desarrollo

1. **Simplicidad y Claridad**
   - Prioriza soluciones simples y directas.
   - Evita la complejidad innecesaria en la lógica y la estructura del código.
   - Prefiere scripts y componentes breves, enfocados y reutilizables.

2. **Refactorización Continua**
   - Refactoriza el código frecuentemente para mejorar legibilidad y mantenibilidad.
   - Elimina duplicidad y abstrae lógica común en utilidades o hooks.
   - Mantén los nombres de variables, funciones y componentes descriptivos y consistentes.

3. **Código Limpio y Legible**
   - Usa comentarios solo cuando sean estrictamente necesarios para clarificar intenciones.
   - Mantén la indentación y el formato consistente en todo el proyecto.
   - Elimina código muerto o no utilizado tan pronto como sea posible (previa aprobación si es necesario).

4. **Modularidad y Escalabilidad**
   - Divide la aplicación en componentes y módulos pequeños, independientes y reutilizables.
   - Separa la lógica de negocio de la presentación y de la gestión de estado.
   - Utiliza patrones de diseño apropiados para mantener la escalabilidad.
   - Mantén un máximo de 200 líneas por archivo/script para asegurar brevedad y enfoque.
   - Divide los scripts que excedan el límite en módulos más pequeños y específicos.

5. **Internacionalización y Responsividad**
   - Implementa internacionalización desde el inicio del proyecto.
   - Asegura que la aplicación sea completamente responsiva para dispositivos móviles y web.

6. **Pruebas y Calidad**
   - Implementa pruebas unitarias y de integración para cada parte del proyecto.
   - Mantén y mejora la cobertura de pruebas con cada cambio.
   - No uses datos mock; utiliza datos reales o entornos de prueba controlados.

7. **Documentación y Comunicación**
   - Documenta funciones, componentes y módulos con docstrings claros y concisos.
   - Mantén este documento actualizado con nuevas reglas o cambios en las prácticas de desarrollo.

8. **Gestión de Errores y Seguridad**
   - Implementa manejo de errores robusto y consistente en toda la aplicación.
   - Valida y sanitiza todas las entradas del usuario.
   - Protege la información sensible y sigue buenas prácticas de seguridad.

9. **Automatización y Scripts**
   - Utiliza scripts de automatización para tareas repetitivas (build, test, lint, etc.).
   - Mantén los scripts simples, claros y bien documentados.

10. **Revisión y Aprobación de Cambios**
    - Todo cambio significativo debe ser revisado antes de ser fusionado.
    - Solicita aprobación antes de eliminar archivos o funcionalidades.

11. **Log de Cambios Exitosos**
    - Mantén un archivo `CHANGE_LOG.md` que registre todos los cambios exitosos realizados.
    - Cada entrada debe incluir: fecha, descripción breve del cambio, archivos afectados y resultado.
    - Formato: `[YYYY-MM-DD] Descripción del cambio | Archivos: archivo1.js, archivo2.css | Estado: ✅ Exitoso`
    - Este log debe ser consultado al inicio de cada nueva sesión para entender el estado actual del proyecto.
    - Actualizar el log inmediatamente después de cada cambio exitoso.

12. **Log de Commits Detallado**
    - Mantén un archivo `COMMIT_LOG.md` con detalles completos de cada commit al repositorio.
    - Cada entrada debe incluir: hash del commit, fecha, mensaje, archivos modificados, descripción detallada de cambios y propósito.
    - Formato estructurado:
      ```
      ## Commit: [hash-corto] - [fecha]
      **Mensaje:** [mensaje del commit]
      **Archivos modificados:** [lista de archivos]
      **Descripción detallada:** [explicación completa de los cambios]
      **Propósito/Razón:** [por qué se hizo este cambio]
      ```
    - Este log sirve como referencia histórica para entender la evolución del proyecto.

13. **Sistema de IDs Únicos para Frontend**
    - Asigna un ID único a cada elemento interactivo del frontend usando el patrón: `[componente]-[función]-[numero]`
    - Ejemplos: `header-nav-001`, `sidebar-menu-002`, `form-login-003`, `button-submit-004`
    - Mantén un archivo `ELEMENT_IDS.md` que catalogue todos los IDs asignados con su descripción y ubicación.
    - Formato del catálogo:
      ```
      | ID | Componente | Descripción | Archivo | Línea |
      |----|-----------| ------------|---------|-------|
      | header-nav-001 | HeaderNav | Menú principal de navegación | Header.jsx | 25 |
      ```
    - Usar estos IDs en lugar de descripciones vagas al referirse a elementos específicos.
    - Actualizar el catálogo cada vez que se agregue, modifique o elimine un elemento con ID.

---

## Archivos de Seguimiento Requeridos

- `CHANGE_LOG.md` - Log de cambios exitosos
- `COMMIT_LOG.md` - Log detallado de commits
- `ELEMENT_IDS.md` - Catálogo de IDs únicos del frontend

---
