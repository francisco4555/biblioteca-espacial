# Biblioteca espacial

Biblioteca virtual minimalista con libros que flotan en 3D. Sitio estático: HTML, CSS y JavaScript puro, sin dependencias.

## Vistas
- **Nube**: libros dispersos en el espacio.
- **Anillo**: libros en círculo.
- **Pila**: lomos alineados de perfil.

Arrastra o usa la rueda del ratón para girar. Al tocar un libro, crece al centro y el resto se acomoda en columna. Puedes navegar con flechas, rueda o deslizando, y cerrar con `Esc`.

## Editar la colección
Abre `books.js`. Cada libro acepta `title`, `author`, `year`, `genre`, `bg` y `fg` (colores), además de dos campos opcionales: `cover` (ruta a una imagen) y `url` (enlace de "Abrir libro").

## Correr en local
Abre `index.html` en el navegador o ejecuta `npx serve .`.
