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

  console.log("Eventos carregados:", eventos);

  eventos.forEach(function(evento) {
    const dataEscolhida = new Date(evento.data + "T00:00:00");
  
    const dia = String(dataEscolhida.getDate()).padStart(2, "0");
  
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
  
    const mes = meses[dataEscolhida.getMonth()];
  
    let diaAgenda = document.querySelector(
      `.agenda-dia[data-data="${evento.data}"]`
    );
  
    if (!diaAgenda) {
      diaAgenda = document.createElement("section");
      diaAgenda.classList.add("agenda-dia");
      diaAgenda.setAttribute("data-data", evento.data);
  
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
  
    const novoEvento = document.createElement("div");
    novoEvento.classList.add("evento");
    novoEvento.setAttribute("data-pessoa", evento.pessoa);
  
    novoEvento.innerHTML = `
      <div class="horario">
        ${evento.hora.slice(0, 5)}
      </div>
  
      <div class="detalhes-evento">
        <h3>${evento.nome}</h3>
        <p>${evento.pessoa} · ${evento.local}</p>
        ${evento.observacao ? `<p>Obs.: ${evento.observacao}</p>` : ""}
      </div>
    `;
  
    diaAgenda.appendChild(novoEvento);
  });
}

carregarEventos();

const abrirAgenda = document.querySelector("#abrirAgenda");
const telaInicial = document.querySelector("#telaInicial");
const agenda = document.querySelector(".agenda");

abrirAgenda.addEventListener("click", function() {
  telaInicial.classList.add("escondido");
  agenda.classList.remove("escondido");
});