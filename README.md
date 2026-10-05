# Clínica Smart

# PROJETO: Clínica.AI

Crie uma aplicação web responsiva chamada "Clínica.AI".

## 1. OBJETIVO

O Clínica.AI é uma plataforma de organização de marketing para clínicas e profissionais da saúde.

O objetivo do MVP é centralizar em um único sistema:

- Leads
- Oportunidades
- Planejamento de conteúdos
- Tarefas
- Indicadores
- Sugestões de conteúdo com IA

A aplicação deve ser simples, profissional, intuitiva e fácil de utilizar.

IMPORTANTE:
Este é um MVP. Não implemente funcionalidades fora do escopo descrito neste prompt.

---

# 2. PÚBLICO-ALVO

O sistema será utilizado por:

- Clínicas pequenas e médias
- Consultórios particulares
- Profissionais da saúde
- Pequenas equipes responsáveis pelo marketing de clínicas

O usuário não precisa ter conhecimento técnico.

A interface deve ser clara e intuitiva.

---

# 3. TECNOLOGIA E ESTRUTURA

Crie uma aplicação web moderna e responsiva.

Utilize:

- React
- TypeScript
- Tailwind CSS
- Componentes reutilizáveis
- Banco de dados para persistência das informações

Utilize autenticação quando necessário.

Organize o código de forma limpa e modular.

---

# 4. IDENTIDADE VISUAL

O sistema deve transmitir:

- Profissionalismo
- Organização
- Tecnologia
- Confiança
- Simplicidade

Utilize uma interface moderna e limpa.

Preferências:

- Fundo claro
- Cards bem organizados
- Bordas discretas
- Cantos levemente arredondados
- Tipografia moderna
- Ícones simples
- Boa hierarquia visual
- Espaçamento confortável

Evite excesso de elementos visuais.

O sistema deve funcionar muito bem em celular, tablet e computador.

---

# 5. ESTRUTURA DE NAVEGAÇÃO

Crie um menu lateral no desktop e uma navegação adaptada para dispositivos móveis.

Itens:

1. Dashboard
2. Leads
3. Conteúdos
4. Tarefas
5. Oportunidades
6. Assistente IA
7. Configurações

O item atualmente selecionado deve ficar visualmente destacado.

---

# 6. DASHBOARD

Crie uma página inicial chamada "Dashboard".

No topo:

"Olá! 👋"

"Confira o resumo do marketing da sua clínica."

Crie cards com:

- Total de Leads
- Leads Novos
- Agendamentos
- Conversões
- Tarefas Pendentes

Os números devem ser calculados com base nos dados cadastrados no sistema.

Crie também uma área de "Atividades recentes".

Mostre:

- novos leads
- alterações de status
- novos conteúdos
- tarefas concluídas
- novas oportunidades

Crie gráficos simples para visualizar:

- evolução de leads
- agendamentos
- conversões

Os gráficos devem utilizar dados reais cadastrados no sistema.

Se não houver dados, mostrar uma mensagem amigável explicando que o usuário deve cadastrar informações.

---

# 7. GESTÃO DE LEADS

Crie uma página "Leads".

Permita:

- visualizar leads
- cadastrar lead
- editar lead
- excluir lead
- pesquisar lead
- filtrar por status

Campos:

- Nome
- WhatsApp
- E-mail
- Serviço de interesse
- Data de entrada
- Observações
- Status

Status disponíveis:

- Novo
- Contato
- Agendado
- Convertido
- Perdido

Quando um novo lead for criado, o status inicial deve ser "Novo".

Crie botão:

"+ Novo Lead"

Exiba os leads em tabela no desktop e cards no celular.

Inclua ações de editar e excluir.

Antes de excluir, solicitar confirmação.

---

# 8. PLANEJAMENTO DE CONTEÚDOS

Crie uma página "Conteúdos".

Permita:

- criar conteúdo
- editar conteúdo
- excluir conteúdo
- pesquisar
- filtrar por status
- filtrar por tipo

Campos:

- Título
- Tema
- Tipo de conteúdo
- Data planejada
- Status
- Observações

Tipos:

- Post
- Reels
- Stories
- Vídeo
- Artigo
- Campanha

Status:

- Ideia
- Planejado
- Publicado

Todo novo conteúdo deve começar como "Ideia".

Crie botão:

"+ Novo Conteúdo"

Mostre os conteúdos em cards ou tabela.

---

# 9. T

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://med-marketing-muse.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/110cd863-f3fe-460e-bcf0-4c7aded8b29c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
