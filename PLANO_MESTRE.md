# Lista-Mestra do Projeto - Agenda da Família

Documento de referência contendo todas as diretrizes, status atual e roadmap de evolução do aplicativo.

---

## 1. Tela Inicial
- Tela inicial simples, acolhedora e elegante.
- Botão "Entrar →" para acessar a agenda principal.
- Ao entrar, a tela inicial oculta-se e a agenda toma o espaço.
- Transição suave entre a tela inicial e a agenda, com opção clara para retornar.

## 2. Agenda Principal (Inspirada no Google Calendar)
- Centro da aplicação.
- Calendário mensal completo com grade de 7 dias da semana sempre visíveis.
- Eventos distribuídos nos seus respectivos dias, ordenados cronologicamente pelo horário.
- Clique no dia exibe os detalhes/eventos daquela data.
- Navegação entre mês anterior/próximo e exibição de mês/ano atual.
- Seletor de visualizações: Dia, Semana, Mês, Ano (com rótulo dinâmico e seta para baixo).
- Visualização de dia com navegação anterior/próximo.
- **Mobile**: calendário responsivo sem necessidade de rolagem horizontal forçada, com recurso futuro de ampliação/zoom confortável.

## 3. Sistema do Botão "+" (Universal)
- Botão "+" flutuante, discreto e elegante:
  - Desktop: canto superior.
  - Mobile: fixado no canto inferior direito.
- Ao clicar no "+", exibe um submenu com animação suave contendo:
  - 📅 **Evento** (abre o formulário de evento)
  - 🛒 **Compra** (adicionar item à lista)
  - 🍽️ **Cardápio** (planejar refeição)
  - 👤 **Pessoa** (cadastrar novo membro)
- Mesma filosofia reutilizável em outras seções do app.

## 4. Cadastro e Gestão de Eventos
- Campos: Nome, Pessoa responsável, Data, Horário, Local, Transporte e Observação.
- Entrada de Data e Horário compatível tanto via seletor quanto digitação manual (sem conflitos de máscara).
- Opção de selecionar uma pessoa específica ou "Todos" (futuro: múltiplas pessoas).
- Exibição refinada de Transporte e Observações (quebra de linha e textos longos sem corte).
- Atualização imediata em tela após salvar e sincronização em tempo real via Supabase.

## 5. Banco de Dados e Sincronização (Supabase)
- Conexão ativa com o Supabase para persistência e compartilhamento multi-dispositivo.
- Evolução futura: segregação dos dados por conta/família.

## 6. Menu "Nossa Família" (Três Pontinhos `⋯`)
- Botão discreto de três pontinhos `⋯` na barra superior.
- Abre um painel lateral (*drawer*) deslizante e suave.
- Não cobre todo o calendário em telas grandes (aparece ao lado).
- Opções dentro do painel:
  - 👨‍👩‍👧‍👦 Pessoas
  - 🛒 Lista de compras
  - 🍽️ Cardápio
- Botão claro para fechar e retornar à agenda.

## 7. Gestão Dinâmica de Pessoas
- Fim da lista estática fixada no código; cada família cadastra seus próprios membros.
- Campos: Nome, foto/avatar.
- Uso dinâmico dos avatares nos eventos e filtros.

## 8. Lista de Compras
- Compartilhada entre todos os membros da família.
- Acesso pela gaveta lateral e adição via botão "+".
- Recursos de adicionar, riscar/marcar e remover itens.

## 9. Cardápio da Família
- Organização compartilhada das refeições da semana/mês.
- Integração futura com as datas da agenda e adição rápida via "+".

## 10. Integração com WhatsApp
- Início: Geração de resumo formatado da agenda pronto para envio no WhatsApp.
- Futuro: Notificações automáticas via API/WhatsApp Business, com cadastro de telefones dos membros.

## 11. Multi-Famílias (Multi-Tenant)
- Estrutura preparada para suportar múltiplas famílias e contas independentes no futuro.

## 12. Design & Identidade Visual
- Estilo: Simples, elegante, familiar, moderno e funcional.
- Paleta: Verde oliva (`#697653`, `#596747`), tons neutros e acolhedores creme/off-white (`#fffdf8`, `#eeeadd`).
- Microinterações e animações sutis, preservando a estabilidade da interface.

## 13. Publicação e CI/CD
- Repositório Git: `olirssara/agenda.da.familia` (branch `main`).
- Deploy automatizado na Vercel a cada commit.

---

## Regras de Ouro do Desenvolvimento
1. **Passos incrementais**: Fazer uma alteração por vez.
2. **Testar após cada alteração**: Garantir funcionamento antes de avançar.
3. **Evitar duplicações**: Não criar IDs ou variáveis duplicadas no JS.
4. **Preservar o que funciona**: Não alterar trechos estáveis sem necessidade.
5. **Commits pontuais**: Manter versões seguras para rollback.

---

## 14. Melhorias e Ajustes Recentes (Feedback da Família)
- [x] **Padronização dos quadros e truncamento de texto longo (Pai & Davi)**: Nomes de eventos na semana agora limitam-se a 2 linhas com reticências (`...`) para nunca quebrar o layout nem esticar quadros vizinhos. Altura mínima e rolagem interna uniforme nos dias. Texto completo exibido no popover.
- [x] **Ergonomia no celular - Menu e Botão + no rodapé (Pai)**: Botões flutuantes móveis posicionados no canto inferior direito (`☰` Menu da Família e `+` Adicionar), onde o polegar alcança com conforto. Ocultação do botão do topo no celular para liberar espaço e não cortar o título do mês.
- [x] **Formulário de cadastro no celular (Sara)**: Modais centralizados e suaves, evitando empurrões bruscos na tela ou ocultação no rodapé.
- [x] **Clique em evento no mês (Sara)**: Clicar no evento abre exclusivamente a janela flutuante (popover), sem mudar para a visualização do dia.
- [x] **Correção no salvamento de fotos**: Compressão automática via Canvas para avatares leves (~10KB JPEG), eliminando erro de quota de memória.
- [x] **Lembrete de Domingo**: Banner dinâmico inteligente no domingo e segunda-feira com envio de 1 toque no WhatsApp e botão para agendar alarme semanal nativo no celular (Google Agenda / Apple Calendar).
