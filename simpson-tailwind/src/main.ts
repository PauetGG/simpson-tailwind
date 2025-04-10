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

