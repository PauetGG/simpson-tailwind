# 📺 Los Simpson -- Pokédex Interactiva

Proyecto grupal desarrollado con **Vite + TypeScript** que simula una Pokédex de personajes de **Los Simpson**. Permite explorar, buscar, filtrar, marcar favoritos y jugar con varias funcionalidades interactivas como un piano, quizzes y trivia.

## 🎯 Objetivo del proyecto

Ofrecer una experiencia interactiva y divertida con personajes de Los Simpson usando una API pública y múltiples recursos como sonido, animaciones, filtros y lógica personalizada. Ideal tanto para fans como para quienes quieran practicar TypeScript y DOM avanzado.

---

## 🚀 Tecnologías usadas

- ⚡️ Vite
- 🧠 TypeScript
- 🎨 Tailwind CSS
- 🛠️ HTML y DOM API
- 🔊 Audio HTML + efectos
- 📦 LocalStorage

---

## 🧩 Funcionalidades principales

### 🔍 Exploración de personajes
- Scroll infinito para cargar personajes desde la API `https://apisimpsons.fly.dev`.
- Tarjetas visuales con imagen, género, estado y ocupación.
- Modal con detalles ampliados.

### 🎯 Filtros inteligentes
- Filtro por **nombre**, **género**, **estado** y **ocupación**.
- Combinación de múltiples filtros simultáneamente.
- Botón de reset para limpiar los filtros.

### ❤️ Favoritos
- Marca personajes como favoritos (❤️).
- Visualiza solo tus personajes favoritos.
- Estado persistente usando `localStorage`.

### 🎲 Personaje aleatorio
- Muestra un personaje aleatorio al pulsar el botón.
- Incluye imagen, datos y modal emergente.

### 🎹 Piano interactivo Simpson
- Teclas que reproducen sonidos divertidos.
- Cada tecla muestra un personaje o imagen icónica.
- Soporte para teclado físico (`A`–`J`, `W`, `E`, etc.).
- Teclas aleatorias cada vez que se abre el piano.

### ❓ Quiz de sonidos
- Adivina qué personaje habla en el sonido reproducido.
- Selecciona entre 4 opciones visuales.
- Pierdes vidas (🍩) si fallas, reinicio automático al perder.

### 🧠 Trivia Simpson
- Preguntas divididas por categorías (familia, trabajo, etc.).
- Selección aleatoria tipo ruleta.
- Puntuación y vidas (🍩) con visual feedback.
- Modo visual si la respuesta coincide con un personaje.

### 🧰 CRUD completo
- Añadir, modificar y eliminar personajes personalizados.
- Integrado con `localStorage`.
- Filtros y búsqueda aplican también a los personajes personalizados.
- Al eliminar personajes de la API, se ocultan simulando su "borrado".

### 🟨 Cambiador de fondo
- Botón para alternar entre diferentes fondos visuales (día/noche).

### ⬆️ Botón de scroll to top
- Icono de Bart para volver arriba cuando haces scroll.
