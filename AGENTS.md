# Diretrizes do Projeto - Agenda Familiar

## Visão Geral
Aplicação web para organização e agendamento de eventos e compromissos familiares, com interface responsiva e armazenamento em tempo real via Supabase.

## Stack Tecnológica
- **Frontend**: HTML5, CSS3, JavaScript (ES Modules)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **Backend / Database**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)

## Estrutura de Arquivos
- `index.html`: Estrutura da interface com formulário de cadastro e listagem de eventos.
- `src/main.js`: Lógica de autenticação/conexão com Supabase, manipulação do DOM e eventos.
- `src/style.css`: Estilização e layout da aplicação.
- `public/`: Arquivos estáticos (ícones, imagens).

## Comandos Úteis
- Iniciar servidor de desenvolvimento: `npm run dev` (roda em `http://localhost:5173/`)
- Gerar build de produção: `npm run build`
- Pré-visualizar build: `npm run preview`
