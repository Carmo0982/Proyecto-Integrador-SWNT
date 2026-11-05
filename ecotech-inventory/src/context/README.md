# context/

**Qué va aquí:** estado **global y transversal** compartido por muchas pantallas, implementado con Context API. Caso principal: `AuthContext` (sesión y usuario de Supabase Auth).

Cada archivo exporta el `Provider` y un hook de acceso (`useAuthContext`).

**Reglas**
- Solo para estado que realmente es global. Los datos de una sola pantalla van en un hook, no en un contexto.
- El contexto obtiene datos a través de `services/` (por ejemplo, `services/auth.service.ts`), no del cliente de Supabase directamente.
