interface Personaje {
  _id: string;
  Nombre: string;
  Historia: string;
  Imagen: string;
  Genero: string;
  Estado: string;
  Ocupacion: string;
}

async function obtenerPersonajes(): Promise<Personaje[]> {
  const personajes: Personaje[] = [];
  let totalPaginas = 1;

  try {
    // Página 1 para iniciar y obtener cuántas páginas hay
    const res = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=1`);
    const data = await res.json();
    personajes.push(...data.docs);
    totalPaginas = data.totalPages;

    // Resto de las páginas
    for (let p = 2; p <= totalPaginas; p++) {
      const resPagina = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=${p}`);
      const dataPagina = await resPagina.json();
      personajes.push(...dataPagina.docs);
    }

    return personajes;
  } catch (error) {
    console.error('❌ Error al obtener los personajes:', error);
    return [];
  }
}

// 🔍 Test para comprobar que se leen correctamente
obtenerPersonajes().then(personajes => {
  console.log(`✅ Total de personajes obtenidos: ${personajes.length}`);
  console.log('🔍 Primer personaje:', personajes[0]);
}).catch(error => {
  console.error('❌ Error al leer personajes:', error);
});

async function mostrarPersonajes() {
  const contenedor = document.getElementById('contenedor')!;
contenedor.innerHTML = "Hola!";
  const personajes = await obtenerPersonajes();

  personajes.forEach(personaje => {
    const div = document.createElement('div');
    div.className = 'personaje';

    div.innerHTML = `

    <div class="flex flex-wrap">
    <div class="w-48 bg-white rounded-lg shadow-md  border-gray-200">
      <h3 style="font-family: 'Rock Salt', bold" class="font-rock-salt font-bold text-lg text-center mb-3">${personaje.Nombre}</h3>
      <img src="${personaje.Imagen}" alt="${personaje.Nombre}" class="w-32 h-64 mx-auto  object-cover  borderpink-300">
      <div class="mt-4 text-sm text-gray-600">
      <div style="font-family: 'Rock Salt', bold" class="nombre"></div>
        <p class="mb-1"><span class="font-semibold">Género:</span> Mujer</p>
        <p class="mb-1"><span class="font-semibold">Estado:</span> Ficticio</p>
        <p><span class="font-semibold">Ocupación:</span> Ama de casa</p>
      </div>
    </div>
  </div>
    `;

   contenedor.appendChild(div);
  });
}

mostrarPersonajes();