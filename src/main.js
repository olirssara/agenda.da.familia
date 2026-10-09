import { createClient } from "@supabase/supabase-js";

// ============================================================
// 1. CONEXÃO COM SUPABASE
// ============================================================
const supabase = createClient(
  "https://wmvbzhfmmyxbtziwmcrq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdmJ6aGZtbXl4YnR6aXdtY3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MDEyMjIsImV4cCI6MjEwNjk3NzIyMn0.BaOs7r5-UxvL1MBS2JwE_B_JGSFphlak6dLB5rHOX7g"
);
console.log("Supabase conectado!");

// ============================================================
// 2. PALETA DE CORES ÚNICAS & PESSOAS DA FAMÍLIA
// ============================================================
const PALETA_CORES = [
  "#5a7a52", // Verde Oliva
  "#3f6c51", // Verde Floresta
  "#c26a51", // Terracota
  "#4b749f", // Azul Ardósia
  "#9c5b73", // Rosa Queimado
  "#c48937", // Mostarda/Âmbar
  "#735d78", // Lavanda
  "#3a7d77", // Petróleo
  "#8c6239", // Marrom Acobreado
  "#b04a4a", // Carmim
  "#4a607a", // Azul Índigo
  "#7d6608", // Dourado Escuro
  "#6c5b7b", // Ameixa
  "#2e604d"  // Verde Menta Profundo
];

const PESSOAS_PADRAO = [
  { id: "p-diogo", nome: "Diogo", cor: "#5a7a52", foto: "", whatsapp: "(11) 98765-4321", dataNascimento: "1990-03-15", email: "diogo@familia.com" },
  { id: "p-iara", nome: "Iara", cor: "#9c5b73", foto: "", whatsapp: "(11) 98765-4322", dataNascimento: "1992-07-22", email: "iara@familia.com" },
  { id: "p-davi", nome: "Davi", cor: "#4b749f", foto: "", whatsapp: "(11) 98765-4323", dataNascimento: "2015-11-04", email: "" },
  { id: "p-sofia", nome: "Sofia", cor: "#c26a51", foto: "", whatsapp: "(11) 98765-4324", dataNascimento: "2018-02-18", email: "" },
  { id: "p-sara", nome: "Sara", cor: "#c48937", foto: "", whatsapp: "(11) 98765-4325", dataNascimento: "1994-09-10", email: "sara@familia.com" },
  { id: "p-benjamim", nome: "Benjamim", cor: "#3a7d77", foto: "", whatsapp: "(11) 98765-4326", dataNascimento: "2021-06-30", email: "" }
];

let pessoasFamilia = JSON.parse(localStorage.getItem("pessoas_familia") || "null");
if (!pessoasFamilia || !Array.isArray(pessoasFamilia) || pessoasFamilia.length === 0) {
  pessoasFamilia = PESSOAS_PADRAO;
  localStorage.setItem("pessoas_familia", JSON.stringify(pessoasFamilia));
}

// Garante que cada pessoa tenha uma cor única desde a inicialização
function garantirCoresUnicasEMigrar() {
  const coresUsadas = new Set();
  let alterou = false;

  pessoasFamilia.forEach(p => {
    const corLower = (p.cor || "").toLowerCase();
    if (!corLower || coresUsadas.has(corLower)) {
      const corLivre = PALETA_CORES.find(c => !coresUsadas.has(c.toLowerCase())) ||
        `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      p.cor = corLivre;
      alterou = true;
    }
    coresUsadas.add(p.cor.toLowerCase());
  });

  if (alterou) {
    salvarPessoas();
  }
}
garantirCoresUnicasEMigrar();

function salvarPessoas() {
  localStorage.setItem("pessoas_familia", JSON.stringify(pessoasFamilia));
}

function obterPessoaPorNome(nome) {
  if (!nome) return null;
  const limpo = nome.trim().toLowerCase();
  return pessoasFamilia.find(p => p.nome.toLowerCase() === limpo) || null;
}

function obterPessoaPorId(id) {
  if (!id) return null;
  return pessoasFamilia.find(p => String(p.id) === String(id)) || null;
}

function obterCorPessoa(nome) {
  const p = obterPessoaPorNome(nome);
  return p ? p.cor : "#697653";
}

function parsearParticipantes(pessoaStr) {
  if (!pessoaStr) return [];
  if (pessoaStr.trim().toLowerCase() === "todos") {
    return pessoasFamilia.map(p => p.nome);
  }
  return pessoaStr.split(",").map(p => p.trim()).filter(Boolean);
}

function obterPessoaComCor(corHex, ignorarId = null) {
  if (!corHex) return null;
  const corAlvo = corHex.trim().toLowerCase();
  return pessoasFamilia.find(p => {
    if (ignorarId && String(p.id) === String(ignorarId)) return false;
    return (p.cor || "").trim().toLowerCase() === corAlvo;
  }) || null;
}

// Usuário ativo no aparelho
let usuarioAtivoId = localStorage.getItem("agenda_usuario_ativo_id") || (pessoasFamilia[0]?.id || null);

function definirUsuarioAtivo(id) {
  usuarioAtivoId = id;
  localStorage.setItem("agenda_usuario_ativo_id", id);
}

// Helpers de datas e idades
function formatarDataISO(d) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-");
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularIdade(dataNascISO, dataReferenciaISO = null) {
  if (!dataNascISO) return null;
  const nasc = new Date(dataNascISO + "T00:00:00");
  const ref = dataReferenciaISO ? new Date(dataReferenciaISO + "T00:00:00") : new Date();
  if (isNaN(nasc.getTime())) return null;

  let idade = ref.getFullYear() - nasc.getFullYear();
  const m = ref.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < nasc.getDate())) {
    idade--;
  }
  return Math.max(0, idade);
}

// ============================================================
// 3. ESTADO GLOBAL DA AGENDA
// ============================================================
let eventosCarregados = [];
let visualizacaoAtual = "mes"; // "dia" | "semana" | "mes" | "ano"
let dataReferencia = new Date();
let miniDataReferencia = new Date();
let dataSelecionada = null;

let filtrosPessoasAtivas = new Set();

// ============================================================
// 4. METADADOS DE EVENTOS: RECORRÊNCIA E ALARME
// ============================================================
let recorrenciasEventos = JSON.parse(localStorage.getItem("agenda_eventos_recorrencias") || "{}");

function salvarRecorrenciasLocal() {
  localStorage.setItem("agenda_eventos_recorrencias", JSON.stringify(recorrenciasEventos));
}

function formatarTextoAlarme(minutos) {
  if (minutos === null || minutos === undefined || minutos === "none" || minutos === "") return "Sem lembrete";
  const m = parseInt(minutos, 10);
  if (isNaN(m) || m < 0) return "Sem lembrete";
  if (m === 0) return "No horário do evento";
  if (m < 60) return `${m} minutos antes`;
  if (m === 60) return "1 hora antes";
  if (m < 1440) return `${Math.round(m / 60)} horas antes`;
  if (m === 1440) return "1 dia antes (24h antes)";
  if (m === 2880) return "2 dias antes (48h antes)";
  if (m >= 10080) return "1 semana antes";
  return `${Math.round(m / 1440)} dias antes`;
}

function decodificarMetadadosObservacao(observacao) {
  if (!observacao) return { textoLimpo: "", configRec: null, alarmeMin: "20" };

  let texto = observacao;
  let configRec = null;
  let alarmeMin = "20";

  const matchRec = texto.match(/\[REC:([a-z]+):([0-9]+):?([^\]]*)\]/i);
  if (matchRec) {
    configRec = {
      ativo: true,
      tipo: matchRec[1],
      intervalo: parseInt(matchRec[2], 10) || 1,
      fim: matchRec[3] ? matchRec[3].trim() : null
    };
    texto = texto.replace(matchRec[0], "");
  }

  const matchAlm = texto.match(/\[ALM:([a-z0-9]+)\]/i);
  if (matchAlm) {
    alarmeMin = matchAlm[1];
    texto = texto.replace(matchAlm[0], "");
  }

  return { textoLimpo: texto.trim(), configRec, alarmeMin };
}

function codificarMetadadosObservacao(texto, configRec, alarmeMin) {
  let resultado = (texto || "").trim();
  if (configRec && configRec.ativo) {
    resultado += ` [REC:${configRec.tipo}:${configRec.intervalo || 1}:${configRec.fim || ""}]`;
  }
  if (alarmeMin && alarmeMin !== "none") {
    resultado += ` [ALM:${alarmeMin}]`;
  }
  return resultado;
}

function obterConfigRecorrencia(evento) {
  if (!evento) return null;
  const local = recorrenciasEventos[String(evento.id)];
  if (local && local.ativo) return local;

  const { configRec } = decodificarMetadadosObservacao(evento.observacao);
  if (configRec) {
    recorrenciasEventos[String(evento.id)] = configRec;
    salvarRecorrenciasLocal();
    return configRec;
  }
  return null;
}

function eventoOcorreNaData(evento, dataISO) {
  if (!evento || !evento.data || !dataISO) return false;
  if (evento.data === dataISO) return true;

  const config = obterConfigRecorrencia(evento);
  if (!config || !config.ativo) return false;

  if (dataISO < evento.data) return false;
  if (config.fim && dataISO > config.fim) return false;

  const dInicio = new Date(evento.data + "T00:00:00");
  const dAlvo = new Date(dataISO + "T00:00:00");
  const intervalo = Math.max(1, parseInt(config.intervalo, 10) || 1);

  if (config.tipo === "diario") {
    const diffDias = Math.round((dAlvo.getTime() - dInicio.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias >= 0 && (diffDias % intervalo === 0);
  }

  if (config.tipo === "semanal") {
    if (dInicio.getDay() !== dAlvo.getDay()) return false;
    const diffDias = Math.round((dAlvo.getTime() - dInicio.getTime()) / (1000 * 60 * 60 * 24));
    const diffSemanas = Math.round(diffDias / 7);
    return diffSemanas >= 0 && (diffSemanas % intervalo === 0);
  }

  if (config.tipo === "mensal") {
    if (dInicio.getDate() !== dAlvo.getDate()) return false;
    const diffMeses = (dAlvo.getFullYear() - dInicio.getFullYear()) * 12 + (dAlvo.getMonth() - dInicio.getMonth());
    return diffMeses >= 0 && (diffMeses % intervalo === 0);
  }

  if (config.tipo === "anual") {
    if (dInicio.getMonth() !== dAlvo.getMonth() || dInicio.getDate() !== dAlvo.getDate()) return false;
    const diffAnos = dAlvo.getFullYear() - dInicio.getFullYear();
    return diffAnos >= 0 && (diffAnos % intervalo === 0);
  }

  return false;
}

// ============================================================
// 5. ANIVERSÁRIOS AUTOMÁTICOS NO CALENDÁRIO
// ============================================================
function obterEventosAniversarios(anoAlvo) {
  const eventosAniversario = [];

  pessoasFamilia.forEach(p => {
    if (!p.dataNascimento) return;
    const partes = p.dataNascimento.split("-");
    if (partes.length !== 3) return;

    const mesNasc = partes[1];
    const diaNasc = partes[2];
    const dataAniverISO = `${anoAlvo}-${mesNasc}-${diaNasc}`;

    const idade = calcularIdade(p.dataNascimento, dataAniverISO);
    const idadeTexto = idade !== null ? `(${idade} anos)` : "";

    eventosAniversario.push({
      id: `aniv-${p.id}-${anoAlvo}`,
      nome: `🎂 Aniversário de ${p.nome} ${idadeTexto}`.trim(),
      pessoa: p.nome,
      data: dataAniverISO,
      hora: "08:00:00",
      local: "Em família ❤️",
      transporte: "casa",
      observacao: `Dia especial de ${p.nome}! Deixe uma mensagem carinhosa.`,
      ehAniversario: true,
      pessoaId: p.id
    });
  });

  return eventosAniversario;
}

// ============================================================
// 6. FILTRO MÚLTIPLO DE EVENTOS
// ============================================================
function obterEventosFiltrados(anoReferencia = null) {
  const ano = anoReferencia || dataReferencia.getFullYear();

  const aniversarios = [
    ...obterEventosAniversarios(ano - 1),
    ...obterEventosAniversarios(ano),
    ...obterEventosAniversarios(ano + 1)
  ];

  const todosEventos = [...eventosCarregados, ...aniversarios];

  if (filtrosPessoasAtivas.size === 0) {
    return todosEventos;
  }

  return todosEventos.filter(e => {
    if (e.pessoa === "Todos") return true;
    const partes = parsearParticipantes(e.pessoa);
    return partes.some(nome => filtrosPessoasAtivas.has(nome));
  });
}

// ============================================================
// 7. ELEMENTOS DA TOPBAR E SIDEBAR
// ============================================================
const botaoCriarSidebar = document.querySelector("#botaoCriarSidebar");
const botaoAdicionar = document.querySelector("#botaoAdicionar");
const menuAdicionar = document.querySelector("#menuAdicionar");

const logoDiaHoje = document.querySelector("#logoDiaHoje");
const btnIrParaHoje = document.querySelector("#btnIrParaHoje");
const toggleSidebar = document.querySelector("#toggleSidebar");
const sidebarAgenda = document.querySelector("#sidebarAgenda");
const sidebarBackdrop = document.querySelector("#sidebarBackdrop");

const mesAtualTitulo = document.querySelector("#mesAtual");
const gradeCalendario = document.querySelector("#gradeCalendario");
const diasSemanaCabecalho = document.querySelector(".dias-semana");
const mesAnteriorBtn = document.querySelector("#mesAnterior");
const mesProximoBtn = document.querySelector("#mesProximo");

const tipoVisualizacao = document.querySelector("#tipoVisualizacao");
const menuVisualizacao = document.querySelector("#menuVisualizacao");

const miniMesTitulo = document.querySelector("#miniMesTitulo");
const miniMesAnterior = document.querySelector("#miniMesAnterior");
const miniMesProximo = document.querySelector("#miniMesProximo");
const miniGradeCalendario = document.querySelector("#miniGradeCalendario");

const sidebarListaPessoas = document.querySelector("#sidebarListaPessoas");
const btnFiltroTodos = document.querySelector("#btnFiltroTodos");
const btnAdicionarPessoaSidebar = document.querySelector("#btnAdicionarPessoaSidebar");
const btnAtalhoCardapio = document.querySelector("#btnAtalhoCardapio");
const btnAtalhoCompras = document.querySelector("#btnAtalhoCompras");
const btnCompartilharAgendaSemana = document.querySelector("#btnCompartilharAgendaSemana");

// Action sheet mobile
const actionSheetAdicionarMobile = document.querySelector("#actionSheetAdicionarMobile");
const backdropActionSheetMobile = document.querySelector("#backdropActionSheetMobile");
const fecharActionSheetMobile = document.querySelector("#fecharActionSheetMobile");

function atualizarBadgeHoje() {
  if (logoDiaHoje) {
    logoDiaHoje.textContent = new Date().getDate();
  }
}
atualizarBadgeHoje();

if (btnIrParaHoje) {
  btnIrParaHoje.addEventListener("click", function() {
    dataReferencia = new Date();
    miniDataReferencia = new Date(dataReferencia);
    atualizarVisualizacao();
    renderizarMiniCalendario();
  });
}

// Alternar barra lateral móvel e desktop
function abrirSidebarMobile() {
  if (sidebarAgenda) sidebarAgenda.classList.add("aberta-mobile");
  if (sidebarBackdrop) {
    sidebarBackdrop.classList.remove("escondido");
    requestAnimationFrame(() => sidebarBackdrop.classList.add("visivel"));
  }
}

function fecharSidebarMobile() {
  if (sidebarAgenda) sidebarAgenda.classList.remove("aberta-mobile");
  if (sidebarBackdrop) {
    sidebarBackdrop.classList.remove("visivel");
    setTimeout(() => sidebarBackdrop.classList.add("escondido"), 250);
  }
}

function alternarSidebarMobile() {
  if (sidebarAgenda && sidebarAgenda.classList.contains("aberta-mobile")) {
    fecharSidebarMobile();
  } else {
    abrirSidebarMobile();
  }
}

if (toggleSidebar && sidebarAgenda) {
  toggleSidebar.addEventListener("click", function(e) {
    e.stopPropagation();
    if (window.innerWidth <= 860) {
      alternarSidebarMobile();
    } else {
      sidebarAgenda.classList.toggle("recolhida");
    }
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", fecharSidebarMobile);
}

document.addEventListener("click", function(e) {
  if (
    sidebarAgenda &&
    sidebarAgenda.classList.contains("aberta-mobile") &&
    !sidebarAgenda.contains(e.target) &&
    e.target !== toggleSidebar
  ) {
    fecharSidebarMobile();
  }
});

// Action sheet mobile
function abrirActionSheetMobile() {
  if (actionSheetAdicionarMobile) {
    actionSheetAdicionarMobile.classList.remove("escondido");
  }
}

function fecharActionSheetMobileFn() {
  if (actionSheetAdicionarMobile) {
    actionSheetAdicionarMobile.classList.add("escondido");
  }
}

if (backdropActionSheetMobile) backdropActionSheetMobile.addEventListener("click", fecharActionSheetMobileFn);
if (fecharActionSheetMobile) fecharActionSheetMobile.addEventListener("click", fecharActionSheetMobileFn);

if (actionSheetAdicionarMobile) {
  actionSheetAdicionarMobile.querySelectorAll("button[data-acao]").forEach(function(botao) {
    botao.addEventListener("click", function(evento) {
      evento.stopPropagation();
      const acao = botao.getAttribute("data-acao");
      fecharActionSheetMobileFn();

      if (acao === "evento") {
        irParaTela("agenda");
        abrirModalNovoEvento();
      } else if (acao === "compra") {
        irParaTela("compras");
      } else if (acao === "cardapio") {
        irParaTela("cardapio");
      } else if (acao === "pessoa") {
        irParaTela("agenda");
        abrirModalNovaPessoa();
      }
    });
  });
}

// Menu Adicionar na sidebar (Desktop)
function fecharMenuAdicionar() {
  if (menuAdicionar) menuAdicionar.classList.add("escondido");
  if (botaoCriarSidebar) {
    botaoCriarSidebar.classList.remove("ativo");
    botaoCriarSidebar.setAttribute("aria-expanded", "false");
  }
}

function alternarMenuAdicionar(e) {
  if (e) e.stopPropagation();
  if (!menuAdicionar) return;

  const estaAberto = !menuAdicionar.classList.contains("escondido");
  if (estaAberto) {
    fecharMenuAdicionar();
  } else {
    menuAdicionar.classList.remove("escondido");
    if (botaoCriarSidebar) {
      botaoCriarSidebar.classList.add("ativo");
      botaoCriarSidebar.setAttribute("aria-expanded", "true");
    }
  }
}

if (botaoCriarSidebar) botaoCriarSidebar.addEventListener("click", alternarMenuAdicionar);

if (botaoAdicionar) {
  botaoAdicionar.addEventListener("click", function(e) {
    e.stopPropagation();
    if (window.innerWidth <= 860) {
      abrirActionSheetMobile();
    } else {
      alternarMenuAdicionar(e);
    }
  });
}

if (menuAdicionar) {
  menuAdicionar.querySelectorAll("button[data-acao]").forEach(function(botao) {
    botao.addEventListener("click", function(evento) {
      evento.stopPropagation();
      const acao = botao.getAttribute("data-acao");
      fecharMenuAdicionar();

      if (acao === "evento") {
        irParaTela("agenda");
        abrirModalNovoEvento();
      } else if (acao === "compra") {
        irParaTela("compras");
      } else if (acao === "cardapio") {
        irParaTela("cardapio");
      } else if (acao === "pessoa") {
        irParaTela("agenda");
        abrirModalNovaPessoa();
      }
    });
  });
}

document.addEventListener("click", function(evento) {
  if (
    menuAdicionar &&
    !menuAdicionar.contains(evento.target) &&
    evento.target !== botaoAdicionar &&
    evento.target !== botaoCriarSidebar &&
    (!botaoCriarSidebar || !botaoCriarSidebar.contains(evento.target))
  ) {
    fecharMenuAdicionar();
  }
});

if (btnAtalhoCardapio) btnAtalhoCardapio.addEventListener("click", () => irParaTela("cardapio"));
if (btnAtalhoCompras) btnAtalhoCompras.addEventListener("click", () => irParaTela("compras"));
if (btnAdicionarPessoaSidebar) btnAdicionarPessoaSidebar.addEventListener("click", () => abrirModalNovaPessoa());

// ============================================================
// 8. RENDERIZAÇÃO DA SIDEBAR DE PESSOAS (FILTRO MÚLTIPLO)
// ============================================================
function renderizarSidebarPessoas() {
  if (!sidebarListaPessoas) return;
  sidebarListaPessoas.innerHTML = "";

  if (btnFiltroTodos) {
    if (filtrosPessoasAtivas.size === 0) {
      btnFiltroTodos.classList.add("ativo");
      btnFiltroTodos.textContent = "✓ Ver Todos";
    } else {
      btnFiltroTodos.classList.remove("ativo");
      btnFiltroTodos.textContent = "Ver Todos";
    }
  }

  pessoasFamilia.forEach(function(p) {
    const item = document.createElement("div");
    item.className = "sidebar-pessoa-item";

    const estaFiltrada = filtrosPessoasAtivas.size === 0 || filtrosPessoasAtivas.has(p.nome);
    if (estaFiltrada) item.classList.add("filtrado");

    const avatarHtml = p.foto
      ? `<div class="sidebar-pessoa-avatar"><img src="${p.foto}" alt="${p.nome}"></div>`
      : `<div class="sidebar-pessoa-avatar" style="background-color: ${p.cor}">${p.nome.charAt(0).toUpperCase()}</div>`;

    item.innerHTML = `
      ${avatarHtml}
      <span class="sidebar-pessoa-nome">${p.nome}</span>
      <button type="button" class="btn-ver-perfil-mini" title="Ver perfil e dados de ${p.nome}">👤</button>
      <span class="sidebar-pessoa-check ${estaFiltrada ? 'marcado' : ''}" style="${estaFiltrada ? `background:${p.cor}; border-color:${p.cor};` : ''}">
        ${estaFiltrada ? "✓" : ""}
      </span>
    `;

    const btnPerfil = item.querySelector(".btn-ver-perfil-mini");
    btnPerfil.addEventListener("click", function(e) {
      e.stopPropagation();
      abrirModalPerfilPessoa(p.id);
    });

    const avatarEl = item.querySelector(".sidebar-pessoa-avatar");
    avatarEl.addEventListener("click", function(e) {
      e.stopPropagation();
      abrirModalPerfilPessoa(p.id);
    });

    item.addEventListener("click", function() {
      if (filtrosPessoasAtivas.size === 0) {
        filtrosPessoasAtivas.add(p.nome);
      } else if (filtrosPessoasAtivas.has(p.nome)) {
        filtrosPessoasAtivas.delete(p.nome);
      } else {
        filtrosPessoasAtivas.add(p.nome);
      }

      renderizarSidebarPessoas();
      atualizarVisualizacao();
    });

    sidebarListaPessoas.appendChild(item);
  });
}

if (btnFiltroTodos) {
  btnFiltroTodos.addEventListener("click", function() {
    filtrosPessoasAtivas.clear();
    renderizarSidebarPessoas();
    atualizarVisualizacao();
  });
}

// ============================================================
// 9. MINI CALENDÁRIO DA SIDEBAR
// ============================================================
function renderizarMiniCalendario() {
  if (!miniGradeCalendario || !miniMesTitulo) return;
  miniGradeCalendario.innerHTML = "";

  const ano = miniDataReferencia.getFullYear();
  const mes = miniDataReferencia.getMonth();

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  miniMesTitulo.textContent = `${nomesMeses[mes]} de ${ano}`;

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diaSemanaInicio = primeiroDia.getDay();

  const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
  for (let i = diaSemanaInicio - 1; i >= 0; i--) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-cal-dia outro-mes";
    btn.textContent = ultimoDiaMesAnterior - i;
    btn.addEventListener("click", function() {
      miniDataReferencia.setMonth(miniDataReferencia.getMonth() - 1);
      dataReferencia = new Date(ano, mes - 1, ultimoDiaMesAnterior - i);
      renderizarMiniCalendario();
      atualizarVisualizacao();
    });
    miniGradeCalendario.appendChild(btn);
  }

  const hoje = new Date();
  const hojeAno = hoje.getFullYear();
  const hojeMes = hoje.getMonth();
  const hojeDia = hoje.getDate();

  const refAno = dataReferencia ? dataReferencia.getFullYear() : hojeAno;
  const refMes = dataReferencia ? dataReferencia.getMonth() : hojeMes;
  const refDia = dataReferencia ? dataReferencia.getDate() : hojeDia;

  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-cal-dia";
    btn.textContent = d;

    const ehHoje = (ano === hojeAno && mes === hojeMes && d === hojeDia);
    const ehSelecionado = (ano === refAno && mes === refMes && d === refDia);

    if (ehHoje) btn.classList.add("hoje");
    if (ehSelecionado) btn.classList.add("selecionado");

    btn.addEventListener("click", function() {
      dataReferencia = new Date(ano, mes, d);
      renderizarMiniCalendario();
      atualizarVisualizacao();
    });

    miniGradeCalendario.appendChild(btn);
  }

  const totalSlots = diaSemanaInicio + ultimoDia.getDate();
  const slotsRestantes = (7 - (totalSlots % 7)) % 7;
  for (let p = 1; p <= slotsRestantes; p++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini-cal-dia outro-mes";
    btn.textContent = p;
    btn.addEventListener("click", function() {
      miniDataReferencia.setMonth(miniDataReferencia.getMonth() + 1);
      dataReferencia = new Date(ano, mes + 1, p);
      renderizarMiniCalendario();
      atualizarVisualizacao();
    });
    miniGradeCalendario.appendChild(btn);
  }
}

if (miniMesAnterior) {
  miniMesAnterior.addEventListener("click", function(e) {
    e.stopPropagation();
    miniDataReferencia.setMonth(miniDataReferencia.getMonth() - 1);
    renderizarMiniCalendario();
  });
}

if (miniMesProximo) {
  miniMesProximo.addEventListener("click", function(e) {
    e.stopPropagation();
    miniDataReferencia.setMonth(miniDataReferencia.getMonth() + 1);
    renderizarMiniCalendario();
  });
}

// ============================================================
// 10. MODAL DE NOVO EVENTO
// ============================================================
const modalNovoEvento = document.querySelector("#modalNovoEvento");
const fecharModalNovoEvento = document.querySelector("#fecharModalNovoEvento");
const cancelarModalNovoEvento = document.querySelector("#cancelarModalNovoEvento");
const salvarEvento = document.querySelector("#salvarEvento");

const nomeEvento = document.querySelector("#nomeEvento");
const dataEvento = document.querySelector("#dataEvento");
const horaEvento = document.querySelector("#horaEvento");
const localEvento = document.querySelector("#localEvento");
const pessoaEvento = document.querySelector("#pessoaEvento");
const transporteEvento = document.querySelector("#transporteEvento");
const alarmeEvento = document.querySelector("#alarmeEvento");
const observacaoEvento = document.querySelector("#observacaoEvento");

const seletorPessoasEvento = document.querySelector("#seletorPessoasEvento");
const btnSelecionarTodosEvento = document.querySelector("#btnSelecionarTodosEvento");
const btnLimparPessoasEvento = document.querySelector("#btnLimparPessoasEvento");

const eventoRecorrente = document.querySelector("#eventoRecorrente");
const containerRecorrencia = document.querySelector("#containerRecorrencia");
const recorrenciaTipo = document.querySelector("#recorrenciaTipo");
const recorrenciaIntervalo = document.querySelector("#recorrenciaIntervalo");
const recorrenciaSufixo = document.querySelector("#recorrenciaSufixo");
const recorrenciaFim = document.querySelector("#recorrenciaFim");

let pessoasSelecionadasNoForm = [];

function atualizarSufixoRecorrencia(tipo, elementoSufixo) {
  if (!elementoSufixo) return;
  if (tipo === "diario") elementoSufixo.textContent = "dias (ex: 15 = quinzenal, 2 = de 2 em 2 dias)";
  else if (tipo === "semanal") elementoSufixo.textContent = "semanas (mesmo dia da semana)";
  else if (tipo === "mensal") elementoSufixo.textContent = "meses (mesmo dia do mês)";
  else if (tipo === "anual") elementoSufixo.textContent = "anos (mesma data do ano)";
}

if (eventoRecorrente && containerRecorrencia) {
  eventoRecorrente.addEventListener("change", function() {
    containerRecorrencia.classList.toggle("escondido", !eventoRecorrente.checked);
  });
}

if (recorrenciaTipo && recorrenciaSufixo) {
  recorrenciaTipo.addEventListener("change", function() {
    atualizarSufixoRecorrencia(recorrenciaTipo.value, recorrenciaSufixo);
  });
}

function renderizarSeletorPessoasEvento() {
  if (!seletorPessoasEvento) return;
  seletorPessoasEvento.innerHTML = "";

  pessoasFamilia.forEach(function(pessoa) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.classList.add("chip-pessoa");
    chip.style.setProperty("--cor-pessoa", pessoa.cor);
    chip.dataset.nome = pessoa.nome;

    const estaSelecionado = pessoasSelecionadasNoForm.includes(pessoa.nome);
    if (estaSelecionado) chip.classList.add("selecionado");

    const avatarHtml = pessoa.foto
      ? `<div class="avatar-chip"><img src="${pessoa.foto}" alt="${pessoa.nome}" /></div>`
      : `<div class="avatar-chip" style="background-color: ${pessoa.cor}">${pessoa.nome.charAt(0).toUpperCase()}</div>`;

    chip.innerHTML = `
      ${avatarHtml}
      <span>${pessoa.nome}</span>
    `;

    chip.addEventListener("click", function() {
      if (pessoasSelecionadasNoForm.includes(pessoa.nome)) {
        pessoasSelecionadasNoForm = pessoasSelecionadasNoForm.filter(n => n !== pessoa.nome);
      } else {
        pessoasSelecionadasNoForm.push(pessoa.nome);
      }
      atualizarEstadoChips();
    });

    seletorPessoasEvento.appendChild(chip);
  });

  atualizarInputPessoaEvento();
}

function atualizarEstadoChips() {
  if (!seletorPessoasEvento) return;
  seletorPessoasEvento.querySelectorAll(".chip-pessoa").forEach(function(chip) {
    const nome = chip.dataset.nome;
    if (pessoasSelecionadasNoForm.includes(nome)) {
      chip.classList.add("selecionado");
    } else {
      chip.classList.remove("selecionado");
    }
  });
  atualizarInputPessoaEvento();
}

function atualizarInputPessoaEvento() {
  if (!pessoaEvento) return;
  if (pessoasSelecionadasNoForm.length === pessoasFamilia.length && pessoasFamilia.length > 0) {
    pessoaEvento.value = "Todos";
  } else {
    pessoaEvento.value = pessoasSelecionadasNoForm.join(", ");
  }
}

if (btnSelecionarTodosEvento) {
  btnSelecionarTodosEvento.addEventListener("click", function() {
    pessoasSelecionadasNoForm = pessoasFamilia.map(p => p.nome);
    atualizarEstadoChips();
  });
}

if (btnLimparPessoasEvento) {
  btnLimparPessoasEvento.addEventListener("click", function() {
    pessoasSelecionadasNoForm = [];
    atualizarEstadoChips();
  });
}

function abrirModalNovoEvento(dataPredefinida = null) {
  if (!modalNovoEvento) return;

  const dataAlvo = dataPredefinida || (dataReferencia ? formatarDataISO(dataReferencia) : formatarDataISO(new Date()));
  if (dataEvento) dataEvento.value = dataAlvo;

  if (horaEvento) {
    const agora = new Date();
    const proxHora = String(agora.getHours() + 1).padStart(2, "0");
    horaEvento.value = `${proxHora}:00`;
  }
  if (nomeEvento) nomeEvento.value = "";
  if (localEvento) localEvento.value = "";
  if (transporteEvento) transporteEvento.value = "carro";
  if (alarmeEvento) alarmeEvento.value = "20";
  if (observacaoEvento) observacaoEvento.value = "";

  if (eventoRecorrente) eventoRecorrente.checked = false;
  if (containerRecorrencia) containerRecorrencia.classList.add("escondido");
  if (recorrenciaTipo) recorrenciaTipo.value = "diario";
  if (recorrenciaIntervalo) recorrenciaIntervalo.value = "1";
  if (recorrenciaFim) recorrenciaFim.value = "";
  if (recorrenciaSufixo) atualizarSufixoRecorrencia("diario", recorrenciaSufixo);

  const usuarioObj = obterPessoaPorId(usuarioAtivoId);
  if (usuarioObj) {
    pessoasSelecionadasNoForm = [usuarioObj.nome];
  } else if (pessoasFamilia.length > 0) {
    pessoasSelecionadasNoForm = [pessoasFamilia[0].nome];
  } else {
    pessoasSelecionadasNoForm = [];
  }
  renderizarSeletorPessoasEvento();

  modalNovoEvento.classList.remove("escondido");
  setTimeout(() => {
    if (nomeEvento) nomeEvento.focus();
  }, 140);
}

function fecharModalNovoEventoFn() {
  if (modalNovoEvento) modalNovoEvento.classList.add("escondido");
}

if (fecharModalNovoEvento) fecharModalNovoEvento.addEventListener("click", fecharModalNovoEventoFn);
if (cancelarModalNovoEvento) cancelarModalNovoEvento.addEventListener("click", fecharModalNovoEventoFn);

if (modalNovoEvento) {
  modalNovoEvento.addEventListener("click", function(e) {
    if (e.target === modalNovoEvento) {
      fecharModalNovoEventoFn();
    }
  });
}

// Salvar evento
if (salvarEvento) {
  salvarEvento.addEventListener("click", async function() {
    const nome = nomeEvento.value.trim();
    const data = dataEvento.value;
    const hora = horaEvento.value;
    const local = localEvento.value.trim();
    const pessoa = (pessoaEvento && pessoaEvento.value.trim()) ||
      (pessoasSelecionadasNoForm.length > 0 ? pessoasSelecionadasNoForm.join(", ") : "");
    const transporte = transporteEvento.value;
    const alarmeMin = alarmeEvento ? alarmeEvento.value : "20";
    let textoObs = observacaoEvento.value.trim();

    if (!nome || !data || !hora) {
      alert("Preencha todos os campos obrigatórios (nome, data e horário).");
      return;
    }

    if (!pessoa) {
      alert("Selecione pelo menos uma pessoa da família em 'Quem vai?'.");
      return;
    }

    let configRecorrencia = null;
    if (eventoRecorrente && eventoRecorrente.checked) {
      configRecorrencia = {
        ativo: true,
        tipo: recorrenciaTipo.value || "diario",
        intervalo: parseInt(recorrenciaIntervalo.value, 10) || 1,
        fim: recorrenciaFim.value || null
      };
    }

    const obsCodificada = codificarMetadadosObservacao(textoObs, configRecorrencia, alarmeMin);

    await executarSalvarEvento(nome, pessoa, data, hora, local, transporte, obsCodificada, configRecorrencia);
  });
}

async function executarSalvarEvento(nome, pessoa, data, hora, local, transporte, observacao, configRecorrencia) {
  const { data: dadosInseridos, error } = await supabase
    .from("eventos")
    .insert({
      nome: nome,
      pessoa: pessoa,
      data: data,
      hora: hora.length === 5 ? hora + ":00" : hora,
      local: local,
      transporte: transporte,
      observacao: observacao
    })
    .select();

  if (error) {
    console.error("Erro Supabase:", error);
    alert("Não foi possível salvar o evento no banco de dados.");
    return;
  }

  if (configRecorrencia && dadosInseridos && dadosInseridos.length > 0) {
    const id = dadosInseridos[0].id;
    recorrenciasEventos[String(id)] = configRecorrencia;
    salvarRecorrenciasLocal();
  }

  await carregarEventos();
  fecharModalNovoEventoFn();
  exibirToast("Evento adicionado com sucesso! 🎉");
  exibirBannerAtualizacaoSemana("atualizada com novo compromisso");
}

// ============================================================
// 11. MODAL DE EDIÇÃO DE EVENTO
// ============================================================
const modalEditarEvento = document.querySelector("#modalEditarEvento");
const btnFecharModalEditarEvento = document.querySelector("#fecharModalEditarEvento");
const cancelarModalEditarEvento = document.querySelector("#cancelarModalEditarEvento");
const formEditarEvento = document.querySelector("#formEditarEvento");
const editEventoId = document.querySelector("#editEventoId");
const editNomeEvento = document.querySelector("#editNomeEvento");
const editSeletorPessoasEvento = document.querySelector("#editSeletorPessoasEvento");
const editBtnSelecionarTodos = document.querySelector("#editBtnSelecionarTodos");
const editBtnLimparPessoas = document.querySelector("#editBtnLimparPessoas");
const editPessoaEvento = document.querySelector("#editPessoaEvento");
const editDataEvento = document.querySelector("#editDataEvento");
const editHoraEvento = document.querySelector("#editHoraEvento");
const editLocalEvento = document.querySelector("#editLocalEvento");
const editTransporteEvento = document.querySelector("#editTransporteEvento");
const editAlarmeEvento = document.querySelector("#editAlarmeEvento");
const editObservacaoEvento = document.querySelector("#editObservacaoEvento");
const btnExcluirDoModalEdicao = document.querySelector("#btnExcluirDoModalEdicao");

const editEventoRecorrente = document.querySelector("#editEventoRecorrente");
const editContainerRecorrencia = document.querySelector("#editContainerRecorrencia");
const editRecorrenciaTipo = document.querySelector("#editRecorrenciaTipo");
const editRecorrenciaIntervalo = document.querySelector("#editRecorrenciaIntervalo");
const editRecorrenciaSufixo = document.querySelector("#editRecorrenciaSufixo");
const editRecorrenciaFim = document.querySelector("#editRecorrenciaFim");

let editPessoasSelecionadas = [];

if (editEventoRecorrente && editContainerRecorrencia) {
  editEventoRecorrente.addEventListener("change", function() {
    editContainerRecorrencia.classList.toggle("escondido", !editEventoRecorrente.checked);
  });
}

if (editRecorrenciaTipo && editRecorrenciaSufixo) {
  editRecorrenciaTipo.addEventListener("change", function() {
    atualizarSufixoRecorrencia(editRecorrenciaTipo.value, editRecorrenciaSufixo);
  });
}

function renderizarSeletorPessoasEdicao() {
  if (!editSeletorPessoasEvento) return;
  editSeletorPessoasEvento.innerHTML = "";

  pessoasFamilia.forEach(function(pessoa) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.classList.add("chip-pessoa");
    chip.style.setProperty("--cor-pessoa", pessoa.cor);
    chip.dataset.nome = pessoa.nome;

    const estaSelecionado = editPessoasSelecionadas.includes(pessoa.nome);
    if (estaSelecionado) chip.classList.add("selecionado");

    const avatarHtml = pessoa.foto
      ? `<div class="avatar-chip"><img src="${pessoa.foto}" alt="${pessoa.nome}" /></div>`
      : `<div class="avatar-chip" style="background-color: ${pessoa.cor}">${pessoa.nome.charAt(0).toUpperCase()}</div>`;

    chip.innerHTML = `
      ${avatarHtml}
      <span>${pessoa.nome}</span>
    `;

    chip.addEventListener("click", function() {
      if (editPessoasSelecionadas.includes(pessoa.nome)) {
        editPessoasSelecionadas = editPessoasSelecionadas.filter(n => n !== pessoa.nome);
      } else {
        editPessoasSelecionadas.push(pessoa.nome);
      }
      atualizarEstadoChipsEdicao();
    });

    editSeletorPessoasEvento.appendChild(chip);
  });

  atualizarInputPessoaEdicao();
}

function atualizarEstadoChipsEdicao() {
  if (!editSeletorPessoasEvento) return;
  editSeletorPessoasEvento.querySelectorAll(".chip-pessoa").forEach(function(chip) {
    const nome = chip.dataset.nome;
    if (editPessoasSelecionadas.includes(nome)) {
      chip.classList.add("selecionado");
    } else {
      chip.classList.remove("selecionado");
    }
  });
  atualizarInputPessoaEdicao();
}

function atualizarInputPessoaEdicao() {
  if (!editPessoaEvento) return;
  if (editPessoasSelecionadas.length === pessoasFamilia.length && pessoasFamilia.length > 0) {
    editPessoaEvento.value = "Todos";
  } else {
    editPessoaEvento.value = editPessoasSelecionadas.join(", ");
  }
}

if (editBtnSelecionarTodos) {
  editBtnSelecionarTodos.addEventListener("click", function() {
    editPessoasSelecionadas = pessoasFamilia.map(p => p.nome);
    atualizarEstadoChipsEdicao();
  });
}

if (editBtnLimparPessoas) {
  editBtnLimparPessoas.addEventListener("click", function() {
    editPessoasSelecionadas = [];
    atualizarEstadoChipsEdicao();
  });
}

function abrirModalEditarEvento(id) {
  if (String(id).startsWith("aniv-")) {
    const eventoAniv = obterEventosFiltrados().find(e => String(e.id) === String(id));
    if (eventoAniv && eventoAniv.pessoaId) {
      abrirModalPerfilPessoa(eventoAniv.pessoaId);
      return;
    }
  }

  const evento = eventosCarregados.find(e => String(e.id) === String(id));
  if (!evento || !modalEditarEvento) return;

  editEventoId.value = evento.id;
  editNomeEvento.value = evento.nome || "";
  editDataEvento.value = evento.data || "";
  editHoraEvento.value = (evento.hora || "").slice(0, 5);
  editLocalEvento.value = evento.local || "";
  editTransporteEvento.value = evento.transporte || "carro";

  const { textoLimpo, configRec, alarmeMin } = decodificarMetadadosObservacao(evento.observacao);
  editObservacaoEvento.value = textoLimpo || "";
  if (editAlarmeEvento) editAlarmeEvento.value = alarmeMin || "20";

  const rec = configRec || recorrenciasEventos[String(evento.id)] || null;
  if (rec && rec.ativo) {
    if (editEventoRecorrente) editEventoRecorrente.checked = true;
    if (editContainerRecorrencia) editContainerRecorrencia.classList.remove("escondido");
    if (editRecorrenciaTipo) editRecorrenciaTipo.value = rec.tipo || "diario";
    if (editRecorrenciaIntervalo) editRecorrenciaIntervalo.value = rec.intervalo || "1";
    if (editRecorrenciaFim) editRecorrenciaFim.value = rec.fim || "";
    if (editRecorrenciaSufixo) atualizarSufixoRecorrencia(rec.tipo || "diario", editRecorrenciaSufixo);
  } else {
    if (editEventoRecorrente) editEventoRecorrente.checked = false;
    if (editContainerRecorrencia) editContainerRecorrencia.classList.add("escondido");
    if (editRecorrenciaTipo) editRecorrenciaTipo.value = "diario";
    if (editRecorrenciaIntervalo) editRecorrenciaIntervalo.value = "1";
    if (editRecorrenciaFim) editRecorrenciaFim.value = "";
    if (editRecorrenciaSufixo) atualizarSufixoRecorrencia("diario", editRecorrenciaSufixo);
  }

  editPessoasSelecionadas = parsearParticipantes(evento.pessoa);
  renderizarSeletorPessoasEdicao();

  modalEditarEvento.classList.remove("escondido");
  setTimeout(() => {
    if (editNomeEvento) editNomeEvento.focus();
  }, 150);
}

function fecharModalEditarEvento() {
  if (modalEditarEvento) modalEditarEvento.classList.add("escondido");
}

if (btnFecharModalEditarEvento) btnFecharModalEditarEvento.addEventListener("click", fecharModalEditarEvento);
if (cancelarModalEditarEvento) cancelarModalEditarEvento.addEventListener("click", fecharModalEditarEvento);

if (formEditarEvento) {
  formEditarEvento.addEventListener("submit", async function(e) {
    e.preventDefault();
    const id = editEventoId.value;
    const nome = editNomeEvento.value.trim();
    const data = editDataEvento.value;
    const hora = editHoraEvento.value;
    const local = editLocalEvento.value.trim();
    const transporte = editTransporteEvento.value;
    const alarmeMin = editAlarmeEvento ? editAlarmeEvento.value : "20";
    const textoObs = editObservacaoEvento.value.trim();
    const pessoa = editPessoaEvento.value.trim() || (pessoasFamilia[0]?.nome || "Família");

    if (!nome || !data || !hora) {
      alert("Por favor, preencha o nome, a data e o horário do evento.");
      return;
    }

    let configRec = null;
    if (editEventoRecorrente && editEventoRecorrente.checked) {
      configRec = {
        ativo: true,
        tipo: editRecorrenciaTipo.value || "diario",
        intervalo: parseInt(editRecorrenciaIntervalo.value, 10) || 1,
        fim: editRecorrenciaFim.value || null
      };
      recorrenciasEventos[String(id)] = configRec;
    } else {
      delete recorrenciasEventos[String(id)];
    }
    salvarRecorrenciasLocal();

    const obsCodificada = codificarMetadadosObservacao(textoObs, configRec, alarmeMin);

    const novosDados = {
      nome,
      pessoa,
      data,
      hora: hora.length === 5 ? hora + ":00" : hora,
      local,
      transporte,
      observacao: obsCodificada
    };

    await executarAtualizacaoEvento(id, novosDados);
  });
}

async function executarAtualizacaoEvento(id, novosDados) {
  salvarEventoEditadoLocal(id, novosDados);

  const idx = eventosCarregados.findIndex(e => String(e.id) === String(id));
  if (idx !== -1) {
    eventosCarregados[idx] = {
      ...eventosCarregados[idx],
      ...novosDados
    };
  }

  try {
    const { error } = await supabase
      .from("eventos")
      .update({
        nome: novosDados.nome,
        pessoa: novosDados.pessoa,
        data: novosDados.data,
        hora: novosDados.hora,
        local: novosDados.local || "",
        transporte: novosDados.transporte || "carro",
        observacao: novosDados.observacao || ""
      })
      .eq("id", id);
    if (error) console.warn("Aviso ao atualizar no Supabase:", error);
  } catch (err) {
    console.warn("Falha ao sincronizar com Supabase:", err);
  }

  atualizarVisualizacao();
  fecharModalEditarEvento();
  exibirToast("Evento atualizado com sucesso! ✨");
  exibirBannerAtualizacaoSemana("atualizada");
}

if (btnExcluirDoModalEdicao) {
  btnExcluirDoModalEdicao.addEventListener("click", function() {
    const id = editEventoId.value;
    fecharModalEditarEvento();
    abrirModalConfirmarExclusao(id);
  });
}

// ============================================================
// 12. EXCLUSÃO DE EVENTO
// ============================================================
const modalConfirmarExclusao = document.querySelector("#modalConfirmarExclusao");
const fecharModalExclusao = document.querySelector("#fecharModalExclusao");
const cancelarExclusaoEvento = document.querySelector("#cancelarExclusaoEvento");
const confirmarExclusaoEvento = document.querySelector("#confirmarExclusaoEvento");
const mensagemConfirmarExclusao = document.querySelector("#mensagemConfirmarExclusao");
const cardEventoParaExcluir = document.querySelector("#cardEventoParaExcluir");

let idEventoParaExcluir = null;

function abrirModalConfirmarExclusao(id) {
  const evento = eventosCarregados.find(e => String(e.id) === String(id));
  if (!evento || !modalConfirmarExclusao) return;

  idEventoParaExcluir = id;
  if (mensagemConfirmarExclusao) {
    mensagemConfirmarExclusao.textContent = `Tem certeza que deseja excluir o compromisso "${evento.nome}"?`;
  }

  if (cardEventoParaExcluir) {
    const dataBr = formatarDataBR(evento.data);
    cardEventoParaExcluir.innerHTML = `
      <h4>${evento.nome}</h4>
      <p>📅 <strong>Data:</strong> ${dataBr} às ${(evento.hora || "").slice(0, 5)}</p>
      <p>👤 <strong>Quem vai:</strong> ${evento.pessoa || "Família"}</p>
      ${evento.local ? `<p>📍 <strong>Local:</strong> ${evento.local}</p>` : ""}
    `;
  }

  modalConfirmarExclusao.classList.remove("escondido");
}

function fecharModalConfirmarExclusao() {
  if (modalConfirmarExclusao) modalConfirmarExclusao.classList.add("escondido");
  idEventoParaExcluir = null;
}

if (fecharModalExclusao) fecharModalExclusao.addEventListener("click", fecharModalConfirmarExclusao);
if (cancelarExclusaoEvento) cancelarExclusaoEvento.addEventListener("click", fecharModalConfirmarExclusao);

if (confirmarExclusaoEvento) {
  confirmarExclusaoEvento.addEventListener("click", async function() {
    if (idEventoParaExcluir) {
      await excluirEvento(idEventoParaExcluir);
    }
  });
}

async function excluirEvento(id) {
  salvarEventoExcluidoLocal(id);
  eventosCarregados = eventosCarregados.filter(e => String(e.id) !== String(id));
  delete recorrenciasEventos[String(id)];
  salvarRecorrenciasLocal();

  try {
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) console.warn("Aviso ao excluir no Supabase:", error);
  } catch (err) {
    console.warn("Falha ao sincronizar exclusão com Supabase:", err);
  }

  atualizarVisualizacao();
  fecharModalConfirmarExclusao();
  fecharModalEditarEvento();
  fecharPopoverEventoFn();
  exibirToast("Evento excluído com sucesso! 🗑️");
  exibirBannerAtualizacaoSemana("atualizada (compromisso removido)");
}

// Sincronização Local
function aplicarModificacoesLocais(eventos) {
  try {
    const excluidos = JSON.parse(localStorage.getItem("agenda_eventos_excluidos") || "[]");
    const editados = JSON.parse(localStorage.getItem("agenda_eventos_editados") || "{}");

    let resultado = (eventos || []).filter(ev => !excluidos.includes(String(ev.id)));
    resultado = resultado.map(ev => {
      const edit = editados[String(ev.id)];
      return edit ? { ...ev, ...edit } : ev;
    });
    return resultado;
  } catch (e) {
    console.error("Erro ao aplicar modificações locais:", e);
    return eventos || [];
  }
}

function salvarEventoExcluidoLocal(id) {
  try {
    const idStr = String(id);
    const excluidos = JSON.parse(localStorage.getItem("agenda_eventos_excluidos") || "[]");
    if (!excluidos.includes(idStr)) {
      excluidos.push(idStr);
      localStorage.setItem("agenda_eventos_excluidos", JSON.stringify(excluidos));
    }
    const editados = JSON.parse(localStorage.getItem("agenda_eventos_editados") || "{}");
    if (editados[idStr]) {
      delete editados[idStr];
      localStorage.setItem("agenda_eventos_editados", JSON.stringify(editados));
    }
  } catch (e) {
    console.error("Erro ao salvar exclusão local:", e);
  }
}

function salvarEventoEditadoLocal(id, dados) {
  try {
    const idStr = String(id);
    const editados = JSON.parse(localStorage.getItem("agenda_eventos_editados") || "{}");
    editados[idStr] = { ...(editados[idStr] || {}), ...dados };
    localStorage.setItem("agenda_eventos_editados", JSON.stringify(editados));
  } catch (e) {
    console.error("Erro ao salvar edição local:", e);
  }
}

async function carregarEventos() {
  const { data: eventos, error } = await supabase
    .from("eventos")
    .select("*")
    .order("data", { ascending: true })
    .order("hora", { ascending: true });

  if (error) {
    console.error("Erro ao carregar eventos do Supabase:", error);
  }

  eventosCarregados = aplicarModificacoesLocais(eventos || []);
  atualizarVisualizacao();
  renderizarMiniCalendario();
  renderizarSidebarPessoas();
  verificarParametroEventoURL();
}

// ============================================================
// 13. POPOVER FLUTUANTE DE DETALHES DO EVENTO (GOOGLE CALENDAR)
// ============================================================
const popoverDetalheEvento = document.querySelector("#popoverDetalheEvento");
const popoverBtnFechar = document.querySelector("#popoverBtnFechar");
const popoverBtnEditar = document.querySelector("#popoverBtnEditar");
const popoverBtnExcluir = document.querySelector("#popoverBtnExcluir");
const popoverBtnCompartilhar = document.querySelector("#popoverBtnCompartilhar");
const popoverBtnWhatsRapido = document.querySelector("#popoverBtnWhatsRapido");
const popoverBtnCopiarLink = document.querySelector("#popoverBtnCopiarLink");

const popoverCorIndicador = document.querySelector("#popoverCorIndicador");
const popoverNomeEvento = document.querySelector("#popoverNomeEvento");
const popoverDataHora = document.querySelector("#popoverDataHora");
const popoverAlarmeTexto = document.querySelector("#popoverAlarmeTexto");
const popoverParticipantesBadges = document.querySelector("#popoverParticipantesBadges");
const popoverLocalTexto = document.querySelector("#popoverLocalTexto");
const popoverLinhaLocal = document.querySelector("#popoverLinhaLocal");
const popoverTransporteTexto = document.querySelector("#popoverTransporteTexto");
const popoverLinhaTransporte = document.querySelector("#popoverLinhaTransporte");
const popoverObsTexto = document.querySelector("#popoverObsTexto");
const popoverLinhaObs = document.querySelector("#popoverLinhaObs");

let idEventoPopoverAberto = null;

function abrirPopoverEvento(id) {
  if (String(id).startsWith("aniv-")) {
    const evAniv = obterEventosFiltrados().find(e => String(e.id) === String(id));
    if (evAniv && evAniv.pessoaId) {
      abrirModalPerfilPessoa(evAniv.pessoaId);
      return;
    }
  }

  const evento = eventosCarregados.find(e => String(e.id) === String(id));
  if (!evento || !popoverDetalheEvento) return;

  idEventoPopoverAberto = id;

  const participantes = parsearParticipantes(evento.pessoa);
  const corPrincipal = participantes.length > 0 ? obterCorPessoa(participantes[0]) : "#596747";
  const { textoLimpo, alarmeMin } = decodificarMetadadosObservacao(evento.observacao);

  if (popoverCorIndicador) popoverCorIndicador.style.backgroundColor = corPrincipal;
  if (popoverNomeEvento) popoverNomeEvento.textContent = evento.nome;

  if (popoverDataHora) {
    const dObj = new Date(evento.data + "T00:00:00");
    const dataExtenso = dObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    const dataCapitalizada = dataExtenso.charAt(0).toUpperCase() + dataExtenso.slice(1);
    popoverDataHora.textContent = `${dataCapitalizada} às ${evento.hora.slice(0, 5)}`;
  }

  if (popoverAlarmeTexto) {
    popoverAlarmeTexto.textContent = formatarTextoAlarme(alarmeMin);
  }

  if (popoverParticipantesBadges) {
    popoverParticipantesBadges.innerHTML = participantes.map(pNome => {
      const pCor = obterCorPessoa(pNome);
      const pObj = obterPessoaPorNome(pNome);
      const foto = pObj ? pObj.foto : "";
      const avatarHtml = foto
        ? `<div class="badge-participante-avatar"><img src="${foto}" alt="${pNome}"></div>`
        : `<div class="badge-participante-avatar" style="background-color: ${pCor}">${pNome.charAt(0).toUpperCase()}</div>`;
      return `
        <span class="badge-participante" style="background-color: ${pCor}18; color: ${pCor}; border: 1px solid ${pCor}40;">
          ${avatarHtml}
          ${pNome}
        </span>
      `;
    }).join("");
  }

  if (popoverLocalTexto && popoverLinhaLocal) {
    if (evento.local) {
      popoverLocalTexto.textContent = evento.local;
      popoverLinhaLocal.style.display = "flex";
    } else {
      popoverLinhaLocal.style.display = "none";
    }
  }

  if (popoverTransporteTexto && popoverLinhaTransporte) {
    if (evento.transporte) {
      const transportesMap = {
        carro: "Precisa de carro 🚗",
        carona: "Vai de carona 🚙",
        casa: "Em casa 🏠",
        "a-pe": "Vai a pé 🚶",
        publico: "Transporte público 🚌",
        indefinido: "Ainda não definido ❓"
      };
      popoverTransporteTexto.textContent = transportesMap[evento.transporte] || evento.transporte;
      popoverLinhaTransporte.style.display = "flex";
    } else {
      popoverLinhaTransporte.style.display = "none";
    }
  }

  if (popoverObsTexto && popoverLinhaObs) {
    if (textoLimpo) {
      popoverObsTexto.textContent = textoLimpo;
      popoverLinhaObs.style.display = "flex";
    } else {
      popoverLinhaObs.style.display = "none";
    }
  }

  popoverDetalheEvento.classList.remove("escondido");
}

function fecharPopoverEventoFn() {
  if (popoverDetalheEvento) popoverDetalheEvento.classList.add("escondido");
  idEventoPopoverAberto = null;
}

if (popoverBtnFechar) popoverBtnFechar.addEventListener("click", fecharPopoverEventoFn);
if (popoverDetalheEvento) {
  popoverDetalheEvento.addEventListener("click", function(e) {
    if (e.target === popoverDetalheEvento) fecharPopoverEventoFn();
  });
}

if (popoverBtnEditar) {
  popoverBtnEditar.addEventListener("click", function() {
    const id = idEventoPopoverAberto;
    fecharPopoverEventoFn();
    if (id) abrirModalEditarEvento(id);
  });
}

if (popoverBtnExcluir) {
  popoverBtnExcluir.addEventListener("click", function() {
    const id = idEventoPopoverAberto;
    fecharPopoverEventoFn();
    if (id) abrirModalConfirmarExclusao(id);
  });
}

if (popoverBtnCompartilhar) {
  popoverBtnCompartilhar.addEventListener("click", function() {
    const evento = eventosCarregados.find(e => String(e.id) === String(idEventoPopoverAberto));
    if (evento) compartilharEventoWhatsApp(evento);
  });
}

if (popoverBtnWhatsRapido) {
  popoverBtnWhatsRapido.addEventListener("click", function() {
    const evento = eventosCarregados.find(e => String(e.id) === String(idEventoPopoverAberto));
    if (evento) compartilharEventoWhatsApp(evento);
  });
}

if (popoverBtnCopiarLink) {
  popoverBtnCopiarLink.addEventListener("click", function() {
    const evento = eventosCarregados.find(e => String(e.id) === String(idEventoPopoverAberto));
    if (evento) copiarLinkEvento(evento);
  });
}

// Compartilhamento individual via WhatsApp
function formatarMensagemEventoWhatsApp(evento) {
  const { textoLimpo, alarmeMin } = decodificarMetadadosObservacao(evento.observacao);
  const dataBr = formatarDataBR(evento.data);
  const textoAlarme = formatarTextoAlarme(alarmeMin);
  const linkApp = `${window.location.origin}${window.location.pathname}#evento=${evento.id}`;

  return `✨ *Compromisso da Família* ✨\n\n` +
    `📌 *Evento:* ${evento.nome}\n` +
    `📅 *Data:* ${dataBr} às ${evento.hora.slice(0, 5)}\n` +
    `👤 *Quem vai:* ${evento.pessoa || 'Família'}\n` +
    (evento.local ? `📍 *Local:* ${evento.local}\n` : '') +
    (evento.transporte ? `🚗 *Transporte:* ${evento.transporte}\n` : '') +
    (textoAlarme !== 'Sem lembrete' ? `🔔 *Lembrete:* ${textoAlarme}\n` : '') +
    (textoLimpo ? `📝 *Obs:* ${textoLimpo}\n` : '') +
    `\n🔗 *Ver na Agenda:* ${linkApp}`;
}

function compartilharEventoWhatsApp(evento) {
  const msg = formatarMensagemEventoWhatsApp(evento);
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function copiarLinkEvento(evento) {
  const linkApp = `${window.location.origin}${window.location.pathname}#evento=${evento.id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(linkApp).then(() => {
      exibirToast("Link do evento copiado para a área de transferência! 🔗");
    }).catch(() => {
      prompt("Copie o link do evento:", linkApp);
    });
  } else {
    prompt("Copie o link do evento:", linkApp);
  }
}

function verificarParametroEventoURL() {
  const hash = window.location.hash;
  const match = hash.match(/evento=([a-zA-Z0-9_-]+)/);
  if (match) {
    const id = match[1];
    setTimeout(() => {
      abrirPopoverEvento(id);
    }, 600);
  }
}

// ============================================================
// 14. COMPARTILHAR AGENDA DA SEMANA NO WHATSAPP & BANNER
// ============================================================
function gerarTextoAgendaSemana() {
  const dRef = new Date(dataReferencia);
  const diaSemanaIndex = dRef.getDay();
  const inicioSemana = new Date(dRef);
  inicioSemana.setDate(dRef.getDate() - diaSemanaIndex);
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  const dIniStr = formatarDataBR(formatarDataISO(inicioSemana));
  const dFimStr = formatarDataBR(formatarDataISO(fimSemana));

  const nomesDias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const eventosVisiveis = obterEventosFiltrados(dataReferencia.getFullYear());

  let texto = `📅 *Agenda da Família - Semana de ${dIniStr} a ${dFimStr}*\n\n`;
  let temEventoNaSemana = false;

  for (let i = 0; i < 7; i++) {
    const diaAtual = new Date(inicioSemana);
    diaAtual.setDate(inicioSemana.getDate() + i);
    const dataISO = formatarDataISO(diaAtual);
    const eventosDoDia = eventosVisiveis.filter(e => eventoOcorreNaData(e, dataISO));

    if (eventosDoDia.length > 0) {
      temEventoNaSemana = true;
      texto += `👉 *${nomesDias[i]} (${diaAtual.getDate()}/${diaAtual.getMonth() + 1}):*\n`;
      eventosDoDia.forEach(ev => {
        const icone = ev.ehAniversario ? "🎂" : "•";
        texto += `   ${icone} ${ev.hora.slice(0, 5)} - ${ev.nome} (${ev.pessoa || 'Família'})\n`;
      });
      texto += `\n`;
    }
  }

  if (!temEventoNaSemana) {
    texto += `Nenhum compromisso agendado para esta semana! 🌟\n\n`;
  }

  if (cardapioSemanal) {
    const hojeNome = diasSemanaNomes[new Date().getDay()];
    texto += `🍽️ *Prato de Hoje (${hojeNome}):* ${cardapioSemanal[hojeNome] || 'A definir'}\n\n`;
  }

  const pendentesCompras = itensCompras.filter(i => !i.concluido).length;
  if (pendentesCompras > 0) {
    texto += `🛒 *Lista de Compras:* ${pendentesCompras} item(ns) pendente(s)\n\n`;
  }

  texto += `🔗 *Acesse a agenda da família:* ${window.location.origin}${window.location.pathname}`;

  return texto;
}

function enviarAgendaSemanaWhatsApp() {
  const texto = gerarTextoAgendaSemana();
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
}

if (btnCompartilharAgendaSemana) {
  btnCompartilharAgendaSemana.addEventListener("click", function() {
    enviarAgendaSemanaWhatsApp();
  });
}

// Banner flutuante de atualização
const bannerAtualizacaoSemana = document.querySelector("#bannerAtualizacaoSemana");
const btnEnviarWhatsBanner = document.querySelector("#btnEnviarWhatsBanner");
const btnFecharWhatsBanner = document.querySelector("#btnFecharWhatsBanner");
let bannerTimeout = null;

function exibirBannerAtualizacaoSemana(motivo = "atualizada") {
  if (!bannerAtualizacaoSemana) return;
  const titulo = document.querySelector("#bannerWhatsTitulo");
  if (titulo) titulo.textContent = `Agenda da semana ${motivo}!`;

  bannerAtualizacaoSemana.classList.remove("escondido");
  if (bannerTimeout) clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => {
    bannerAtualizacaoSemana.classList.add("escondido");
  }, 10000);
}

if (btnEnviarWhatsBanner) {
  btnEnviarWhatsBanner.addEventListener("click", function() {
    if (bannerAtualizacaoSemana) bannerAtualizacaoSemana.classList.add("escondido");
    enviarAgendaSemanaWhatsApp();
  });
}

if (btnFecharWhatsBanner) {
  btnFecharWhatsBanner.addEventListener("click", function() {
    if (bannerAtualizacaoSemana) bannerAtualizacaoSemana.classList.add("escondido");
  });
}

// ============================================================
// 15. SISTEMA DE ALARMES & NOTIFICAÇÕES WEB
// ============================================================
let alarmesDisparados = JSON.parse(localStorage.getItem("agenda_alarmes_disparados") || "[]");

function salvarAlarmesDisparados() {
  localStorage.setItem("agenda_alarmes_disparados", JSON.stringify(alarmesDisparados));
}

function solicitarPermissaoNotificacao() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function verificarAlarmes() {
  const agora = Date.now();

  eventosCarregados.forEach(evento => {
    if (!evento.data || !evento.hora) return;
    const { alarmeMin } = decodificarMetadadosObservacao(evento.observacao);
    if (!alarmeMin || alarmeMin === "none") return;

    const minutosAntes = parseInt(alarmeMin, 10);
    if (isNaN(minutosAntes)) return;

    const horaLimpa = evento.hora.slice(0, 5);
    const dataHoraEvento = new Date(`${evento.data}T${horaLimpa}:00`).getTime();
    if (isNaN(dataHoraEvento)) return;

    const horarioAlarme = dataHoraEvento - (minutosAntes * 60 * 1000);
    const chaveAlarme = `${evento.id}-${evento.data}-${minutosAntes}`;

    const diff = agora - horarioAlarme;
    if (diff >= 0 && diff <= 120000 && !alarmesDisparados.includes(chaveAlarme)) {
      alarmesDisparados.push(chaveAlarme);
      salvarAlarmesDisparados();
      dispararAlarme(evento, minutosAntes);
    }
  });
}

function dispararAlarme(evento, minutosAntes) {
  const textoTempo = formatarTextoAlarme(minutosAntes);
  const dataBr = formatarDataBR(evento.data);

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`🔔 Lembrete: ${evento.nome}`, {
        body: `${evento.nome} em ${dataBr} às ${evento.hora.slice(0, 5)} (${textoTempo}). Quem vai: ${evento.pessoa || 'Família'}`,
        icon: "/favicon.ico"
      });
    } catch (e) {
      console.warn("Erro ao disparar Notification:", e);
    }
  }

  const modalAlarme = document.querySelector("#modalAlarmeDisparado");
  const nomeEl = document.querySelector("#alarmeNomeEventoModal");
  const dataHoraEl = document.querySelector("#alarmeDataHoraModal");
  const extraEl = document.querySelector("#alarmeInfoExtraModal");

  if (modalAlarme && nomeEl) {
    nomeEl.textContent = evento.nome;
    if (dataHoraEl) dataHoraEl.textContent = `${dataBr} às ${evento.hora.slice(0, 5)} (${textoTempo})`;
    if (extraEl) {
      extraEl.innerHTML = `
        <p style="margin: 4px 0;">👤 <strong>Quem vai:</strong> ${evento.pessoa || 'Família'}</p>
        ${evento.local ? `<p style="margin: 4px 0;">📍 <strong>Local:</strong> ${evento.local}</p>` : ""}
      `;
    }
    modalAlarme.classList.remove("escondido");
    tocarSomAlarme();
  }
}

function tocarSomAlarme() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Áudio silenciado ou restrito
  }
}

const btnOkAlarme = document.querySelector("#btnOkAlarme");
const modalAlarmeDisparado = document.querySelector("#modalAlarmeDisparado");
if (btnOkAlarme && modalAlarmeDisparado) {
  btnOkAlarme.addEventListener("click", function() {
    modalAlarmeDisparado.classList.add("escondido");
  });
}

setInterval(verificarAlarmes, 15000);

// ============================================================
// 16. ONBOARDING / BOAS-VINDAS NO PRIMEIRO ACESSO
// ============================================================
const modalBoasVindas = document.querySelector("#modalBoasVindas");
const tabJaSouMembro = document.querySelector("#tabJaSouMembro");
const tabNovoMembro = document.querySelector("#tabNovoMembro");
const blocoSelecionarMembro = document.querySelector("#blocoSelecionarMembro");
const formNovoMembroBoasVindas = document.querySelector("#formNovoMembroBoasVindas");
const selectMembroBoasVindas = document.querySelector("#selectMembroBoasVindas");
const btnConfirmarMembroExistente = document.querySelector("#btnConfirmarMembroExistente");
const paletaBoasVindas = document.querySelector("#paletaBoasVindas");
const avisoCorBoasVindas = document.querySelector("#avisoCorBoasVindas");

let corBoasVindas = PALETA_CORES[0];

function verificarOnboardingPrimeiroAcesso() {
  const onboardingConcluido = localStorage.getItem("agenda_usuario_onboarding_concluido");
  if (!onboardingConcluido && modalBoasVindas) {
    popularSelectBoasVindas();
    renderizarPaletaBoasVindas();
    modalBoasVindas.classList.remove("escondido");
  }
}

function popularSelectBoasVindas() {
  if (!selectMembroBoasVindas) return;
  selectMembroBoasVindas.innerHTML = "";
  pessoasFamilia.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nome;
    selectMembroBoasVindas.appendChild(opt);
  });
}

function renderizarPaletaBoasVindas() {
  if (!paletaBoasVindas) return;
  paletaBoasVindas.innerHTML = "";

  const corLivre = PALETA_CORES.find(c => !obterPessoaComCor(c)) || PALETA_CORES[0];
  corBoasVindas = corLivre;

  PALETA_CORES.forEach(cor => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.classList.add("swatch-cor");
    swatch.style.backgroundColor = cor;

    const dono = obterPessoaComCor(cor);
    if (dono) {
      swatch.classList.add("em-uso");
      swatch.title = `Cor já usada por ${dono.nome}`;
    }

    if (cor === corBoasVindas) {
      swatch.classList.add("ativo");
      swatch.innerHTML = "✓";
    }

    swatch.addEventListener("click", function() {
      if (dono) {
        if (avisoCorBoasVindas) {
          avisoCorBoasVindas.textContent = `Cor em uso por ${dono.nome}. Escolha outra!`;
          avisoCorBoasVindas.classList.remove("escondido");
        }
        return;
      }
      if (avisoCorBoasVindas) avisoCorBoasVindas.classList.add("escondido");
      corBoasVindas = cor;
      renderizarPaletaBoasVindas();
    });

    paletaBoasVindas.appendChild(swatch);
  });
}

if (tabJaSouMembro && tabNovoMembro) {
  tabJaSouMembro.addEventListener("click", function() {
    tabJaSouMembro.classList.add("ativo");
    tabNovoMembro.classList.remove("ativo");
    if (blocoSelecionarMembro) blocoSelecionarMembro.classList.remove("escondido");
    if (formNovoMembroBoasVindas) formNovoMembroBoasVindas.classList.add("escondido");
  });
  tabNovoMembro.addEventListener("click", function() {
    tabNovoMembro.classList.add("ativo");
    tabJaSouMembro.classList.remove("ativo");
    if (blocoSelecionarMembro) blocoSelecionarMembro.classList.add("escondido");
    if (formNovoMembroBoasVindas) formNovoMembroBoasVindas.classList.remove("escondido");
  });
}

if (btnConfirmarMembroExistente) {
  btnConfirmarMembroExistente.addEventListener("click", function() {
    const selId = selectMembroBoasVindas.value;
    definirUsuarioAtivo(selId);
    localStorage.setItem("agenda_usuario_onboarding_concluido", "true");
    if (modalBoasVindas) modalBoasVindas.classList.add("escondido");
    solicitarPermissaoNotificacao();
    exibirToast(`Bem-vindo(a), ${pessoasFamilia.find(p => p.id === selId)?.nome || 'membro'}! 🏡`);
  });
}

if (formNovoMembroBoasVindas) {
  formNovoMembroBoasVindas.addEventListener("submit", function(e) {
    e.preventDefault();
    const nome = document.querySelector("#boasVindasNome").value.trim();
    const zap = document.querySelector("#boasVindasWhatsapp").value.trim();
    const nasc = document.querySelector("#boasVindasNascimento").value;
    const email = document.querySelector("#boasVindasEmail")?.value.trim() || "";

    if (!nome) return;

    const dono = obterPessoaComCor(corBoasVindas);
    if (dono) {
      alert(`A cor escolhida já pertence a ${dono.nome}. Escolha outra!`);
      return;
    }

    const novaP = {
      id: "p-" + Date.now(),
      nome,
      cor: corBoasVindas,
      foto: "",
      whatsapp: zap,
      dataNascimento: nasc,
      email: email
    };

    pessoasFamilia.push(novaP);
    salvarPessoas();
    definirUsuarioAtivo(novaP.id);
    localStorage.setItem("agenda_usuario_onboarding_concluido", "true");

    if (modalBoasVindas) modalBoasVindas.classList.add("escondido");
    renderizarSidebarPessoas();
    renderizarSeletorPessoasEvento();
    atualizarVisualizacao();
    solicitarPermissaoNotificacao();
    exibirToast(`Perfil criado com sucesso! Bem-vindo(a), ${nome}! 🎉`);
  });
}

// ============================================================
// 17. PERFIL DAS PESSOAS
// ============================================================
const modalPerfilPessoa = document.querySelector("#modalPerfilPessoa");
const fecharModalPerfil = document.querySelector("#fecharModalPerfil");
const perfilAvatarFoto = document.querySelector("#perfilAvatarFoto");
const perfilNomePessoa = document.querySelector("#perfilNomePessoa");
const perfilCorBadge = document.querySelector("#perfilCorBadge");
const perfilDataNascimento = document.querySelector("#perfilDataNascimento");
const perfilIdadeCalculada = document.querySelector("#perfilIdadeCalculada");
const perfilWhatsapp = document.querySelector("#perfilWhatsapp");
const btnLinkWhatsapp = document.querySelector("#btnLinkWhatsapp");
const perfilEmail = document.querySelector("#perfilEmail");
const selectQuemSouEu = document.querySelector("#selectQuemSouEu");
const avisoPermissaoEdicao = document.querySelector("#avisoPermissaoEdicao");
const btnEditarPerfilPessoa = document.querySelector("#btnEditarPerfilPessoa");
const btnExcluirPessoaPerfil = document.querySelector("#btnExcluirPessoaPerfil");

let idPessoaPerfilVisualizado = null;

function popularSelectQuemSouEu() {
  if (!selectQuemSouEu) return;
  selectQuemSouEu.innerHTML = "";

  pessoasFamilia.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nome;
    if (String(p.id) === String(usuarioAtivoId)) {
      opt.selected = true;
    }
    selectQuemSouEu.appendChild(opt);
  });
}

if (selectQuemSouEu) {
  selectQuemSouEu.addEventListener("change", function() {
    definirUsuarioAtivo(selectQuemSouEu.value);
    atualizarPermissaoPerfil();
    exibirToast(`Você agora está identificado como ${pessoasFamilia.find(p => p.id === usuarioAtivoId)?.nome || "membro"}`);
  });
}

function atualizarPermissaoPerfil() {
  if (!idPessoaPerfilVisualizado) return;
  const ehDonoDoPerfil = String(idPessoaPerfilVisualizado) === String(usuarioAtivoId);
  const pessoaPerfil = obterPessoaPorId(idPessoaPerfilVisualizado);

  if (avisoPermissaoEdicao) {
    if (ehDonoDoPerfil) {
      avisoPermissaoEdicao.textContent = "✨ Este é o seu perfil! Você pode editar suas informações a qualquer momento.";
      avisoPermissaoEdicao.style.color = "#436a3e";
    } else {
      avisoPermissaoEdicao.textContent = `ℹ️ Você está visualizando o perfil de ${pessoaPerfil ? pessoaPerfil.nome : "outro membro"}. Apenas o próprio membro pode editar suas informações. (Se você for ${pessoaPerfil ? pessoaPerfil.nome : "ele"}, altere "Quem é você" acima).`;
      avisoPermissaoEdicao.style.color = "#827b6c";
    }
  }

  if (btnEditarPerfilPessoa) {
    btnEditarPerfilPessoa.textContent = ehDonoDoPerfil ? "✏️ Editar Meu Perfil" : "✏️ Editar Perfil";
  }
}

function abrirModalPerfilPessoa(id) {
  const p = obterPessoaPorId(id);
  if (!p || !modalPerfilPessoa) return;

  idPessoaPerfilVisualizado = id;
  popularSelectQuemSouEu();

  if (perfilAvatarFoto) {
    if (p.foto) {
      perfilAvatarFoto.innerHTML = `<img src="${p.foto}" alt="${p.nome}" />`;
      perfilAvatarFoto.style.backgroundColor = "transparent";
    } else {
      perfilAvatarFoto.innerHTML = p.nome.charAt(0).toUpperCase();
      perfilAvatarFoto.style.backgroundColor = p.cor;
    }
  }

  if (perfilNomePessoa) perfilNomePessoa.textContent = p.nome;

  if (perfilCorBadge) {
    perfilCorBadge.style.backgroundColor = p.cor;
    perfilCorBadge.textContent = `Cor exclusiva: ${p.cor}`;
  }

  if (perfilDataNascimento) {
    perfilDataNascimento.textContent = p.dataNascimento ? formatarDataBR(p.dataNascimento) : "Não informada";
  }

  if (perfilIdadeCalculada) {
    const idade = calcularIdade(p.dataNascimento);
    perfilIdadeCalculada.textContent = idade !== null ? `${idade} anos` : "";
  }

  if (perfilWhatsapp) {
    perfilWhatsapp.textContent = p.whatsapp || "Não informado";
  }

  if (btnLinkWhatsapp) {
    const limpo = (p.whatsapp || "").replace(/\D/g, "");
    if (limpo.length >= 10) {
      const ddi = limpo.startsWith("55") ? limpo : "55" + limpo;
      btnLinkWhatsapp.href = `https://wa.me/${ddi}`;
      btnLinkWhatsapp.classList.remove("escondido");
    } else {
      btnLinkWhatsapp.classList.add("escondido");
    }
  }

  if (perfilEmail) {
    perfilEmail.textContent = p.email || "Não informado";
  }

  atualizarPermissaoPerfil();
  modalPerfilPessoa.classList.remove("escondido");
}

function fecharModalPerfilFn() {
  if (modalPerfilPessoa) modalPerfilPessoa.classList.add("escondido");
  idPessoaPerfilVisualizado = null;
}

if (fecharModalPerfil) fecharModalPerfil.addEventListener("click", fecharModalPerfilFn);
if (modalPerfilPessoa) {
  modalPerfilPessoa.addEventListener("click", function(e) {
    if (e.target === modalPerfilPessoa) fecharModalPerfilFn();
  });
}

if (btnEditarPerfilPessoa) {
  btnEditarPerfilPessoa.addEventListener("click", function() {
    if (!idPessoaPerfilVisualizado) return;
    const ehDono = String(idPessoaPerfilVisualizado) === String(usuarioAtivoId);

    if (!ehDono) {
      const p = obterPessoaPorId(idPessoaPerfilVisualizado);
      const confirma = confirm(`Você está identificado como outro membro. Deseja alternar para ${p ? p.nome : "este membro"} para editar as informações?`);
      if (confirma) {
        definirUsuarioAtivo(idPessoaPerfilVisualizado);
        popularSelectQuemSouEu();
      } else {
        return;
      }
    }

    const idParaEditar = idPessoaPerfilVisualizado;
    fecharModalPerfilFn();
    abrirModalEditarPessoa(idParaEditar);
  });
}

if (btnExcluirPessoaPerfil) {
  btnExcluirPessoaPerfil.addEventListener("click", function() {
    if (!idPessoaPerfilVisualizado) return;
    if (pessoasFamilia.length <= 1) {
      alert("A família precisa ter pelo menos uma pessoa cadastrada.");
      return;
    }

    const p = obterPessoaPorId(idPessoaPerfilVisualizado);
    const confirma = confirm(`Deseja realmente remover "${p ? p.nome : 'esta pessoa'}" da família?`);
    if (confirma) {
      pessoasFamilia = pessoasFamilia.filter(m => String(m.id) !== String(idPessoaPerfilVisualizado));
      salvarPessoas();
      if (usuarioAtivoId === idPessoaPerfilVisualizado) {
        definirUsuarioAtivo(pessoasFamilia[0]?.id || null);
      }
      fecharModalPerfilFn();
      renderizarSidebarPessoas();
      renderizarSeletorPessoasEvento();
      atualizarVisualizacao();
      exibirToast("Pessoa removida da família.");
    }
  });
}

// Modal Editar Pessoa
const modalEditarPessoa = document.querySelector("#modalEditarPessoa");
const fecharModalEditarPessoa = document.querySelector("#fecharModalEditarPessoa");
const cancelarModalEditarPessoa = document.querySelector("#cancelarModalEditarPessoa");
const formEditarPessoa = document.querySelector("#formEditarPessoa");
const editPessoaId = document.querySelector("#editPessoaId");
const editInputNomePessoa = document.querySelector("#editInputNomePessoa");
const editInputWhatsappPessoa = document.querySelector("#editInputWhatsappPessoa");
const editInputNascimentoPessoa = document.querySelector("#editInputNascimentoPessoa");
const editInputEmailPessoa = document.querySelector("#editInputEmailPessoa");
const editInputCorPessoa = document.querySelector("#editInputCorPessoa");
const editPaletaCoresPessoa = document.querySelector("#editPaletaCoresPessoa");
const editAvisoCorDuplicada = document.querySelector("#editAvisoCorDuplicada");
const editAvatarPreview = document.querySelector("#editAvatarPreview");
const editAvatarPreviewLetra = document.querySelector("#editAvatarPreviewLetra");
const editAvatarPreviewImg = document.querySelector("#editAvatarPreviewImg");
const editInputFotoPessoa = document.querySelector("#editInputFotoPessoa");
const editRemoverFotoPessoa = document.querySelector("#editRemoverFotoPessoa");

let editCorSelecionada = "";
let editFotoBase64 = "";

function renderizarPaletaEdicaoPessoa(pessoaId) {
  if (!editPaletaCoresPessoa) return;
  editPaletaCoresPessoa.innerHTML = "";

  PALETA_CORES.forEach(cor => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.classList.add("swatch-cor");
    swatch.style.backgroundColor = cor;

    const dono = obterPessoaComCor(cor, pessoaId);
    if (dono) {
      swatch.classList.add("em-uso");
      swatch.title = `Cor já em uso por ${dono.nome}`;
    }

    if (cor.toLowerCase() === editCorSelecionada.toLowerCase()) {
      swatch.classList.add("ativo");
      swatch.innerHTML = "✓";
    }

    swatch.addEventListener("click", function() {
      if (dono) {
        if (editAvisoCorDuplicada) {
          editAvisoCorDuplicada.textContent = `A cor ${cor} já está sendo usada por ${dono.nome}. Escolha outra!`;
          editAvisoCorDuplicada.classList.remove("escondido");
        }
        return;
      }
      if (editAvisoCorDuplicada) editAvisoCorDuplicada.classList.add("escondido");
      editCorSelecionada = cor;
      if (editInputCorPessoa) editInputCorPessoa.value = cor;
      renderizarPaletaEdicaoPessoa(pessoaId);
      atualizarPreviewAvatarEdicao();
    });

    editPaletaCoresPessoa.appendChild(swatch);
  });
}

function atualizarPreviewAvatarEdicao() {
  if (!editAvatarPreview) return;
  editAvatarPreview.style.backgroundColor = editCorSelecionada;
  const letra = editInputNomePessoa && editInputNomePessoa.value.trim()
    ? editInputNomePessoa.value.trim().charAt(0).toUpperCase()
    : "?";

  if (editAvatarPreviewLetra) editAvatarPreviewLetra.textContent = letra;

  if (editFotoBase64) {
    if (editAvatarPreviewImg) {
      editAvatarPreviewImg.src = editFotoBase64;
      editAvatarPreviewImg.classList.remove("escondido");
    }
    if (editAvatarPreviewLetra) editAvatarPreviewLetra.classList.add("escondido");
    if (editRemoverFotoPessoa) editRemoverFotoPessoa.classList.remove("escondido");
  } else {
    if (editAvatarPreviewImg) {
      editAvatarPreviewImg.src = "";
      editAvatarPreviewImg.classList.add("escondido");
    }
    if (editAvatarPreviewLetra) editAvatarPreviewLetra.classList.remove("escondido");
    if (editRemoverFotoPessoa) editRemoverFotoPessoa.classList.add("escondido");
  }
}

function abrirModalEditarPessoa(id) {
  const p = obterPessoaPorId(id);
  if (!p || !modalEditarPessoa) return;

  editPessoaId.value = p.id;
  if (editInputNomePessoa) editInputNomePessoa.value = p.nome || "";
  if (editInputWhatsappPessoa) editInputWhatsappPessoa.value = p.whatsapp || "";
  if (editInputNascimentoPessoa) editInputNascimentoPessoa.value = p.dataNascimento || "";
  if (editInputEmailPessoa) editInputEmailPessoa.value = p.email || "";

  editCorSelecionada = p.cor || PALETA_CORES[0];
  editFotoBase64 = p.foto || "";

  if (editInputCorPessoa) editInputCorPessoa.value = editCorSelecionada;
  if (editAvisoCorDuplicada) editAvisoCorDuplicada.classList.add("escondido");

  renderizarPaletaEdicaoPessoa(p.id);
  atualizarPreviewAvatarEdicao();

  modalEditarPessoa.classList.remove("escondido");
  setTimeout(() => {
    if (editInputNomePessoa) editInputNomePessoa.focus();
  }, 140);
}

function fecharModalEditarPessoaFn() {
  if (modalEditarPessoa) modalEditarPessoa.classList.add("escondido");
}

if (fecharModalEditarPessoa) fecharModalEditarPessoa.addEventListener("click", fecharModalEditarPessoaFn);
if (cancelarModalEditarPessoa) cancelarModalEditarPessoa.addEventListener("click", fecharModalEditarPessoaFn);
if (modalEditarPessoa) {
  modalEditarPessoa.addEventListener("click", function(e) {
    if (e.target === modalEditarPessoa) fecharModalEditarPessoaFn();
  });
}

if (editInputNomePessoa) editInputNomePessoa.addEventListener("input", atualizarPreviewAvatarEdicao);
if (editInputCorPessoa) {
  editInputCorPessoa.addEventListener("input", function(e) {
    const novaCor = e.target.value;
    const dono = obterPessoaComCor(novaCor, editPessoaId.value);
    if (dono && editAvisoCorDuplicada) {
      editAvisoCorDuplicada.textContent = `Atenção: esta cor já está sendo usada por ${dono.nome}!`;
      editAvisoCorDuplicada.classList.remove("escondido");
    } else if (editAvisoCorDuplicada) {
      editAvisoCorDuplicada.classList.add("escondido");
    }
    editCorSelecionada = novaCor;
    renderizarPaletaEdicaoPessoa(editPessoaId.value);
    atualizarPreviewAvatarEdicao();
  });
}

if (editInputFotoPessoa) {
  editInputFotoPessoa.addEventListener("change", function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      editFotoBase64 = evt.target.result;
      atualizarPreviewAvatarEdicao();
    };
    reader.readAsDataURL(file);
  });
}

if (editRemoverFotoPessoa) {
  editRemoverFotoPessoa.addEventListener("click", function() {
    editFotoBase64 = "";
    if (editInputFotoPessoa) editInputFotoPessoa.value = "";
    atualizarPreviewAvatarEdicao();
  });
}

if (formEditarPessoa) {
  formEditarPessoa.addEventListener("submit", function(e) {
    e.preventDefault();
    const id = editPessoaId.value;
    const nomeLimpo = editInputNomePessoa.value.trim();
    if (!nomeLimpo) {
      alert("Por favor, digite o nome da pessoa.");
      return;
    }

    const donoCor = obterPessoaComCor(editCorSelecionada, id);
    if (donoCor) {
      alert(`A cor escolhida já está sendo usada por ${donoCor.nome}. Cada pessoa deve ter uma cor única!`);
      return;
    }

    const p = obterPessoaPorId(id);
    if (!p) return;

    p.nome = nomeLimpo;
    p.cor = editCorSelecionada;
    p.foto = editFotoBase64 || "";
    p.whatsapp = editInputWhatsappPessoa ? editInputWhatsappPessoa.value.trim() : "";
    p.dataNascimento = editInputNascimentoPessoa ? editInputNascimentoPessoa.value : "";
    p.email = editInputEmailPessoa ? editInputEmailPessoa.value.trim() : "";

    salvarPessoas();
    fecharModalEditarPessoaFn();
    renderizarSidebarPessoas();
    renderizarSeletorPessoasEvento();
    atualizarVisualizacao();
    exibirToast("Informações do perfil atualizadas! ✨");
  });
}

// Modal Nova Pessoa
const modalNovaPessoa = document.querySelector("#modalNovaPessoa");
const fecharModalPessoa = document.querySelector("#fecharModalPessoa");
const cancelarModalPessoa = document.querySelector("#cancelarModalPessoa");
const formNovaPessoa = document.querySelector("#formNovaPessoa");
const inputNomePessoa = document.querySelector("#inputNomePessoa");
const inputWhatsappPessoa = document.querySelector("#inputWhatsappPessoa");
const inputNascimentoPessoa = document.querySelector("#inputNascimentoPessoa");
const inputEmailPessoa = document.querySelector("#inputEmailPessoa");
const inputCorPessoa = document.querySelector("#inputCorPessoa");
const paletaCoresPessoa = document.querySelector("#paletaCoresPessoa");
const avisoCorDuplicada = document.querySelector("#avisoCorDuplicada");
const inputFotoPessoa = document.querySelector("#inputFotoPessoa");
const removerFotoPessoa = document.querySelector("#removerFotoPessoa");
const avatarPreview = document.querySelector("#avatarPreview");
const avatarPreviewLetra = document.querySelector("#avatarPreviewLetra");
const avatarPreviewImg = document.querySelector("#avatarPreviewImg");

let corSelecionadaModal = "";
let fotoBase64Modal = "";

function renderizarPaletaNovaPessoa() {
  if (!paletaCoresPessoa) return;
  paletaCoresPessoa.innerHTML = "";

  PALETA_CORES.forEach(cor => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.classList.add("swatch-cor");
    swatch.style.backgroundColor = cor;

    const dono = obterPessoaComCor(cor);
    if (dono) {
      swatch.classList.add("em-uso");
      swatch.title = `Cor já em uso por ${dono.nome}`;
    }

    if (cor.toLowerCase() === corSelecionadaModal.toLowerCase()) {
      swatch.classList.add("ativo");
      swatch.innerHTML = "✓";
    }

    swatch.addEventListener("click", function() {
      if (dono) {
        if (avisoCorDuplicada) {
          avisoCorDuplicada.textContent = `A cor ${cor} já está sendo usada por ${dono.nome}. Escolha outra cor!`;
          avisoCorDuplicada.classList.remove("escondido");
        }
        return;
      }
      if (avisoCorDuplicada) avisoCorDuplicada.classList.add("escondido");
      corSelecionadaModal = cor;
      if (inputCorPessoa) inputCorPessoa.value = cor;
      renderizarPaletaNovaPessoa();
      atualizarPreviewAvatarModal();
    });

    paletaCoresPessoa.appendChild(swatch);
  });
}

function atualizarPreviewAvatarModal() {
  if (!avatarPreview) return;
  avatarPreview.style.backgroundColor = corSelecionadaModal;
  const letra = inputNomePessoa && inputNomePessoa.value.trim()
    ? inputNomePessoa.value.trim().charAt(0).toUpperCase()
    : "?";

  if (avatarPreviewLetra) avatarPreviewLetra.textContent = letra;

  if (fotoBase64Modal) {
    if (avatarPreviewImg) {
      avatarPreviewImg.src = fotoBase64Modal;
      avatarPreviewImg.classList.remove("escondido");
    }
    if (avatarPreviewLetra) avatarPreviewLetra.classList.add("escondido");
    if (removerFotoPessoa) removerFotoPessoa.classList.remove("escondido");
  } else {
    if (avatarPreviewImg) {
      avatarPreviewImg.src = "";
      avatarPreviewImg.classList.add("escondido");
    }
    if (avatarPreviewLetra) avatarPreviewLetra.classList.remove("escondido");
    if (removerFotoPessoa) removerFotoPessoa.classList.add("escondido");
  }
}

function abrirModalNovaPessoa() {
  if (!modalNovaPessoa) return;
  const corLivre = PALETA_CORES.find(c => !obterPessoaComCor(c)) || PALETA_CORES[0];
  corSelecionadaModal = corLivre;
  fotoBase64Modal = "";

  if (inputNomePessoa) inputNomePessoa.value = "";
  if (inputWhatsappPessoa) inputWhatsappPessoa.value = "";
  if (inputNascimentoPessoa) inputNascimentoPessoa.value = "";
  if (inputEmailPessoa) inputEmailPessoa.value = "";
  if (inputCorPessoa) inputCorPessoa.value = corSelecionadaModal;
  if (avisoCorDuplicada) avisoCorDuplicada.classList.add("escondido");

  atualizarPreviewAvatarModal();
  renderizarPaletaNovaPessoa();

  modalNovaPessoa.classList.remove("escondido");
  setTimeout(() => {
    if (inputNomePessoa) inputNomePessoa.focus();
  }, 150);
}

function fecharModalNovaPessoa() {
  if (modalNovaPessoa) modalNovaPessoa.classList.add("escondido");
}

if (fecharModalPessoa) fecharModalPessoa.addEventListener("click", fecharModalNovaPessoa);
if (cancelarModalPessoa) cancelarModalPessoa.addEventListener("click", fecharModalNovaPessoa);
if (modalNovaPessoa) {
  modalNovaPessoa.addEventListener("click", function(e) {
    if (e.target === modalNovaPessoa) fecharModalNovaPessoa();
  });
}

if (inputNomePessoa) inputNomePessoa.addEventListener("input", atualizarPreviewAvatarModal);
if (inputCorPessoa) {
  inputCorPessoa.addEventListener("input", function(e) {
    const novaCor = e.target.value;
    const dono = obterPessoaComCor(novaCor);
    if (dono && avisoCorDuplicada) {
      avisoCorDuplicada.textContent = `Atenção: esta cor já está sendo usada por ${dono.nome}!`;
      avisoCorDuplicada.classList.remove("escondido");
    } else if (avisoCorDuplicada) {
      avisoCorDuplicada.classList.add("escondido");
    }
    corSelecionadaModal = novaCor;
    renderizarPaletaNovaPessoa();
    atualizarPreviewAvatarModal();
  });
}

if (inputFotoPessoa) {
  inputFotoPessoa.addEventListener("change", function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      fotoBase64Modal = evt.target.result;
      atualizarPreviewAvatarModal();
    };
    reader.readAsDataURL(file);
  });
}

if (removerFotoPessoa) {
  removerFotoPessoa.addEventListener("click", function() {
    fotoBase64Modal = "";
    if (inputFotoPessoa) inputFotoPessoa.value = "";
    atualizarPreviewAvatarModal();
  });
}

if (formNovaPessoa) {
  formNovaPessoa.addEventListener("submit", function(e) {
    e.preventDefault();
    const nomeLimpo = inputNomePessoa.value.trim();
    if (!nomeLimpo) {
      alert("Por favor, digite o nome da pessoa.");
      return;
    }

    const jaExiste = pessoasFamilia.some(p => p.nome.toLowerCase() === nomeLimpo.toLowerCase());
    if (jaExiste) {
      alert(`Já existe uma pessoa chamada "${nomeLimpo}" na família.`);
      return;
    }

    const donoCor = obterPessoaComCor(corSelecionadaModal);
    if (donoCor) {
      alert(`A cor selecionada já está em uso por ${donoCor.nome}. Cada membro deve ter uma cor única!`);
      return;
    }

    const novaPessoa = {
      id: "p-" + Date.now(),
      nome: nomeLimpo,
      cor: corSelecionadaModal,
      foto: fotoBase64Modal || "",
      whatsapp: inputWhatsappPessoa ? inputWhatsappPessoa.value.trim() : "",
      dataNascimento: inputNascimentoPessoa ? inputNascimentoPessoa.value : "",
      email: inputEmailPessoa ? inputEmailPessoa.value.trim() : ""
    };

    pessoasFamilia.push(novaPessoa);
    salvarPessoas();

    renderizarSidebarPessoas();
    renderizarSeletorPessoasEvento();
    atualizarVisualizacao();
    fecharModalNovaPessoa();
    exibirToast(`${nomeLimpo} foi adicionado à família! 🎉`);
  });
}

// ============================================================
// 18. VISUALIZAÇÕES DO CALENDÁRIO (DIA / SEMANA / MÊS / ANO)
// ============================================================
if (tipoVisualizacao && menuVisualizacao) {
  tipoVisualizacao.addEventListener("click", function(e) {
    e.stopPropagation();
    menuVisualizacao.classList.toggle("escondido");
  });

  document.addEventListener("click", function(e) {
    if (!menuVisualizacao.contains(e.target) && e.target !== tipoVisualizacao) {
      menuVisualizacao.classList.add("escondido");
    }
  });

  menuVisualizacao.querySelectorAll("button[data-view]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      const novaView = btn.dataset.view;
      visualizacaoAtual = novaView;
      menuVisualizacao.classList.add("escondido");
      atualizarVisualizacao();
    });
  });
}

function atualizarVisualizacao() {
  if (!tipoVisualizacao || !gradeCalendario) return;

  const titulosBtn = {
    dia: "Dia ▾",
    semana: "Semana ▾",
    mes: "Mês ▾",
    ano: "Ano ▾"
  };
  tipoVisualizacao.textContent = titulosBtn[visualizacaoAtual] || "Mês ▾";

  gradeCalendario.classList.remove("grade-semana", "grade-ano", "visualizacao-dia-container");

  const areaEventosAvulsa = document.querySelector("#eventosDoDia");
  if (areaEventosAvulsa) {
    areaEventosAvulsa.style.display = "none";
  }

  if (visualizacaoAtual === "dia") {
    mostrarVisualizacaoDia();
  } else if (visualizacaoAtual === "semana") {
    mostrarVisualizacaoSemana();
  } else if (visualizacaoAtual === "ano") {
    mostrarVisualizacaoAno();
  } else {
    mostrarVisualizacaoMes();
  }

  atualizarBadgeHoje();
  renderizarMiniCalendario();
}

// 1. VISUALIZAÇÃO: MÊS (CLIQUE NO DIA VAI PARA A PÁGINA DO DIA!)
function mostrarVisualizacaoMes() {
  if (!gradeCalendario || !mesAtualTitulo) return;

  if (diasSemanaCabecalho) diasSemanaCabecalho.style.display = "grid";
  gradeCalendario.style.display = "grid";
  gradeCalendario.innerHTML = "";

  const ano = dataReferencia.getFullYear();
  const mes = dataReferencia.getMonth();

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  mesAtualTitulo.textContent = `${nomesMeses[mes]} de ${ano}`;

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const primeiroDiaSemana = primeiroDia.getDay();

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const vazio = document.createElement("div");
    gradeCalendario.appendChild(vazio);
  }

  const hoje = new Date();
  const hojeISO = formatarDataISO(hoje);
  const eventosVisiveis = obterEventosFiltrados(ano);

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const dataISO = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const eventosDoDia = eventosVisiveis.filter(e => eventoOcorreNaData(e, dataISO));
    const ehHoje = (dataISO === hojeISO);

    const quadrado = document.createElement("button");
    quadrado.type = "button";
    quadrado.classList.add("dia-calendario");
    if (ehHoje) quadrado.classList.add("hoje");

    quadrado.innerHTML = `
      <span class="numero-dia">${dia}</span>
      <div class="eventos-calendario">
        ${eventosDoDia.map(evento => {
          const participantes = parsearParticipantes(evento.pessoa);
          const cor = participantes.length > 0 ? obterCorPessoa(participantes[0]) : "#596747";
          const iconeExtra = evento.ehAniversario ? "🎂 " : (obterConfigRecorrencia(evento) ? "🔄 " : "");
          return `
            <div class="evento-mini" data-evento-id="${evento.id}" style="background-color: ${cor}1f; border-left: 3.5px solid ${cor}; color: #2e3522;" title="${evento.nome} (${evento.pessoa || 'Família'}) - Clique para detalhes">
              ${iconeExtra}${evento.hora.slice(0, 5)} · ${evento.nome}
            </div>
          `;
        }).join("")}
      </div>
      <div class="eventos-dots-mobile">
        ${eventosDoDia.slice(0, 4).map(evento => {
          const participantes = parsearParticipantes(evento.pessoa);
          const cor = participantes.length > 0 ? obterCorPessoa(participantes[0]) : "#596747";
          return `<span class="evento-dot-mini" style="background-color: ${cor};" title="${evento.nome}"></span>`;
        }).join("")}
        ${eventosDoDia.length > 4 ? `<span class="evento-dot-mais">+${eventosDoDia.length - 4}</span>` : ""}
      </div>
    `;

    // Clicar no dia no calendário mensal vai DIRETAMENTE para a página do dia!
    quadrado.addEventListener("click", function() {
      dataReferencia = new Date(ano, mes, dia);
      visualizacaoAtual = "dia";
      atualizarVisualizacao();
    });

    gradeCalendario.appendChild(quadrado);
  }
}

// 2. VISUALIZAÇÃO: SEMANA
function mostrarVisualizacaoSemana() {
  if (!gradeCalendario || !mesAtualTitulo) return;

  if (diasSemanaCabecalho) diasSemanaCabecalho.style.display = "none";
  gradeCalendario.style.display = "grid";
  gradeCalendario.classList.add("grade-semana");
  gradeCalendario.innerHTML = "";

  const dRef = new Date(dataReferencia);
  const diaSemanaIndex = dRef.getDay();
  const inicioSemana = new Date(dRef);
  inicioSemana.setDate(dRef.getDate() - diaSemanaIndex);
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);

  const nomesMesesCurtos = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const dIniStr = `${String(inicioSemana.getDate()).padStart(2, "0")} ${nomesMesesCurtos[inicioSemana.getMonth()]}`;
  const dFimStr = `${String(fimSemana.getDate()).padStart(2, "0")} ${nomesMesesCurtos[fimSemana.getMonth()]} ${fimSemana.getFullYear()}`;
  mesAtualTitulo.textContent = `${dIniStr} – ${dFimStr}`;

  const nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const hoje = new Date();
  const hojeISO = formatarDataISO(hoje);

  const eventosVisiveis = obterEventosFiltrados(dataReferencia.getFullYear());

  for (let i = 0; i < 7; i++) {
    const diaData = new Date(inicioSemana);
    diaData.setDate(inicioSemana.getDate() + i);
    const dataISO = formatarDataISO(diaData);
    const eventosDoDia = eventosVisiveis.filter(e => eventoOcorreNaData(e, dataISO));
    const ehHoje = (dataISO === hojeISO);

    const col = document.createElement("div");
    col.classList.add("dia-semana-coluna");
    if (ehHoje) col.classList.add("hoje");

    col.innerHTML = `
      <div class="dia-semana-col-topo" data-data="${dataISO}" title="Clique para abrir a página deste dia">
        <div>
          <span class="dia-semana-nome-curto">${nomesDias[i].slice(0, 3).toUpperCase()}</span>
          <span class="dia-semana-numero">${diaData.getDate()}</span>
        </div>
        ${ehHoje ? `<span class="dia-semana-hoje-tag">HOJE</span>` : ""}
      </div>
      <div class="dia-semana-eventos-lista">
        ${
          eventosDoDia.length === 0
            ? `<div class="dia-semana-vazio">Sem eventos</div>`
            : eventosDoDia.map(ev => {
                const participantes = parsearParticipantes(ev.pessoa);
                const cor = participantes.length > 0 ? obterCorPessoa(participantes[0]) : "#596747";
                const iconeExtra = ev.ehAniversario ? "🎂 " : (obterConfigRecorrencia(ev) ? "🔄 " : "");
                return `
                  <div class="evento-semana-card" data-evento-id="${ev.id}" style="border-left: 3.5px solid ${cor}; background: ${cor}14; cursor: pointer;" title="${ev.nome} (${ev.pessoa || 'Família'}) - Clique para detalhes">
                    <span class="evento-semana-hora" style="color: ${cor};">${ev.hora.slice(0, 5)}</span>
                    <strong class="evento-semana-nome">${iconeExtra}${ev.nome}</strong>
                    <div class="evento-semana-participantes">
                      ${participantes.map(p => `<span class="p-dot" style="background:${obterCorPessoa(p)}" title="${p}"></span>`).join("")}
                    </div>
                  </div>
                `;
              }).join("")
        }
      </div>
    `;

    col.querySelector(".dia-semana-col-topo").addEventListener("click", function() {
      dataReferencia = new Date(diaData);
      visualizacaoAtual = "dia";
      atualizarVisualizacao();
    });

    gradeCalendario.appendChild(col);
  }
}

// 3. VISUALIZAÇÃO: DIA
function mostrarVisualizacaoDia() {
  if (!gradeCalendario || !mesAtualTitulo) return;

  if (diasSemanaCabecalho) diasSemanaCabecalho.style.display = "none";
  gradeCalendario.style.display = "block";
  gradeCalendario.classList.add("visualizacao-dia-container");
  gradeCalendario.innerHTML = "";

  const dataISO = formatarDataISO(dataReferencia);
  const eventosDoDia = obterEventosFiltrados(dataReferencia.getFullYear())
    .filter(evento => eventoOcorreNaData(evento, dataISO))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  mesAtualTitulo.textContent = dataReferencia.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const hoje = new Date();
  const ehHoje = (dataISO === formatarDataISO(hoje));

  gradeCalendario.innerHTML = `
    <div class="visualizacao-dia">
      ${ehHoje ? `<div class="alerta-dia-hoje">🌟 Você está no dia de <strong>HOJE</strong></div>` : ""}
      ${
        eventosDoDia.length === 0
          ? `
            <div class="dia-sem-eventos-bloco">
              <span class="icone-sem-eventos">📅</span>
              <p class="titulo-sem-eventos">Nenhum evento agendado para este dia.</p>
              <p class="subtitulo-sem-eventos">Clique no botão <strong>+ Criar</strong> para adicionar um compromisso.</p>
            </div>
          `
          : eventosDoDia.map(evento => {
              const participantes = parsearParticipantes(evento.pessoa);
              const corPrincipal = participantes.length > 0 ? obterCorPessoa(participantes[0]) : "#697653";
              const recConfig = obterConfigRecorrencia(evento);
              const { textoLimpo, alarmeMin } = decodificarMetadadosObservacao(evento.observacao);

              const badgesHtml = participantes.map(pNome => {
                const pCor = obterCorPessoa(pNome);
                const pObj = obterPessoaPorNome(pNome);
                const foto = pObj ? pObj.foto : "";
                const avatarHtml = foto
                  ? `<div class="badge-participante-avatar"><img src="${foto}" alt="${pNome}"></div>`
                  : `<div class="badge-participante-avatar" style="background-color: ${pCor}">${pNome.charAt(0).toUpperCase()}</div>`;
                return `
                  <span class="badge-participante" style="background-color: ${pCor}18; color: ${pCor}; border: 1px solid ${pCor}40;">
                    ${avatarHtml}
                    ${pNome}
                  </span>
                `;
              }).join("");

              const tagRecorrenteHtml = recConfig
                ? `<span class="badge-participante" style="background:#e8f4fd; color:#2980b9; border:1px solid #a9d0f5;">🔄 Recorrente (${recConfig.tipo})</span>`
                : "";

              const tagAniversarioHtml = evento.ehAniversario
                ? `<span class="badge-participante" style="background:#fef5e7; color:#d35400; border:1px solid #f8c471;">🎂 Aniversário</span>`
                : "";

              const tagAlarmeHtml = (alarmeMin && alarmeMin !== "none")
                ? `<span class="badge-participante" style="background:#fef9e7; color:#b7950b; border:1px solid #f9e79f;">🔔 ${formatarTextoAlarme(alarmeMin)}</span>`
                : "";

              return `
              <div class="evento-card-dia" data-evento-id="${evento.id}" style="border-left-color: ${corPrincipal}; cursor: pointer;" title="Clique para ver detalhes do compromisso">
                <div class="evento-header-linha">
                  <div class="horario" style="color: ${corPrincipal};">
                    ${evento.hora.slice(0, 5)}
                  </div>
                  <div class="acoes-evento-card">
                    ${
                      evento.ehAniversario
                        ? `<button type="button" class="btn-acao-evento btn-ver-aniver" data-pessoa-id="${evento.pessoaId}" title="Ver perfil do aniversariante">👤 Ver Perfil</button>`
                        : `
                          <button type="button" class="btn-acao-evento btn-editar-evento" data-evento-id="${evento.id}" title="Editar compromisso">
                            ✏️ Editar
                          </button>
                          <button type="button" class="btn-acao-evento btn-excluir-evento" data-evento-id="${evento.id}" title="Excluir compromisso">
                            🗑️ Excluir
                          </button>
                        `
                    }
                  </div>
                </div>

                <div class="detalhes-evento">
                  <h3>${evento.nome}</h3>
                  <div class="badges-participantes-evento">
                    ${badgesHtml}
                    ${tagRecorrenteHtml}
                    ${tagAniversarioHtml}
                    ${tagAlarmeHtml}
                  </div>
                  <p style="margin-top: 6px; color: #736c5d; font-size: 14px;">
                    ${evento.local ? `📍 <strong>${evento.local}</strong>` : ""} 
                    ${evento.transporte ? ` · 🚗 ${evento.transporte}` : ""}
                  </p>

                  ${
                    textoLimpo
                      ? `<p style="font-style: italic; color: #8a806d; margin-top: 6px; background: #fdfbf6; padding: 6px 10px; border-radius: 8px;">Obs.: ${textoLimpo}</p>`
                      : ""
                  }
                </div>
              </div>
            `;
            }).join("")
      }
    </div>
  `;
}

// 4. VISUALIZAÇÃO: ANO
function mostrarVisualizacaoAno() {
  if (!gradeCalendario || !mesAtualTitulo) return;

  if (diasSemanaCabecalho) diasSemanaCabecalho.style.display = "none";
  gradeCalendario.style.display = "grid";
  gradeCalendario.classList.add("grade-ano");
  gradeCalendario.innerHTML = "";

  const ano = dataReferencia.getFullYear();
  mesAtualTitulo.textContent = `Ano de ${ano}`;

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const hoje = new Date();
  const mesAtualHoje = hoje.getMonth();
  const anoAtualHoje = hoje.getFullYear();

  const eventosVisiveis = obterEventosFiltrados(ano);

  nomesMeses.forEach(function(nomeMes, indexMes) {
    const ultimoDiaMes = new Date(ano, indexMes + 1, 0).getDate();
    const eventosDoMes = [];

    for (let d = 1; d <= ultimoDiaMes; d++) {
      const dataISO = `${ano}-${String(indexMes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const evsNoDia = eventosVisiveis.filter(e => eventoOcorreNaData(e, dataISO));
      eventosDoMes.push(...evsNoDia);
    }

    const ehMesAtual = (ano === anoAtualHoje && indexMes === mesAtualHoje);

    const cardMes = document.createElement("div");
    cardMes.classList.add("mes-ano-card");
    if (ehMesAtual) cardMes.classList.add("mes-atual");

    const totalEventos = eventosDoMes.length;

    const primeirosEventosHtml = eventosDoMes.slice(0, 2).map(ev => {
      const participantes = parsearParticipantes(ev.pessoa);
      const cor = participantes.length > 0 ? obterCorPessoa(participantes[0]) : "#596747";
      const diaNum = ev.data ? ev.data.slice(8) : "•";
      return `
        <div class="mes-ano-evento-item">
          <span class="mes-ano-ev-dia">${diaNum}</span>
          <span class="mes-ano-ev-dot" style="background:${cor};"></span>
          <span class="mes-ano-ev-nome">${ev.nome}</span>
        </div>
      `;
    }).join("");

    cardMes.innerHTML = `
      <div class="mes-ano-topo">
        <span class="mes-ano-numero">${String(indexMes + 1).padStart(2, "0")}</span>
        <h4 class="mes-ano-nome">${nomeMes}</h4>
        ${ehMesAtual ? `<span class="mes-ano-atual-badge">ATUAL</span>` : ""}
      </div>
      <div class="mes-ano-contador">
        ${totalEventos === 0 ? "Nenhum evento" : totalEventos === 1 ? "1 evento" : `${totalEventos} eventos`}
      </div>
      <div class="mes-ano-eventos-preview">
        ${primeirosEventosHtml}
        ${totalEventos > 2 ? `<span class="mes-ano-mais">+${totalEventos - 2} mais</span>` : ""}
      </div>
      <div class="mes-ano-rodape">
        <span>Abrir mês →</span>
      </div>
    `;

    cardMes.addEventListener("click", function() {
      dataReferencia = new Date(ano, indexMes, 1);
      visualizacaoAtual = "mes";
      atualizarVisualizacao();
    });

    gradeCalendario.appendChild(cardMes);
  });
}

// ============================================================
// 19. NAVEGAÇÃO DE PERÍODO (ANTERIOR E PRÓXIMO)
// ============================================================
if (mesAnteriorBtn) {
  mesAnteriorBtn.addEventListener("click", function() {
    if (visualizacaoAtual === "dia") {
      dataReferencia.setDate(dataReferencia.getDate() - 1);
    } else if (visualizacaoAtual === "semana") {
      dataReferencia.setDate(dataReferencia.getDate() - 7);
    } else if (visualizacaoAtual === "ano") {
      dataReferencia.setFullYear(dataReferencia.getFullYear() - 1);
    } else {
      dataReferencia.setMonth(dataReferencia.getMonth() - 1);
    }
    miniDataReferencia = new Date(dataReferencia);
    atualizarVisualizacao();
  });
}

if (mesProximoBtn) {
  mesProximoBtn.addEventListener("click", function() {
    if (visualizacaoAtual === "dia") {
      dataReferencia.setDate(dataReferencia.getDate() + 1);
    } else if (visualizacaoAtual === "semana") {
      dataReferencia.setDate(dataReferencia.getDate() + 7);
    } else if (visualizacaoAtual === "ano") {
      dataReferencia.setFullYear(dataReferencia.getFullYear() + 1);
    } else {
      dataReferencia.setMonth(dataReferencia.getMonth() + 1);
    }
    miniDataReferencia = new Date(dataReferencia);
    atualizarVisualizacao();
  });
}

// ============================================================
// 20. DELEGAÇÃO DE EVENTOS DE CLIQUE (ABERTURA DO POPOVER GOOGLE CALENDAR)
// ============================================================
document.addEventListener("click", function(e) {
  const btnAniver = e.target.closest(".btn-ver-aniver");
  if (btnAniver) {
    e.stopPropagation();
    const pid = btnAniver.dataset.pessoaId;
    if (pid) abrirModalPerfilPessoa(pid);
    return;
  }

  const btnEdit = e.target.closest(".btn-editar-evento");
  if (btnEdit) {
    e.stopPropagation();
    const id = btnEdit.dataset.eventoId;
    if (id) abrirModalEditarEvento(id);
    return;
  }

  const btnDel = e.target.closest(".btn-excluir-evento");
  if (btnDel) {
    e.stopPropagation();
    const id = btnDel.dataset.eventoId;
    if (id) abrirModalConfirmarExclusao(id);
    return;
  }

  // Clicar no evento no Mês abre o Popover estilo Google Calendar!
  const miniCard = e.target.closest(".evento-mini");
  if (miniCard) {
    e.stopPropagation();
    const id = miniCard.dataset.eventoId;
    if (id) abrirPopoverEvento(id);
    return;
  }

  // Clicar no evento na Semana abre o Popover estilo Google Calendar!
  const semanaCard = e.target.closest(".evento-semana-card");
  if (semanaCard) {
    e.stopPropagation();
    const id = semanaCard.dataset.eventoId;
    if (id) abrirPopoverEvento(id);
    return;
  }

  // Clicar no card do Dia abre o Popover estilo Google Calendar!
  const diaCard = e.target.closest(".evento-card-dia");
  if (diaCard) {
    if (e.target.closest(".acoes-evento-card")) return; // Deixa o botão de editar/excluir agir
    e.stopPropagation();
    const id = diaCard.dataset.eventoId;
    if (id) abrirPopoverEvento(id);
    return;
  }
});

// ============================================================
// 21. TOAST NOTIFICAÇÃO
// ============================================================
let toastTimeout = null;
function exibirToast(mensagem) {
  const toast = document.querySelector("#toastNotificacao");
  if (!toast) return;
  toast.textContent = mensagem;
  toast.classList.add("visivel");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("visivel");
    toastTimeout = null;
  }, 3200);
}

// ============================================================
// 22. NAVEGAÇÃO PRINCIPAL ENTRE TELAS
// ============================================================
const abrirAgenda = document.querySelector("#abrirAgenda");
const telaInicial = document.querySelector("#telaInicial");
const agenda = document.querySelector(".agenda");
const voltarInicio = document.querySelector("#voltarInicio");

const telaCompras = document.querySelector("#telaCompras");
const telaCardapio = document.querySelector("#telaCardapio");
const voltarComprasParaAgenda = document.querySelector("#voltarComprasParaAgenda");
const voltarCardapioParaAgenda = document.querySelector("#voltarCardapioParaAgenda");

let transicaoAtivaTimeout = null;

function irParaTela(telaDestino, direcaoForcada = null) {
  if (transicaoAtivaTimeout) {
    clearTimeout(transicaoAtivaTimeout);
    transicaoAtivaTimeout = null;
  }

  const telasMap = {
    inicial: telaInicial,
    agenda: agenda,
    compras: telaCompras,
    cardapio: telaCardapio
  };

  const classesAnimacao = [
    "animar-avancar-entrada",
    "animar-avancar-saida",
    "animar-voltar-entrada",
    "animar-voltar-saida"
  ];

  fecharMenuAdicionar();

  let telaAtualId = null;
  let telaAtualEl = null;
  for (const [id, el] of Object.entries(telasMap)) {
    if (el && !el.classList.contains("escondido")) {
      telaAtualId = id;
      telaAtualEl = el;
      break;
    }
  }

  const telaDestinoEl = telasMap[telaDestino];

  if (telaAtualId === telaDestino && telaDestinoEl) {
    if (telaDestino === "agenda") atualizarVisualizacao();
    return;
  }

  let direcao = direcaoForcada;
  if (!direcao) {
    if (telaDestino === "inicial") {
      direcao = "voltar";
    } else if (telaDestino === "agenda" && (telaAtualId === "compras" || telaAtualId === "cardapio")) {
      direcao = "voltar";
    } else {
      direcao = "avancar";
    }
  }

  if (telaDestino === "agenda") {
    atualizarVisualizacao();
  } else if (telaDestino === "compras") {
    salvarERenderizarCompras();
    const input = document.querySelector("#inputTelaCompras");
    if (input) setTimeout(() => input.focus(), 280);
  } else if (telaDestino === "cardapio") {
    renderizarGradeCardapio();
  }

  if (!telaAtualEl || !telaDestinoEl) {
    Object.values(telasMap).forEach(el => el && el.classList.add("escondido"));
    if (telaDestinoEl) telaDestinoEl.classList.remove("escondido");
    return;
  }

  Object.values(telasMap).forEach(el => {
    if (el) el.classList.remove(...classesAnimacao);
  });

  const classeSaida = direcao === "avancar" ? "animar-avancar-saida" : "animar-voltar-saida";
  const classeEntrada = direcao === "avancar" ? "animar-avancar-entrada" : "animar-voltar-entrada";

  telaDestinoEl.classList.remove("escondido");
  telaDestinoEl.classList.add(classeEntrada);
  telaAtualEl.classList.add(classeSaida);

  transicaoAtivaTimeout = setTimeout(function() {
    telaAtualEl.classList.add("escondido");
    telaAtualEl.classList.remove(classeSaida);
    telaDestinoEl.classList.remove(classeEntrada);
    transicaoAtivaTimeout = null;
  }, 270);
}

if (abrirAgenda) {
  abrirAgenda.addEventListener("click", () => irParaTela("agenda"));
}

if (voltarInicio) {
  voltarInicio.addEventListener("click", () => irParaTela("inicial"));
}

if (voltarComprasParaAgenda) {
  voltarComprasParaAgenda.addEventListener("click", () => irParaTela("agenda"));
}

if (voltarCardapioParaAgenda) {
  voltarCardapioParaAgenda.addEventListener("click", () => irParaTela("agenda"));
}

// ============================================================
// 23. LISTA DE COMPRAS DA FAMÍLIA
// ============================================================
let itensCompras = JSON.parse(localStorage.getItem("compras_familia") || "[]");
if (itensCompras.length === 0) {
  itensCompras = [
    { id: 1, nome: "Pão de forma", concluido: false },
    { id: 2, nome: "Leite integral", concluido: false },
    { id: 3, nome: "Café", concluido: true },
    { id: 4, nome: "Frutas da semana", concluido: false }
  ];
}

function salvarERenderizarCompras() {
  localStorage.setItem("compras_familia", JSON.stringify(itensCompras));
  const container = document.querySelector("#listaComprasCompleta");
  const contador = document.querySelector("#contadorCompras");

  const total = itensCompras.length;
  const concluidos = itensCompras.filter(i => i.concluido).length;

  if (contador) {
    contador.textContent = total === 0
      ? "Nenhum item na lista no momento"
      : `${concluidos} de ${total} item(ns) comprados`;
  }

  if (!container) return;
  container.innerHTML = "";

  if (total === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;background:#fffdf8;border:1px dashed #e3ddcf;border-radius:16px;">
        <span style="font-size:36px;display:block;margin-bottom:8px;">🛒</span>
        <p style="color:#697653;font-size:16px;font-weight:600;margin:0 0 5px;">A lista de compras está vazia!</p>
        <p style="color:#8a806d;font-size:13px;margin:0;">Digite um item acima para começar a adicionar.</p>
      </div>
    `;
    return;
  }

  itensCompras.forEach(function(item) {
    const card = document.createElement("div");
    card.classList.add("item-compra-card");
    if (item.concluido) card.classList.add("concluido");

    card.innerHTML = `
      <label>
        <input type="checkbox" ${item.concluido ? "checked" : ""} data-id="${item.id}" />
        <span class="item-compra-nome">${item.nome}</span>
      </label>
      <button class="botao-remover-item" data-id="${item.id}" title="Remover item">✕</button>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll("input[type='checkbox']").forEach(function(cb) {
    cb.addEventListener("change", function() {
      const id = Number(cb.dataset.id);
      const achado = itensCompras.find(i => i.id === id);
      if (achado) {
        achado.concluido = cb.checked;
        salvarERenderizarCompras();
      }
    });
  });

  container.querySelectorAll(".botao-remover-item").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      itensCompras = itensCompras.filter(i => i.id !== id);
      salvarERenderizarCompras();
    });
  });
}
salvarERenderizarCompras();

const formTelaCompras = document.querySelector("#formTelaCompras");
const inputTelaCompras = document.querySelector("#inputTelaCompras");

if (formTelaCompras) {
  formTelaCompras.addEventListener("submit", function(evento) {
    evento.preventDefault();
    if (!inputTelaCompras) return;
    const nome = inputTelaCompras.value.trim();
    if (nome) {
      itensCompras.unshift({ id: Date.now(), nome: nome, concluido: false });
      salvarERenderizarCompras();
      inputTelaCompras.value = "";
      inputTelaCompras.focus();
    }
  });
}

const formCompraRapida = document.querySelector("#formCompraRapida");
const inputCompraRapida = document.querySelector("#inputCompraRapida");

if (formCompraRapida) {
  formCompraRapida.addEventListener("submit", function(evento) {
    evento.preventDefault();
    if (!inputCompraRapida) return;
    const nome = inputCompraRapida.value.trim();
    if (nome) {
      itensCompras.unshift({ id: Date.now(), nome: nome, concluido: false });
      salvarERenderizarCompras();
      inputCompraRapida.value = "";
      exibirToast(`🛒 "${nome}" adicionado à lista de compras!`);
    }
  });
}

const limparComprasConcluidas = document.querySelector("#limparComprasConcluidas");
if (limparComprasConcluidas) {
  limparComprasConcluidas.addEventListener("click", function() {
    const pendentes = itensCompras.filter(i => !i.concluido);
    if (pendentes.length === itensCompras.length) {
      alert("Nenhum item marcado como concluído para limpar.");
      return;
    }
    itensCompras = pendentes;
    salvarERenderizarCompras();
  });
}

// ============================================================
// 24. CARDÁPIO SEMANAL DA FAMÍLIA
// ============================================================
const diasSemanaNomes = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

let cardapioSemanal = JSON.parse(localStorage.getItem("cardapio_semanal_familia") || "null");
if (!cardapioSemanal) {
  cardapioSemanal = {
    "Segunda-feira": "Frango grelhado com legumes e arroz",
    "Terça-feira": "Bife acebolado com purê de batatas",
    "Quarta-feira": "Macarronada especial da família",
    "Quinta-feira": "Peixe assado com salada fresca",
    "Sexta-feira": "Pizza caseira e noite de cinema",
    "Sábado": "Churrasco ou almoço especial",
    "Domingo": "Lasanha tradicional de família"
  };
}

function obterPratoHoje() {
  const indiceHoje = new Date().getDay();
  const nomeHoje = diasSemanaNomes[indiceHoje];
  return {
    dia: nomeHoje,
    prato: cardapioSemanal[nomeHoje] || "Nenhum prato definido para hoje."
  };
}

function atualizarResumoCardapioSidebar() {
  const pratoHoje = obterPratoHoje();
  const resumoElemento = document.querySelector("#resumoPratoHoje");
  if (resumoElemento) {
    resumoElemento.textContent = `${pratoHoje.dia}: ${pratoHoje.prato}`;
  }
}
atualizarResumoCardapioSidebar();

function renderizarGradeCardapio() {
  const container = document.querySelector("#gradeSemanalCardapio");
  if (!container) return;
  container.innerHTML = "";

  const indiceHoje = new Date().getDay();
  const nomeHoje = diasSemanaNomes[indiceHoje];

  const ordemDias = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo"
  ];

  ordemDias.forEach(function(dia) {
    const prato = cardapioSemanal[dia] || "";
    const ehHoje = (dia === nomeHoje);

    const card = document.createElement("div");
    card.classList.add("dia-cardapio-card");
    if (ehHoje) card.classList.add("hoje");

    card.innerHTML = `
      <div class="dia-cardapio-topo">
        <span class="dia-cardapio-nome">${dia}</span>
        ${ehHoje ? `<span class="dia-cardapio-hoje-badge">HOJE</span>` : ""}
      </div>
      <p class="dia-cardapio-prato ${!prato ? "vazio" : ""}">${prato || "Nenhum prato definido para este dia."}</p>
      <form class="dia-cardapio-form" data-dia="${dia}">
        <input type="text" placeholder="Alterar prato para ${dia}..." value="${prato}" />
        <button type="submit">Salvar</button>
      </form>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll(".dia-cardapio-form").forEach(function(form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      const dia = form.dataset.dia;
      const input = form.querySelector("input");
      const novoPrato = input.value.trim();
      cardapioSemanal[dia] = novoPrato;
      localStorage.setItem("cardapio_semanal_familia", JSON.stringify(cardapioSemanal));
      renderizarGradeCardapio();
      atualizarResumoCardapioSidebar();
      exibirToast(`Cardápio de ${dia} atualizado! 🍽️`);
    });
  });
}

// ============================================================
// 25. INICIALIZAÇÃO
// ============================================================
renderizarSidebarPessoas();
renderizarSeletorPessoasEvento();
carregarEventos();
verificarOnboardingPrimeiroAcesso();
