class Filme {
  /**
   * @param {Object} dados - Dados da obra
   * @param {string} dados.titulo
   * @param {string} dados.tipo       - Filme | Série | Documentário | Animação
   * @param {string} dados.genero
   * @param {number} dados.ano
   * @param {number} dados.duracao    - em minutos
   * @param {number} dados.nota       - 0 a 10
   * @param {string} [dados.capUrl]   - URL do poster
   * @param {string} [dados.youtubeId]
   * @param {string} [dados.sinopse]
   * @param {string} [dados.dataAssistido]
   */
  constructor({ titulo, tipo, genero, ano, duracao, nota, capUrl = "", youtubeId = "", sinopse = "", dataAssistido = "" }) {
    this.id           = crypto.randomUUID();
    this.titulo       = titulo.trim();
    this.tipo         = tipo;
    this.genero       = genero;
    this.ano          = Number(ano);
    this.duracao      = Number(duracao);
    this.nota         = Number(nota);
    this.capUrl       = capUrl.trim();
    this.youtubeId    = youtubeId.trim();
    this.sinopse      = sinopse.trim();
    this.dataAssistido = dataAssistido;
    this.criadoEm    = new Date().toISOString();
  }

  /** Retorna a duração formatada (ex: "2h 49min") */
  get duracaoFormatada() {
    const horas   = Math.floor(this.duracao / 60);
    const minutos = this.duracao % 60;
    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
  }

  /** Emoji de tipo */
  get tipoEmoji() {
    const mapa = {
      "Filme": "🎬",
      "Série": "📺",
      "Documentário": "🎥",
      "Animação": "✨",
    };
    return mapa[this.tipo] ?? "🎞️";
  }

  /** Estrelas para a nota */
  get notaFormatada() {
    return this.nota.toFixed(1);
  }

  /**
   * Cria uma instância de Filme a partir de um objeto plano (ex: localStorage).
   * @param {Object} obj
   * @returns {Filme}
   */
  static fromJSON(obj) {
    const filme = new Filme(obj);
    filme.id       = obj.id       ?? filme.id;
    filme.criadoEm = obj.criadoEm ?? filme.criadoEm;
    return filme;
  }
}
const STORAGE_KEY = "cinelog_filmes";
/* ---------- Utilitários de localStorage ---------- */

const carregarFilmes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const salvarFilmes = (filmes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filmes));
};

/* ---------- Toast ---------- */

const toastEl = document.getElementById("toast");
let toastTimer = null;

const exibirToast = (mensagem, tipo = "sucesso") => {
  clearTimeout(toastTimer);
  toastEl.textContent = mensagem;
  toastEl.classList.toggle("toast--error", tipo === "erro");
  toastEl.classList.add("toast--show");

  toastTimer = setTimeout(() => {
    toastEl.classList.remove("toast--show");
  }, 3200);
};

/* ---------- Formulário ---------- */

const form = document.getElementById("cadastro-form");

if (form) {
form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const obterValor = (id) => document.getElementById(id).value;

  const titulo       = obterValor("titulo").trim();
  const tipo         = obterValor("tipo");
  const genero       = obterValor("genero");
  const ano          = obterValor("ano");
  const duracao      = obterValor("duracao");
  const nota         = obterValor("nota");
  const capUrl       = obterValor("capUrl");
  const youtubeId    = obterValor("youtubeId");
  const sinopse      = obterValor("sinopse");
  const dataAssistido = obterValor("dataAssistido");

  /* Validação básica */
  if (!titulo || !tipo || !genero || !ano || !duracao || !nota) {
    exibirToast("Preencha todos os campos obrigatórios.", "erro");
    return;
  }

  if (Number(nota) < 0 || Number(nota) > 10) {
    exibirToast("A nota deve estar entre 0 e 10.", "erro");
    return;
  }

  /* Instanciar e salvar */
  const novoFilme = new Filme({ titulo, tipo, genero, ano, duracao, nota, capUrl, youtubeId, sinopse, dataAssistido });
  const filmes    = carregarFilmes();
  filmes.push(novoFilme);
  salvarFilmes(filmes);

  exibirToast(`"${titulo}" salvo com sucesso! 🎬`);
  form.reset();
});
}