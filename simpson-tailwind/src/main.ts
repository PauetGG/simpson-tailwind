interface Personaje {
  _id: string;
  Nombre: string;
  Historia: string;
  Imagen: string;
  Genero: string;
  Estado: string;
  Ocupacion: string;
}

// 🔧 Función para renderizar un grupo de personajes (grid)
function renderPersonajes(personajes: Personaje[]) {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;

  personajes.forEach(personaje => {
    const div = document.createElement('div');
    div.className = 'personaje';

    div.innerHTML = `
      <div class="border-4 border-black border-solid rounded-xl">
        <div class="w-62 h-[450px] bg-white rounded-lg shadow-md border-gray-200 p-2">
          <h3 style="font-family: 'Rock Salt'; font-weight: bold;" class="text-lg text-center mb-3">${personaje.Nombre}</h3>
          <img style="object-fit: contain" src="${personaje.Imagen}" alt="${personaje.Nombre}" class="w-32 h-64 mx-auto object-cover">
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

// 🔁 Obtener personajes y renderizar por página
async function mostrarPersonajesPorPaginas() {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;
  try {
    const res = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=1`);
    const data = await res.json();
    renderPersonajes(data.docs);

    const totalPaginas = data.totalPages;

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

// 🔄 Mostrar personaje aleatorio centrado
async function setupBotonAleatorio() {
  const personajes = await obtenerTodosLosPersonajes();
  const boton = document.getElementById('randomButton');
  const randomContainer = document.getElementById('randomContainer');

  if (!boton || !randomContainer) {
    console.error('❌ No se encontró el botón o contenedor del personaje aleatorio');
    return;
  }

  boton.addEventListener('click', () => {
    const aleatorio = personajes[Math.floor(Math.random() * personajes.length)];
  
    randomContainer.innerHTML = `
      <div class="bg-yellow-100 rounded-xl border-4 border-black p-6 w-80 h-[450px] relative shadow-lg text-center z-[60]">
        <button id="cerrarModal" class="absolute top-2 right-2 text-black font-bold text-lg cursor-pointer">✖</button>
        <h2 class="text-xl font-bold mb-3" style="font-family: 'Rock Salt';">${aleatorio.Nombre}</h2>
        <img src="${aleatorio.Imagen}" alt="${aleatorio.Nombre}" class="w-40 h-64 object-contain mx-auto rounded mb-3" />
        <div class="text-sm text-gray-700 text-left">
          <p><strong>Género:</strong> ${aleatorio.Genero}</p>
          <p><strong>Estado:</strong> ${aleatorio.Estado}</p>
          <p><strong>Ocupación:</strong> ${aleatorio.Ocupacion}</p>
        </div>
      </div>
    `;
  
    // Mostrar el modal
    randomContainer.classList.remove('hidden');
  
    // Cerrar al apretar la X
    const cerrarBtn = document.getElementById('cerrarModal');
    cerrarBtn?.addEventListener('click', () => {
      randomContainer.classList.add('hidden');
      randomContainer.innerHTML = '';
    });
  });  
}

// 🔁 Obtener todos los personajes para el aleatorio
async function obtenerTodosLosPersonajes(): Promise<Personaje[]> {
  const personajes: Personaje[] = [];
  let totalPaginas = 1;

  try {
    const res = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=1`);
    const data = await res.json();
    personajes.push(...data.docs);
    totalPaginas = data.totalPages;

    for (let p = 2; p <= totalPaginas; p++) {
      const resPagina = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=${p}`);
      const dataPagina = await resPagina.json();
      personajes.push(...dataPagina.docs);
    }

    return personajes;
  } catch (error) {
    console.error('❌ Error al obtener personajes:', error);
    return [];
  }
}

// 🔁 Ejecutar todo
mostrarPersonajesPorPaginas();
setupBotonAleatorio();

