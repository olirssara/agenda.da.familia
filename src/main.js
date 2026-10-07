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

salvarEvento.addEventListener("click", function() {

  const nome = nomeEvento.value;
  const data = dataEvento.value;
  const hora = horaEvento.value;
  const local = localEvento.value;
  const pessoa = pessoaEvento.value;
  const transporte = transporteEvento.value;
  const observacao = observacaoEvento.value.trim();

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

const abrirAgenda = document.querySelector("#abrirAgenda");
const telaInicial = document.querySelector("#telaInicial");
const agenda = document.querySelector(".agenda");

abrirAgenda.addEventListener("click", function() {
  telaInicial.classList.add("escondido");
  agenda.classList.remove("escondido");
});