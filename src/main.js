import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://wmvbzhfmmyxbtziwmcrq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdmJ6aGZtbXl4YnR6aXdtY3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MDEyMjIsImV4cCI6MjEwNjk3NzIyMn0.BaOs7r5-UxvL1MBS2JwE_B_JGSFphlak6dLB5rHOX7g"
);

console.log("Supabase conectado!");

const botaoAdicionar = document.querySelector("#botaoAdicionar");
const formulario = document.querySelector("#formulario");
const salvarEvento = document.querySelector("#salvarEvento");

const nomeEvento = document.querySelector("#nomeEvento");
const dataEvento = document.querySelector("#dataEvento");
const horaEvento = document.querySelector("#horaEvento");
const localEvento = document.querySelector("#localEvento");
const pessoaEvento = document.querySelector("#pessoaEvento");
const transporteEvento = document.querySelector("#transporteEvento");
const observacaoEvento = document.querySelector("#observacaoEvento");

// ABRIR E FECHAR FORMULÁRIO

botaoAdicionar.addEventListener("click", function() {
  formulario.classList.toggle("escondido");
});


// ADICIONAR EVENTO

salvarEvento.addEventListener("click", async function() {

  const nome = nomeEvento.value;
  const data = dataEvento.value;
  const hora = horaEvento.value;
  const local = localEvento.value;
  const pessoa = pessoaEvento.value;
  const transporte = transporteEvento.value;
  const observacao = observacaoEvento.value.trim();

  const { error } = await supabase
  .from("eventos")
  .insert({
    nome: nome,
    pessoa: pessoa,
    data: data,
    hora: hora,
    local: local,
    transporte: transporte,
    observacao: observacao
  });

if (error) {
  console.error(error);
  alert("Não foi possível salvar o evento.");
  return;
}

await carregarEventos();

  if (nome === "" || data === "" || hora === "" || local === "") {
    alert("Preencha todos os campos.");
    return;
  }


  // TRANSFORMA A DATA EM UMA DATA DO JAVASCRIPT

  const dataEscolhida = new Date(data + "T00:00:00");

  const dia = String(dataEscolhida.getDate()).padStart(2, "0");

  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro"
  ];

  const mes = meses[dataEscolhida.getMonth()];


  // PROCURA SE ESSE DIA JÁ EXISTE

  let diaAgenda = document.querySelector(
    `.agenda-dia[data-data="${data}"]`
  );


  // SE NÃO EXISTIR, CRIA UM NOVO DIA

  if (!diaAgenda) {

    diaAgenda = document.createElement("section");

    diaAgenda.classList.add("agenda-dia");

    diaAgenda.setAttribute("data-data", data);

    diaAgenda.innerHTML = `
      <div class="titulo-dia">
        <div>
          <span class="dia-semana">
            ${dataEscolhida.toLocaleDateString("pt-BR", {
              weekday: "long"
            }).toUpperCase()}
          </span>

          <h2>${dia} de ${mes}</h2>
        </div>
      </div>
    `;

    document.querySelector(".agenda").insertBefore(
      diaAgenda,
      document.querySelector("#botaoAdicionar")
    );
  }


  // CRIA O EVENTO

  const novoEvento = document.createElement("div");

  novoEvento.classList.add("evento");
  novoEvento.setAttribute("data-pessoa", pessoa);

  novoEvento.innerHTML = `
    <div class="horario">
      ${hora}
    </div>

    <div class="detalhes-evento">
      <h3>${nome}</h3>
      <p>${pessoa} · ${local} · ${transporte}</p>    </div>
      ${observacao ? `<p>Obs.: ${observacao}</p>` : ""}
  `;


  diaAgenda.appendChild(novoEvento);


  // LIMPA O FORMULÁRIO

  nomeEvento.value = "";
  dataEvento.value = "";
  horaEvento.value = "";
  localEvento.value = "";
  pessoaEvento.value ="Diogo";
  transporteEvento.value = "carro";
  observacaoEvento.value = "";
  
  // FECHA O FORMULÁRIO

  formulario.classList.add("escondido");

});

const pessoas = document.querySelectorAll(".pessoa");

pessoas.forEach(function(pessoaElemento) {

  pessoaElemento.addEventListener("click", function() {

    const nomePessoa = pessoaElemento.querySelector("span").textContent;

    const eventos = document.querySelectorAll(".evento");

    eventos.forEach(function(evento) {

      const pessoaDoEvento = evento.getAttribute("data-pessoa");

      if (nomePessoa === "Todos") {
        evento.style.display = "flex";
      } 
      else if (pessoaDoEvento === nomePessoa) {
        evento.style.display = "flex";
      } 
      else {
        evento.style.display = "none";
      }

    });

  });

});

let eventosCarregados = [];
let visualizacaoAtual = "mes";

let mesExibido = new Date();
mesExibido.setDate(1);

let dataSelecionada = null;

async function carregarEventos() {
  const { data: eventos, error } = await supabase
    .from("eventos")
    .select("*")
    .order("data", { ascending: true })
    .order("hora", { ascending: true });

  if (error) {
    console.error("Erro ao carregar eventos:", error);
    return;
  }

  eventosCarregados = eventos;

  mostrarCalendario();
}

function mostrarCalendario() {

  if (visualizacaoAtual === "dia") {
    mostrarVisualizacaoDia();
    return;
  }

  const grade = document.querySelector("#gradeCalendario");
  const titulo = document.querySelector("#mesAtual");

  grade.innerHTML = "";

  const ano = mesExibido.getFullYear();
  const mes = mesExibido.getMonth();

  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];

  titulo.textContent = `${nomesMeses[mes]} ${ano}`;

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const primeiroDiaSemana = primeiroDia.getDay();

  for (let i = 0; i < primeiroDiaSemana; i++) {
    const vazio = document.createElement("div");
    grade.appendChild(vazio);
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {

    const data = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    const eventosDoDia = eventosCarregados.filter(
      evento => evento.data === data
    );

    const quadrado = document.createElement("button");

    quadrado.classList.add("dia-calendario");

    quadrado.innerHTML = `
      <span class="numero-dia">${dia}</span>

      <div class="eventos-calendario">
        ${eventosDoDia.map(evento => `
          <div class="evento-mini">
            ${evento.hora.slice(0, 5)} · ${evento.nome}
          </div>
        `).join("")}
      </div>
    `;

    quadrado.addEventListener("click", function() {
      mostrarEventosDoDia(data);
    });

    grade.appendChild(quadrado);
  }
}

function mostrarEventosDoDia(data) {

  dataSelecionada = data;

  const eventosDoDia = eventosCarregados
    .filter(evento => evento.data === data)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  let area = document.querySelector("#eventosDoDia");

  if (!area) {
    area = document.createElement("section");
    area.id = "eventosDoDia";
    area.classList.add("eventos-do-dia");

    document.querySelector("#botaoAdicionar")
      .insertAdjacentElement("afterend", area);
  }

  const dataEscolhida = new Date(data + "T00:00:00");

  const dataFormatada = dataEscolhida.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  area.innerHTML = `
    <h2>${dataFormatada}</h2>

    ${
      eventosDoDia.length === 0
        ? `<p>Nenhum evento neste dia.</p>`
        : eventosDoDia.map(evento => `
          <div class="evento">
            <div class="horario">
              ${evento.hora.slice(0, 5)}
            </div>

            <div class="detalhes-evento">
              <h3>${evento.nome}</h3>
              <p>
                ${evento.pessoa} · ${evento.local} · ${evento.transporte}
              </p>

              ${
                evento.observacao
                  ? `<p>Obs.: ${evento.observacao}</p>`
                  : ""
              }
            </div>
          </div>
        `).join("")
    }
  `;
}

document.querySelector("#mesAnterior").addEventListener("click", function() {
  if (visualizacaoAtual === "dia") {
    const data = new Date(
      (dataSelecionada || new Date().toISOString().slice(0, 10)) + "T00:00:00"
    );
    data.setDate(data.getDate() - 1);

    dataSelecionada = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;

    mesExibido = new Date(data.getFullYear(), data.getMonth(), 1);
  } else {
    mesExibido.setMonth(mesExibido.getMonth() - 1);
  }

  mostrarCalendario();
});

document.querySelector("#mesProximo").addEventListener("click", function() {
  if (visualizacaoAtual === "dia") {
    const data = new Date(
      (dataSelecionada || new Date().toISOString().slice(0, 10)) + "T00:00:00"
    );
    data.setDate(data.getDate() + 1);

    dataSelecionada = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;

    mesExibido = new Date(data.getFullYear(), data.getMonth(), 1);
  } else {
    mesExibido.setMonth(mesExibido.getMonth() + 1);
  }

  mostrarCalendario();
});


carregarEventos();

const abrirAgenda = document.querySelector("#abrirAgenda");
const telaInicial = document.querySelector("#telaInicial");
const agenda = document.querySelector(".agenda");

abrirAgenda.addEventListener("click", function() {
  telaInicial.classList.add("escondido");
  agenda.classList.remove("escondido");
});

const voltarInicio = document.querySelector("#voltarInicio");

voltarInicio.addEventListener("click", function() {
  agenda.classList.add("escondido");
  telaInicial.classList.remove("escondido");
});

const abrirFamilia = document.querySelector("#abrirFamilia");
const telaFamilia = document.querySelector("#telaFamilia");
const voltarAgenda = document.querySelector("#voltarAgenda");

abrirFamilia.addEventListener("click", function() {
  telaFamilia.classList.remove("escondido");
});

voltarAgenda.addEventListener("click", function() {
  telaFamilia.classList.add("escondido");
});

const tipoVisualizacao = document.querySelector("#tipoVisualizacao");
const menuVisualizacao = document.querySelector("#menuVisualizacao");

tipoVisualizacao.addEventListener("click", function() {
  menuVisualizacao.classList.toggle("escondido");
});

const opcoesVisualizacao = document.querySelectorAll(
  "#menuVisualizacao button"
);

opcoesVisualizacao.forEach(function(opcao) {
  opcao.addEventListener("click", function() {
    const visualizacao = opcao.dataset.view;
    visualizacaoAtual = visualizacao;
    mostrarCalendario();

    if (visualizacao === "dia") {
      tipoVisualizacao.textContent = "Dia ▾";
    }

    if (visualizacao === "semana") {
      tipoVisualizacao.textContent = "Semana ▾";
    }

    if (visualizacao === "mes") {
      tipoVisualizacao.textContent = "Mês ▾";
      document.querySelector(".dias-semana").style.display = "grid";
      document.querySelector("#gradeCalendario").style.display = "grid";
      mostrarCalendario();
    }

    if (visualizacao === "ano") {
      tipoVisualizacao.textContent = "Ano ▾";
    }

    menuVisualizacao.classList.add("escondido");
  });
});

function mostrarVisualizacaoDia() {
  const grade = document.querySelector("#gradeCalendario");
  const diasSemana = document.querySelector(".dias-semana");

  grade.innerHTML = "";
  diasSemana.style.display = "none";

  const hoje = new Date();

const data = dataSelecionada ||
  `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  const eventosDoDia = eventosCarregados
    .filter(evento => evento.data === data)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const dataEscolhida = new Date(data + "T00:00:00");

  const titulo = document.querySelector("#mesAtual");

  titulo.textContent = dataEscolhida.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  grade.style.display = "block";

  grade.innerHTML = `
    <div class="visualizacao-dia">
      ${
        eventosDoDia.length === 0
          ? `<p>Nenhum evento neste dia.</p>`
          : eventosDoDia.map(evento => `
              <div class="evento">
                <div class="horario">
                  ${evento.hora.slice(0, 5)}
                </div>

                <div class="detalhes-evento">
                  <h3>${evento.nome}</h3>
                  <p>${evento.pessoa} · ${evento.local}</p>

                  ${
                    evento.transporte
                      ? `<p>${evento.transporte}</p>`
                      : ""
                  }

                  ${
                    evento.observacao
                      ? `<p>Obs.: ${evento.observacao}</p>`
                      : ""
                  }
                </div>
              </div>
            `).join("")
      }
    </div>
  `;
}
