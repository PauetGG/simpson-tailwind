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



// 🔁 Obtener personajes y renderizar por cada página
async function mostrarPersonajesPorPaginas() {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;
  try {
    const res = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=1`);
    const data = await res.json();
    todosLosPersonajes = data.docs;
    renderPersonajes(todosLosPersonajes);

    const totalPaginas = data.totalPages;

    for (let p = 2; p <= totalPaginas; p++) {
      const resPagina = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=${p}`);
      const dataPagina = await resPagina.json();
      todosLosPersonajes = todosLosPersonajes.concat(dataPagina.docs);
      renderPersonajes(dataPagina.docs); // Puedes comentar esta línea si quieres evitar render doble
    }

  } catch (error) {
    console.error('❌ Error al obtener los personajes:', error);
    contenedor.innerHTML = 'Error al cargar personajes.';
  }
}
const inputBuscador = document.getElementById('buscador') as HTMLInputElement;

inputBuscador.addEventListener('input', () => {
  const texto = inputBuscador.value.toLowerCase();
  const filtrados = todosLosPersonajes.filter(p =>
    p.Nombre.toLowerCase().startsWith(texto)
  );
  renderPersonajes(filtrados);
});

let filtrosSeleccionados: {
  genero: Set<string>;
  estado: Set<string>;
} = {
  genero: new Set(),
  estado: new Set()
};

function aplicarFiltrosYBuscar() {
  const texto = inputBuscador.value.toLowerCase();

  const filtrados = todosLosPersonajes.filter(p => {
    const coincideNombre = p.Nombre.toLowerCase().startsWith(texto);
    const coincideGenero = filtrosSeleccionados.genero.size === 0 || filtrosSeleccionados.genero.has(p.Genero);
    const coincideEstado = filtrosSeleccionados.estado.size === 0 || filtrosSeleccionados.estado.has(p.Estado);
    return coincideNombre && coincideGenero && coincideEstado;
  });

  renderPersonajes(filtrados);
}

// 👇 Eventos para filtros de género
document.querySelectorAll('.filtro-genero').forEach(btn => {
  btn.addEventListener('click', () => {
    const genero = btn.getAttribute('data-genero');
    if (!genero) return;

    if (filtrosSeleccionados.genero.has(genero)) {
      filtrosSeleccionados.genero.delete(genero);
      btn.classList.remove('ring', 'ring-2');
    } else {
      filtrosSeleccionados.genero.add(genero);
      btn.classList.add('ring', 'ring-2');
    }

    aplicarFiltrosYBuscar();
  });
});

// 👇 Eventos para filtros de estado
document.querySelectorAll('.filtro-estado').forEach(btn => {
  btn.addEventListener('click', () => {
    const estado = btn.getAttribute('data-estado');
    if (!estado) return;

    if (filtrosSeleccionados.estado.has(estado)) {
      filtrosSeleccionados.estado.delete(estado);
      btn.classList.remove('ring', 'ring-2');
    } else {
      filtrosSeleccionados.estado.add(estado);
      btn.classList.add('ring', 'ring-2');
    }

    aplicarFiltrosYBuscar();
  });
});

// 👇 Buscador
inputBuscador.addEventListener('input', aplicarFiltrosYBuscar);

// 👇 Limpiar filtros
document.getElementById('limpiarFiltros')?.addEventListener('click', () => {
  filtrosSeleccionados = { genero: new Set(), estado: new Set() };
  inputBuscador.value = '';
  
  document.querySelectorAll('.filtro-genero, .filtro-estado').forEach(btn => {
    btn.classList.remove('ring', 'ring-2');
  });

  renderPersonajes(todosLosPersonajes);
});

mostrarPersonajesPorPaginas();
