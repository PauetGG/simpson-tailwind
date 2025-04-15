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
let filtroGenero: string = '';
let filtroEstado: string = '';
let offset = 0; // Para rastrear cuántos personajes se han cargado
let isLoading = false; // Para evitar múltiples cargas simultáneas
const batchSize = 20; // Número de personajes por lote
const favoritos: string[] = [];

// 🔧 Renderiza las tarjetas
function renderPersonajes(personajes: Personaje[]) {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  // Limitar a los primeros 20 personajes
  personajes.slice(0, 20).forEach(personaje => {
    const div = document.createElement('div');
    div.className = 'personaje cursor-pointer';

    div.innerHTML = `
    <div class="border-4 border-black border-solid rounded-xl relative">
      <div class="w-62 h-[600px] bg-white rounded-lg shadow-md border-gray-200 p-2 flex flex-col border-b-4 border-r-4 border-gray-300">
        <h3 style="font-family: 'Simpsonfont'; font-weight: bold;" class="text-lg text-center mb-3">${personaje.Nombre}</h3>
        
        <div class="rounded-lg p-2 mb-4 flex-grow flex items-center justify-center">
          <img 
            style="object-fit: contain" 
            src="${personaje.Imagen}" 
            alt="${personaje.Nombre}" 
            class="w-32 h-64 mx-auto object-contain bounce-simpson-hover"
          >
        </div>
        <div class="h-[200px] text-sm text-gray-600 bg-gray-200 rounded-lg p-2 border-b-4 border-l-4 border-gray-300 relative flex flex-col">
        <div class="flex justify-end">
         <button class="btn-fav absolute top-1 right-1 text-2xl text-gray-300 hover:scale-110 transition-transform">🤍</button>
        </div>
        <div class="text-center mt-1">
          <p class="mb-1"><span style="font-family: 'Simpsonfont';" class="font-semibold">Genero: <br></span> ${personaje.Genero}</p>
          <p class="mb-1"><span style="font-family: 'Simpsonfont';" class="font-semibold">Estado: <br></span> ${personaje.Estado}</p>
          <p><span style="font-family: 'Simpsonfont';" class="font-semibold">Ocupación: <br></span> ${personaje.Ocupacion}</p>
        </div>
        </div>
      </div>
    </div>
  `;
  const btnFav = div.querySelector('.btn-fav') as HTMLButtonElement;
  const nombre = personaje.Nombre;
  
  // Estado inicial del corazón
  if (favoritos.includes(nombre)) {
    btnFav.textContent = '❤️';
    btnFav.classList.add('active');
  }
  
  // Toggle al hacer clic
  btnFav.addEventListener('click', (e) => {
    e.stopPropagation(); // ⛔️ Evita que se dispare el modal
  
    const index = favoritos.indexOf(nombre);
  
    if (index === -1) {
      favoritos.push(nombre);
      btnFav.textContent = '❤️';
      btnFav.classList.add('active');
    } else {
      favoritos.splice(index, 1);
      btnFav.textContent = '🤍';
      btnFav.classList.remove('active');
    }
  
    console.log('Favoritos:', favoritos);
  });
  

    div.addEventListener('click', () => {
      mostrarModal(personaje);
    });

    contenedor.appendChild(div);
  });
}

// 🔁 Carga por páginas
async function mostrarPersonajesPorPaginas() {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;

  try {
    const res = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=1`);
    const data = await res.json();
    renderPersonajes(data.docs);
    sonidoAlHoverDeBounce();
    todosLosPersonajes = data.docs;

    const totalPaginas = data.totalPages;

    for (let p = 2; p <= totalPaginas; p++) {
      const resPagina = await fetch(`https://apisimpsons.fly.dev/api/personajes?limit=100&page=${p}`);
      const dataPagina = await resPagina.json();
      todosLosPersonajes = todosLosPersonajes.concat(dataPagina.docs);
      renderPersonajes(dataPagina.docs);
      sonidoAlHoverDeBounce();
    }

  } catch (error) {
    console.error('❌ Error al obtener los personajes:', error);
    contenedor.innerHTML = 'Error al cargar personajes.';
  }
}

const inputBuscador = document.getElementById('buscador') as HTMLInputElement;

inputBuscador.addEventListener('input', aplicarFiltrosYBuscar);

let filtrosSeleccionados = {
  genero: new Set<string>(),
  estado: new Set<string>(),
  ocupacion: '' 
};


function aplicarFiltrosYBuscar() {
  const texto = inputBuscador.value.toLowerCase().trim();
  const filtroOcupacion = selectorOcupacion.value.toLowerCase().trim();

  const filtrados = todosLosPersonajes.filter(p => {
    const nombre = p.Nombre?.toLowerCase().trim() || '';
    const genero = p.Genero?.toLowerCase().trim() || '';
    const estado = p.Estado?.toLowerCase().trim() || '';
    const ocupacion = p.Ocupacion?.toLowerCase().trim() || '';

    const coincideNombre = nombre.includes(texto);
    const coincideGenero = filtroGenero === '' || genero === filtroGenero;
    const coincideEstado = filtroEstado === '' || estado === filtroEstado;
    const coincideOcupacion = filtroOcupacion === '' || ocupacion.startsWith(filtroOcupacion);

    return coincideNombre && coincideGenero && coincideEstado && coincideOcupacion;
  });

  renderPersonajes(filtrados);
  sonidoAlHoverDeBounce();
}

// Carga un lote de personajes con un retardo
// Modificar cargarMasPersonajes para que permita añadir al contenedor existente
async function cargarMasPersonajes(personajes: Personaje[]) {
  if (isLoading) return; // Evita cargar si ya está en proceso

  isLoading = true;

  // Verificar si ya existe el contenedor de carga
  let loadingContainer = document.getElementById('loadingContainer') as HTMLDivElement;
  if (!loadingContainer) {
    // Crear el contenedor para el GIF y el texto
    loadingContainer = document.createElement('div');
    loadingContainer.id = 'loadingContainer';
    loadingContainer.className = 'flex items-center justify-center space-x-4 mt-4';

    // Crear el GIF
    const loadingGif = document.createElement('img');
    loadingGif.src = 'https://media.giphy.com/media/lyBCBlxAI0bo4/giphy.gif';
    loadingGif.alt = 'Cargando...';
    loadingGif.style.width = '100px';
    loadingGif.style.height = '100px';
    loadingGif.id = 'loadingGif';

    // Crear el texto
    const loadingText = document.createElement('span');
    loadingText.style="font-family: 'Simpsonfont'"
    loadingText.textContent = 'Cargando Simpsons...';
    loadingText.className = 'text-lg font-bold text-yellow-500';

    // Agregar el GIF y el texto al contenedor
    loadingContainer.appendChild(loadingGif);
    loadingContainer.appendChild(loadingText);

    // Agregar el contenedor al final del contenedor principal
    const contenedor = document.getElementById('contenedor');
    if (contenedor) {
      contenedor.parentElement?.appendChild(loadingContainer);
    }
  }

  // Mostrar el contenedor de carga
  loadingContainer.style.display = 'flex';

  // Simular retardo de carga
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Cargar el siguiente lote
  const siguienteLote = personajes.slice(offset, offset + batchSize);
  const contenedor = document.getElementById('contenedor');
  if (contenedor) {
    siguienteLote.forEach(personaje => {
      const div = document.createElement('div');
      div.className = 'personaje cursor-pointer';

      div.innerHTML = `
        <div class="border-4 border-black border-solid rounded-xl">
          <div class="w-62 h-[600px] bg-white rounded-lg shadow-md border-gray-200 p-2 flex flex-col border-b-4 border-r-4 border-gray-300">
            <h3 style="font-family: 'Simpsonfont'; font-weight: bold;" class="text-lg text-center mb-3">${personaje.Nombre}</h3>
            <div class="rounded-lg p-2 mb-4 flex-grow flex items-center justify-center">
              <img 
                style="object-fit: contain" 
                src="${personaje.Imagen}" 
                alt="${personaje.Nombre}" 
                class="w-32 h-64 mx-auto object-contain bounce-simpson-hover"
              >
            </div>
            <div class="h-[200px] text-sm text-gray-600 text-center bg-gray-200 rounded-lg p-2 border-b-4 border-l-4 border-gray-300 content-center">
              <p class="mb-1"><span style="font-family: 'Simpsonfont';" class="font-semibold">Genero: <br> </span> ${personaje.Genero}</p>
              <p class="mb-1"><span style="font-family: 'Simpsonfont';" class="font-semibold">Estado: <br> </span> ${personaje.Estado}</p>
              <p><span style="font-family: 'Simpsonfont';" class="font-semibold">Ocupación: <br> </span> ${personaje.Ocupacion}</p>
            </div>
          </div>
        </div>
      `;

      div.addEventListener('click', () => {
        mostrarModal(personaje);
      });

      contenedor.appendChild(div);
    });
  }

  // Ocultar el contenedor de carga
  loadingContainer.style.display = 'none';

  offset += batchSize; // Actualiza el offset
  isLoading = false;
}

// Filtros género
document.querySelectorAll('.filtro-genero').forEach(btn => {
  btn.addEventListener('click', () => {
    const genero = btn.getAttribute('data-genero')?.toLowerCase().trim();
    if (!genero) return;

    // Quitar selección de todos
    document.querySelectorAll('.filtro-genero').forEach(b => b.classList.remove('ring', 'ring-2'));

    if (filtroGenero === genero) {
      filtroGenero = ''; // desactivar
    } else {
      filtroGenero = genero;
      btn.classList.add('ring', 'ring-2');
    }

    aplicarFiltrosYBuscar();
  });
});

// Filtros estado
document.querySelectorAll('.filtro-estado').forEach(btn => {
  btn.addEventListener('click', () => {
    const estado = btn.getAttribute('data-estado')?.toLowerCase().trim();
    if (!estado) return;

    document.querySelectorAll('.filtro-estado').forEach(b => b.classList.remove('ring', 'ring-2'));

    if (filtroEstado === estado) {
      filtroEstado = '';
    } else {
      filtroEstado = estado;
      btn.classList.add('ring', 'ring-2');
    }

    aplicarFiltrosYBuscar();
  });
});



// Limpiar filtros
document.getElementById('limpiarFiltros')?.addEventListener('click', () => {
  filtrosSeleccionados = { genero: new Set(), estado: new Set(), ocupacion:''};
  inputBuscador.value = '';
  selectorOcupacion.value = '';
  filtrosSeleccionados.ocupacion = '';


  document.querySelectorAll('.filtro-genero, .filtro-estado').forEach(btn => {
    btn.classList.remove('ring', 'ring-2');
  });

  renderPersonajes(todosLosPersonajes);
  sonidoAlHoverDeBounce();
  
});
const btnMostrarFavoritos = document.getElementById('mostrarFavoritos')!;
let mostrandoFavoritos = false; // ⬅️ Estado de toggle

btnMostrarFavoritos.addEventListener('click', () => {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;

  if (mostrandoFavoritos) {
    // ⬅️ Si ya está activado, volvemos a mostrar todos con filtros
    aplicarFiltrosYBuscar();
    mostrandoFavoritos = false;
    btnMostrarFavoritos.textContent = '❤️ Ver Favoritos';
    return;
  }

  // ⬅️ Si está desactivado, activamos y mostramos favoritos
  if (favoritos.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center text-xl font-bold text-gray-500 mt-8">
        No hay ningún Simpson favorito.
      </div>
    `;
  } else {
    const favoritosFiltrados = todosLosPersonajes.filter(p =>
      favoritos.includes(p.Nombre)
    );
    renderPersonajes(favoritosFiltrados);
  }

  mostrandoFavoritos = true;
  btnMostrarFavoritos.textContent = '🔁 Volver a Todos';
});

// 🔄 Botón aleatorio
async function setupBotonAleatorio() {
  const personajes = await obtenerTodosLosPersonajes();
  const boton = document.getElementById('randomButton');
  const randomContainer = document.getElementById('randomContainer');

  if (!boton || !randomContainer) return;

  boton.addEventListener('click', () => {
    const aleatorio = personajes[Math.floor(Math.random() * personajes.length)];

    randomContainer.innerHTML = `
      <div class="bg-yellow-100 rounded-xl border-4 border-black p-6 w-80 h-[450px] relative shadow-lg text-center z-[60]">
        <button id="cerrarModal" class="absolute top-2 right-2 text-black font-bold text-lg cursor-pointer">✖</button>
        <h2 class="text-xl font-bold mb-3" style="font-family: 'Rock Salt';">${aleatorio.Nombre}</h2>
        <img src="${aleatorio.Imagen}" alt="${aleatorio.Nombre}" class="w-40 h-64 object-contain mx-auto rounded mb-3 bounce-simpson-hover" />
        <div class="text-sm text-gray-700 text-left">
          <p><strong>Género:</strong> ${aleatorio.Genero}</p>
          <p><strong>Estado:</strong> ${aleatorio.Estado}</p>
          <p><strong>Ocupación:</strong> ${aleatorio.Ocupacion}</p>
        </div>
      </div>
    `;

    randomContainer.classList.remove('hidden');

    setTimeout(() => {
      document.querySelector('#cerrarModal')?.addEventListener('click', () => {
        randomContainer.classList.add('hidden');
        randomContainer.innerHTML = '';
      });
      sonidoAlHoverDeBounce();
    }, 0);
  });
}
const selectorOcupacion = document.getElementById('selectorOcupacion') as HTMLSelectElement;

selectorOcupacion.addEventListener('change', () => {
  filtrosSeleccionados.ocupacion = selectorOcupacion.value;
  aplicarFiltrosYBuscar();
});

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
  return personajes;
}

function mostrarModal(personaje: Personaje) {
  const randomContainer = document.getElementById('randomContainer');
  if (!randomContainer) return;

  randomContainer.classList.remove('hidden');
  randomContainer.innerHTML = `
    <div class="bg-yellow-100 rounded-xl border-4 border-black p-6 w-80 h-[450px] relative shadow-lg text-center z-[60]">
      <button class="cerrarModal absolute top-2 right-2 text-black font-bold text-lg cursor-pointer">✖</button>
      <h2 class="text-xl font-bold mb-3" style="font-family: 'Rock Salt';">${personaje.Nombre}</h2>
      <img src="${personaje.Imagen}" alt="${personaje.Nombre}" class="w-40 h-64 object-contain mx-auto rounded mb-3 bounce-simpson-hover" />
      <div class="text-sm text-gray-700 text-left">
        <p><strong>Género:</strong> ${personaje.Genero}</p>
        <p><strong>Estado:</strong> ${personaje.Estado}</p>
        <p><strong>Ocupación:</strong> ${personaje.Ocupacion}</p>
      </div>
    </div>
  `;

  setTimeout(() => {
    document.querySelector('.cerrarModal')?.addEventListener('click', () => {
      randomContainer.classList.add('hidden');
      randomContainer.innerHTML = '';
    });

    sonidoAlHoverDeBounce(); // ✅ ACTUALIZA los listeners después de que se creó el modal
  }, 0);
}

function sonidoAlHoverDeBounce() {
  const audio = document.getElementById('boingAudio') as HTMLAudioElement;
  const elementos = document.querySelectorAll('.bounce-simpson-hover');

  elementos.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(() => {
        }).catch(err => {
          console.warn('❌ Error al reproducir el audio:', err);
        });
      }
    });
  });
}

const teclaToSonido: { [key: string]: string } = {
  a: 'notaC',
  s: 'notaD',
  d: 'notaE',
  f: 'notaF',
  g: 'notaG',
  h: 'notaA',
  j: 'notaB',
  w: 'notaCs',
  e: 'notaDs',
  t: 'notaFs',
  y: 'notaGs',
  u: 'notaAs'
};
function setupModalPiano() {
  const pianoModal = document.getElementById('modalPiano')!;
  const abrirBtn = document.getElementById('pianoButton')!;
  const cerrarBtn = document.getElementById('cerrarPiano')!;

  abrirBtn.addEventListener('click', () => {
    pianoModal.classList.remove('hidden');
  });

  cerrarBtn.addEventListener('click', () => {
    pianoModal.classList.add('hidden');
  });

  document.querySelectorAll<HTMLButtonElement>('.tecla').forEach(tecla => {
    tecla.addEventListener('click', () => {
      const idSonido = tecla.dataset.sonido;
      const audio = document.getElementById(idSonido!) as HTMLAudioElement;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    });
  });
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('modalPiano');
    if (!modal || modal.classList.contains('hidden')) return;
  
    const letra = e.key.toLowerCase();
    const sonidoId = teclaToSonido[letra];
    if (!sonidoId) return;
  
    const audio = document.getElementById(sonidoId) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  
    // 🔁 Encuentra la tecla visual correspondiente
    const tecla = [...document.querySelectorAll('.tecla-blanca, .tecla-negra')]
      .find(t => t instanceof HTMLButtonElement && t.dataset.sonido === sonidoId);
  
    if (tecla) {
      tecla.classList.add('presionada');
  
      // Quitar la clase tras un corto delay (como un "rebote")
      setTimeout(() => {
        tecla.classList.remove('presionada');
      }, 150);
    }
  });
}
function setupQuizModal() {
  const quizButton = document.getElementById('quizButton')!;
  const quizModal = document.getElementById('quizModal')!;
  const cerrarQuiz = document.getElementById('cerrarQuiz')!;
  const playQuizSound = document.getElementById('playQuizSound')!;
  const quizOptions = document.getElementById('quizOptions')!;

  const sonidos = [
    { id: 'homero1', personaje: 'Homer' },
    { id: 'bart1', personaje: 'Bart' },
    { id: 'marge1', personaje: 'Marge' },
    { id: 'lisa1', personaje: 'Lisa' },
    { id: 'nelson1', personaje: 'Nelson'},
    { id: 'flanders1', personaje: 'Flanders'},
    { id: 'apu1', personaje: 'Apu'},
    { id: 'milhouse1', personaje: 'Milhouse'},
    { id: 'krusty1', personaje: 'Krusty el payaso'},
    { id: 'barney1', personaje: 'Barney'},
    { id: 'bob1', personaje: 'Bob'},
    { id: 'burns1', personaje: 'Burns'},
    { id: 'duff1', personaje: 'Duff'},
    { id: 'edna1', personaje: 'Edna'},
    { id: 'gorgory1', personaje: 'Gorgory'},
    { id: 'maggie1', personaje: 'Maggie'},
    { id: 'moe1', personaje: 'Moe'},
    { id: 'otto1', personaje: 'Otto'},
    { id: 'ralph1', personaje: 'Ralph'},
    { id: 'skinner1', personaje: 'Skinner'},
    { id: 'smithers1', personaje: 'Smithers'},
  ];

  let sonidoActual: { id: string, personaje: string } | null = null;
  let ultimoSonidoIndex: number | null = null;

  quizButton.addEventListener('click', () => {
    quizModal.classList.remove('hidden');
    iniciarQuiz();
  });

  cerrarQuiz.addEventListener('click', () => {
    quizModal.classList.add('hidden');
    sonidoActual = null;
    quizOptions.innerHTML = '';
  });

  playQuizSound.addEventListener('click', () => {
    if (sonidoActual) {
      const audio = document.getElementById(sonidoActual.id) as HTMLAudioElement;
      audio.currentTime = 0;
      audio.play();
    }
  });

  function iniciarQuiz() {
    quizOptions.innerHTML = '';
    quizOptions.className = 'grid grid-cols-2 gap-4 mt-4';

    // 🔊 Elegir un sonido aleatorio distinto al anterior
    let indexCorrecto: number;
    do {
      indexCorrecto = Math.floor(Math.random() * sonidos.length);
    } while (indexCorrecto === ultimoSonidoIndex && sonidos.length > 1);

    ultimoSonidoIndex = indexCorrecto;
    sonidoActual = sonidos[indexCorrecto];
    const nombreCorrecto = sonidoActual.personaje;

    const opciones: any[] = [];

    // ✅ Buscar personajes cuyo nombre contenga el del personaje del sonido
    const coincidencias = todosLosPersonajes.filter(p =>
      p.Nombre.toLowerCase().includes(nombreCorrecto.toLowerCase())
    );

    if (coincidencias.length === 0) {
      console.warn(`❌ No se encontraron personajes que coincidan con "${nombreCorrecto}"`);
      quizOptions.innerHTML = '<p class="text-red-500">No hay coincidencias para este personaje.</p>';
      return;
    }

    // Elegir uno aleatorio de las coincidencias como opción correcta
    const correcto = coincidencias[Math.floor(Math.random() * coincidencias.length)];
    opciones.push(correcto);

    // ❌ Personajes incorrectos = todos los que no están entre las coincidencias
    const candidatos = todosLosPersonajes.filter(p =>
      !coincidencias.includes(p)
    );

    while (opciones.length < 4) {
      const random = candidatos[Math.floor(Math.random() * candidatos.length)];
      if (!opciones.find(p => p.Nombre === random.Nombre)) {
        opciones.push(random);
      }
    }

    // 🎲 Mezclar opciones
    opciones.sort(() => Math.random() - 0.5);

    // 🧩 Crear botones de opciones
    opciones.forEach(personaje => {
      const btn = document.createElement('button');
      btn.className = 'flex flex-col items-center border-4 border-black rounded-xl p-2 bg-white hover:scale-105 transition-transform';
      btn.style.backgroundColor = 'white';

      const img = document.createElement('img');
      img.src = personaje.Imagen;
      img.alt = personaje.Nombre;
      img.title = personaje.Nombre;
      img.className = 'w-16 aspect-[1/2] object-contain mx-auto';
      btn.appendChild(img);

      const nombre = document.createElement('p');
      nombre.textContent = personaje.Nombre;
      nombre.className = 'mt-2 text-sm font-semibold text-center';
      btn.appendChild(nombre);

      btn.addEventListener('click', () => {
        const esCorrecto = personaje.Nombre === correcto.Nombre;
        btn.style.backgroundColor = esCorrecto ? 'rgb(74 222 128)' : 'rgb(248 113 113)';

        if (esCorrecto) {
          setTimeout(() => {
            iniciarQuiz();
          }, 1000);
        } else {
          setTimeout(() => {
            btn.style.backgroundColor = 'white';
          }, 1000);
        }
      });

      quizOptions.appendChild(btn);
    });
  }
}

// 🚀 Ejecutar todo
mostrarPersonajesPorPaginas();
setupBotonAleatorio();
setupModalPiano();
setupQuizModal();

class BackgroundToggler {
  private toggleButton: HTMLButtonElement;
  private container: HTMLElement;
  private backgrounds: { url: string; buttonText: string }[];
  private currentIndex: number;

  constructor() {
    this.toggleButton = document.getElementById('bgToggle') as HTMLButtonElement;
    this.container = document.getElementById('backgroundContainer') as HTMLElement;
    
    this.backgrounds = [
      { 
        url: 'url("https://ia904506.us.archive.org/1/items/AfterDarkSimpsons/simpsons.png")',
        buttonText: '🌅' 
      },
      { 
        url: 'url("https://preview.redd.it/92uojpw8udf41.jpg?auto=webp&s=410fffa16a851319b19f195976654a030748647f")',
        buttonText: '🌚' 
      }
    ];
    
    this.currentIndex = 0;
    this.init();
  }

  private init(): void {
    this.setBackground();
    this.toggleButton.addEventListener('click', () => this.toggleBackground());
  }

  private toggleBackground(): void {
    this.currentIndex = (this.currentIndex + 1) % this.backgrounds.length;
    this.setBackground();
  }

  private setBackground(): void {
    const { url, buttonText } = this.backgrounds[this.currentIndex];
    
    // Aplicar cambios con transición
    this.container.style.opacity = '0';
    
    setTimeout(() => {
      this.container.style.backgroundImage = url;
      this.container.style.opacity = '1';
      this.toggleButton.textContent = buttonText;
      
      // Cambiar clase de color del botón según el modo
      if (this.currentIndex === 0) {
        this.toggleButton.classList.remove('bg-yellow-500', 'text-yellow-600');
        this.toggleButton.classList.add('bg-yellow-500', 'text-yellow-500');
      } else {
        this.toggleButton.classList.remove('bg-yellow-500', 'text-yellow-600');
        this.toggleButton.classList.add('bg-yellow-500', 'text-yellow-500');
      }
    }, 300); // Coincide con la duración de la transición
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BackgroundToggler();
});
document.addEventListener('scroll', async () => {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;

  // Detecta si el scroll está cerca del final del contenedor
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const contenedorHeight = contenedor.offsetHeight;

  if (scrollTop + windowHeight >= contenedorHeight - 100 && !isLoading) {
    await cargarMasPersonajes(todosLosPersonajes); // Carga 20 personajes más
  }
});

class SimpsonScrollButton {
  private button: HTMLButtonElement;
  private isVisible: boolean = false;

  constructor() {
    // Crear el botón
    this.button = document.createElement('button');
    this.button.className = 'fixed bottom-6 right-6 z-50 p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-all duration-300 shadow-lg focus:outline-none';
    this.button.style.display = 'none';
    this.button.setAttribute('aria-label', 'Volver arriba');

    // Añadir la imagen
    const img = document.createElement('img');
    img.src = 'https://pngimg.com/uploads/simpsons/simpsons_PNG36.png';
    img.alt = 'Volver arriba';
    img.className = 'w-16 h-16 object-contain';
    this.button.appendChild(img);

    // Añadir evento de click
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Añadir el botón al cuerpo del documento
    document.body.appendChild(this.button);

    // Configurar el evento de scroll
    window.addEventListener('scroll', () => this.handleScroll());
  }

  private handleScroll(): void {
    const shouldBeVisible = window.pageYOffset > 300;
    
    if (shouldBeVisible !== this.isVisible) {
      this.isVisible = shouldBeVisible;
      this.button.style.display = this.isVisible ? 'block' : 'none';
      
      // Opcional: animación de entrada/salida
      if (this.isVisible) {
        this.button.classList.remove('opacity-0', 'translate-y-4');
        this.button.classList.add('opacity-100');
      } else {
        this.button.classList.add('opacity-0', 'translate-y-4');
        this.button.classList.remove('opacity-100');
      }
    }
  }
}

// Inicializar el botón cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new SimpsonScrollButton();
});