/* ---------- localStorage (catálogo) ---------- */

const carregarFilmesCatalogo = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((obj) => Filme.fromJSON(obj));
  } catch {
    return [];
  }
};

/* ---------- Estado da aplicação ---------- */

let todosFilmes = carregarFilmesCatalogo();

/* ---------- Estatísticas ---------- */

const atualizarEstatisticas = (filmes) => {
  const total    = filmes.length;
  const minutos  = filmes.reduce((acc, f) => acc + f.duracao, 0);
  const horas    = Math.floor(minutos / 60);
  const notaMedia = total > 0
    ? (filmes.reduce((acc, f) => acc + f.nota, 0) / total).toFixed(1)
    : "—";

  document.getElementById("stat-total").textContent   = total;
  document.getElementById("stat-horas").textContent   = `${horas}h`;
  document.getElementById("stat-minutos").textContent = minutos.toLocaleString("pt-BR");
  document.getElementById("stat-nota").textContent    = notaMedia;
};

/* ---------- Renderização de cards ---------- */

const criarCardHTML = (filme) => {
  const poster = filme.capUrl
    ? `<img
         src="${filme.capUrl}"
         alt="Pôster de ${filme.titulo}"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
       />
       <div class="card-poster-placeholder" style="display:none;">${filme.tipoEmoji}</div>`
    : `<div class="card-poster-placeholder">${filme.tipoEmoji}</div>`;

  const btnTrailer = filme.youtubeId
    ? `<button
         class="card-btn"
         title="Assistir trailer"
         aria-label="Assistir trailer de ${filme.titulo}"
         onclick="abrirTrailer('${filme.youtubeId}', '${filme.titulo.replace(/'/g, "\\'")}')"
       >▶️</button>`
    : "";

  const dataFormatada = filme.dataAssistido
    ? new Date(filme.dataAssistido + "T00:00:00").toLocaleDateString("pt-BR")
    : "";

  return `
    <article class="card" data-genero="${filme.genero}" data-id="${filme.id}">
      <div class="card-poster">
        ${poster}
        <span class="card-nota" aria-label="Nota ${filme.notaFormatada}">★ ${filme.notaFormatada}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${filme.titulo}</h3>
        <div class="card-meta">
          <span class="tag tag--tipo">${filme.tipoEmoji} ${filme.tipo}</span>
          <span class="tag">${filme.genero}</span>
          ${filme.ano ? `<span class="tag">${filme.ano}</span>` : ""}
        </div>
        ${filme.sinopse ? `<p class="card-sinopse">${filme.sinopse}</p>` : ""}
        ${dataFormatada ? `<p class="card-duracao" style="font-size:0.72rem;">Assistido em: ${dataFormatada}</p>` : ""}
      </div>
      <div class="card-footer">
        <span class="card-duracao">⏱ ${filme.duracaoFormatada}</span>
        <div class="card-actions">
          ${btnTrailer}
          <button
            class="card-btn"
            title="Remover do catálogo"
            aria-label="Remover ${filme.titulo} do catálogo"
            onclick="removerFilme('${filme.id}')"
          >🗑️</button>
        </div>
      </div>
    </article>`;
};

const renderizarCatalogo = (filmes) => {
  const grid       = document.getElementById("catalogo-grid");
  const emptyState = document.getElementById("empty-state");

  atualizarEstatisticas(filmes);

  if (filmes.length === 0) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  grid.innerHTML = filmes.map(criarCardHTML).join("");
};

/* ---------- Filtros ---------- */

const obterFiltros = () => ({
  tipo:   document.getElementById("filtro-tipo").value,
  genero: document.getElementById("filtro-genero").value,
});

const aplicarFiltros = () => {
  const { tipo, genero } = obterFiltros();

  const filtrados = todosFilmes.filter((f) => {
    const passaTipo   = !tipo   || f.tipo   === tipo;
    const passaGenero = !genero || f.genero === genero;
    return passaTipo && passaGenero;
  });

  renderizarCatalogo(filtrados);
};

document.getElementById("filtro-tipo").addEventListener("change",   aplicarFiltros);
document.getElementById("filtro-genero").addEventListener("change", aplicarFiltros);

/* ---------- Remover obra ---------- */

const removerFilme = (id) => {
  if (!confirm("Remover esta obra do catálogo?")) return;
  todosFilmes = todosFilmes.filter((f) => f.id !== id);
  salvarFilmes(todosFilmes);
  aplicarFiltros();
};

/* ---------- Limpar tudo ---------- */

document.getElementById("btn-limpar-tudo").addEventListener("click", () => {
  if (!confirm("Tem certeza que deseja apagar TODO o catálogo? Esta ação não pode ser desfeita.")) return;
  todosFilmes = [];
  salvarFilmes(todosFilmes);
  aplicarFiltros();
});

/* ---------- Modal de trailer ---------- */

const modal        = document.getElementById("modal-trailer");
const iframe       = document.getElementById("trailer-iframe");
const modalTitle   = document.getElementById("modal-title");
const btnFechar    = document.getElementById("modal-close");

const abrirTrailer = (youtubeId, titulo) => {
  modalTitle.textContent = `Trailer — ${titulo}`;
  iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
  modal.showModal();
};

const fecharModal = () => {
  iframe.src = "";
  modal.close();
};

btnFechar.addEventListener("click", fecharModal);

/* Fechar ao clicar no backdrop */
modal.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal();
});

/* Fechar com Esc (nativo do <dialog>) */
modal.addEventListener("cancel", () => {
  iframe.src = "";
});

/* ---------- Inicialização ---------- */
renderizarCatalogo(todosFilmes);