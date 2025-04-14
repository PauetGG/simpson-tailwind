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

// 🔧 Renderiza las tarjetas
function renderPersonajes(personajes: Personaje[]) {
  const contenedor = document.getElementById('contenedor');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  personajes.forEach(personaje => { 
    const div = document.createElement('div');
    div.className = 'personaje cursor-pointer';

    div.innerHTML = `
      <div class="border-4 border-black border-solid rounded-xl">
        <div class="w-62 h-[450px] bg-white rounded-lg shadow-md border-gray-200 p-2">
          <h3 style="font-family: 'Rock Salt'; font-weight: bold;" class="text-lg text-center mb-3">${personaje.Nombre}</h3>
          <img style="object-fit: contain" src="${personaje.Imagen}" alt="${personaje.Nombre}" class="w-32 h-64 mx-auto object-contain bounce-simpson-hover">
          <div class="mt-4 text-sm text-gray-600">
            <p class="mb-1"><span class="font-semibold">Género:</span> ${personaje.Genero}</p>
            <p class="mb-1"><span class="font-semibold">Estado:</span> ${personaje.Estado}</p>
            <p><span class="font-semibold">Ocupación:</span> ${personaje.Ocupacion}</p>
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
  estado: new Set<string>()
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
  sonidoAlHoverDeBounce();
}

// Filtros género
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

// Filtros estado
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

// Limpiar filtros
document.getElementById('limpiarFiltros')?.addEventListener('click', () => {
  filtrosSeleccionados = { genero: new Set(), estado: new Set() };
  inputBuscador.value = '';

  document.querySelectorAll('.filtro-genero, .filtro-estado').forEach(btn => {
    btn.classList.remove('ring', 'ring-2');
  });

  renderPersonajes(todosLosPersonajes);
  sonidoAlHoverDeBounce();
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
function reproducirDohConCursor() {
  const audio = document.getElementById('dohAudio') as HTMLAudioElement;
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn('❌ Error al reproducir DOH:', err);
    });
  }

  // 🖱️ Cambiar cursor
  document.body.classList.add('custom-cursor');

  // ⏳ Volver al cursor normal después de 1 segundo
  setTimeout(() => {
    document.body.classList.remove('custom-cursor');
  }, 600);
}

// 🎯 Activar en todos los clics
document.addEventListener('click', () => {
  reproducirDohConCursor();
});
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


// 🚀 Ejecutar todo
mostrarPersonajesPorPaginas();
setupBotonAleatorio();
setupModalPiano();










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
