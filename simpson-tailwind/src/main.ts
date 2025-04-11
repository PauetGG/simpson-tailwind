interface Personaje {
  _id: string;
  Nombre: string;
  Historia: string;
  Imagen: string;
  Genero: string;
  Estado: string;
  Ocupacion: string;
}

let todosLosPersonajes: Personaje[] = [];

// 🔧 Función para renderizar un grupo de personajes
function renderPersonajes(personajes: Personaje[]) {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;

  contenedor.innerHTML = ''; // ⬅️ Limpia antes de renderizar

  personajes.forEach(personaje => {
    const div = document.createElement('div');
    div.className = 'personaje';

    div.innerHTML = `
      <div class="border-4 border-black border-solid rounded-xl">
        <div class=" w-62 h-[450px] bg-white rounded-lg shadow-md border-gray-200 p-2">
          <h3 style="font-family: 'Rock Salt'; font-weight: bold;" class="text-lg text-center mb-3">${personaje.Nombre}</h3>
          <img style="object-fit: contain" src="${personaje.Imagen}" alt="${personaje.Nombre}" class=" w-32 h-64 mx-auto object-cover">
          <div class="mt-4 text-sm text-gray-600">
            <p class="mb-1"><span class="font-semibold">Género:</span> ${personaje.Genero}</p>
            <p class="mb-1"><span class="font-semibold">Estado:</span> ${personaje.Estado}</p>
            <p><span class="font-semibold">Ocupación:</span> ${personaje.Ocupacion}</p>
          </div>
        </div>
      </div>
    `;

    contenedor.appendChild(div);
  });
}

// 🔁 Obtener personajes y renderizar por cada página
async function mostrarPersonajesPorPaginas() {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;
  try {
    // Primera llamada para saber cuántas páginas hay
    const res = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=1`);
    const data = await res.json();
    todosLosPersonajes = data.docs;

    renderPersonajes(todosLosPersonajes);

    todosLosPersonajes = todosLosPersonajes.concat(dataPagina.docs);

      renderPersonajes(dataPagina.docs); // Puedes comentar esta línea si quieres evitar render doble
    // Resto de las páginas
    for (let p = 2; p <= totalPaginas; p++) {
      const resPagina = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=${p}`);
      const dataPagina = await resPagina.json();
      renderPersonajes(dataPagina.docs);
    }

  } catch (error) {
    console.error('❌ Error al obtener los personajes:', error);
    contenedor.innerHTML = 'Error al cargar personajes.';
  }
}

mostrarPersonajesPorPaginas();
