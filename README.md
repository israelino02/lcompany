# Agenda Gold

Crie um aplicativo web de agenda operacional mensal para um gestor de tráfego pago. O app precisa de autenticação, banco de dados por usuário e uma interface visual escura e sofisticada. Nome do produto: Agenda Operacional.

1. Stack e autenticação

Use React com Tailwind e Supabase para autenticação e banco de dados.

Tela de login (primeira tela do app):

Login por e-mail e senha, com opção de criar conta e link de recuperação de senha

Layout em duas colunas no desktop: à esquerda o formulário, à direita um painel visual com o fundo azul-meia-noite, o nome do produto em fonte serifada e uma frase curta ("Seu mês inteiro em uma tela"). No mobile vira uma coluna só, com o formulário centralizado

O formulário tem: campo de e-mail, campo de senha, botão principal "Entrar", e abaixo um texto discreto "Ainda não tem conta? Criar conta" que alterna o formulário para modo de cadastro

Mensagens de erro claras e diretas dentro do formulário, nunca em alerta do navegador. Exemplos: "E-mail ou senha incorretos", "Esse e-mail já está cadastrado"

Enquanto envia, o botão mostra estado de carregando e fica desabilitado

Depois de entrar, o usuário vai direto para a agenda. Quem não está logado nunca acessa a agenda

No topo da agenda, um botão discreto de sair da conta

Regra de dados: cada usuário só enxerga e edita os próprios registros. Ative políticas de segurança por linha (RLS) no Supabase filtrando por user_id.

2. Banco de dados

Tabela tarefas:

id (uuid), user_id (uuid), data (date), texto (text), prioridade (text: urgente | importante | rotina), feita (boolean, padrão false), created_at

Tabela metas:

id (uuid), user_id (uuid), mes (text no formato 2026-08), titulo (text), alvo (integer), atual (integer, padrão 0), created_at

Todas as alterações salvam automaticamente. Não existe botão de salvar.

3. Design

Cores:

Fundo principal: #070C1A

Superfície dos cards: #0E1730

Superfície secundária (células, inputs): #15203D

Superfície ativa: #1C294B

Acento principal (dourado): #D4AF37 — e um tom claro #E8C766 para hover e gradientes

Texto principal: #ECE8DE

Texto secundário: #8B96B0

Urgente: #E5484D · Importante: #D4AF37 · Rotina: #5B8FC7 · Concluído: #3FBF8F

Bordas: branco a 7% de opacidade; bordas de destaque em dourado a 16%

Aplique um brilho radial sutil no topo do fundo (radial-gradient partindo de #101B38 no centro superior, desaparecendo em 60%).

Tipografia (Google Fonts):

Títulos e números grandes: Playfair Display (peso 600)

Interface e corpo: Montserrat (400, 500, 600, 700)

Números, contadores e percentuais: JetBrains Mono

Padrões visuais:

Cantos arredondados entre 8px e 14px

Rótulos de seção em caixa alta, 10px, espaçamento entre letras de 2,4px, cor cinza-azulada

Transições curtas (150ms). Respeite prefers-reduced-motion

Foco visível no teclado com contorno dourado em todos os elementos interativos

4. Cabeçalho

No topo: rótulo pequeno "Agenda operacional" em dourado, e abaixo o mês por extenso em Playfair Display 38px, com o ano em cinza ao lado (exemplo: Agosto 2026).

À direita, três botões: seta anterior, botão "Hoje" e seta seguinte. As setas trocam o mês exibido e recarregam os dados daquele mês.

Abaixo do cabeçalho, uma barra de conclusão geral do mês:

Rótulo "Conclusão do mês" à esquerda, percentual em JetBrains Mono dourado à direita

Barra de 6px com preenchimento em gradiente dourado (#B8912A até #E8C766), animada

Cálculo: se existirem tarefas e metas, o percentual é a média entre o percentual de tarefas concluídas no mês e a média de progresso das metas (50% cada). Se só existir um dos dois, usa só ele. Cada meta contribui no máximo 100%, mesmo se ultrapassar o alvo

5. Calendário

Grade de 7 colunas com cabeçalho Dom a Sáb. Sábado e domingo com rótulo mais apagado.

Cada dia é uma célula quadrada clicável contendo:

O número do dia no canto superior esquerdo, em JetBrains Mono

Uma fileira de pontinhos coloridos representando as tarefas do dia, na cor da prioridade. Tarefas concluídas viram pontos com 22% de opacidade. Mostre no máximo 6 pontos

Na base da célula, uma micro-barra de 2px que enche em verde conforme o percentual de tarefas concluídas naquele dia. Só aparece se houver tarefa

Estados da célula:

Fim de semana: fundo quase transparente, número apagado (o foco são os dias comerciais, mas o fim de semana continua clicável)

Hoje: borda dourada, fundo mais claro, número dourado em negrito

Selecionado: fundo destacado com contorno dourado claro

Dia com todas as tarefas concluídas: número em verde

Hover: borda dourada e leve elevação

No canto do card do calendário, um contador: "X de Y dias úteis fechados" (um dia útil conta como fechado quando tem tarefa e todas estão concluídas).

Abaixo do calendário, uma legenda com três pontinhos: Urgente, Importante, Rotina.

6. Painel do dia selecionado

Card abaixo do calendário. No topo: o número do dia em Playfair Display dourado 32px, ao lado o dia da semana por extenso em caixa alta, e abaixo em texto menor a data escrita ("29 de agosto"). Se for fim de semana, acrescente "· fim de semana".

Formulário de tarefa em uma linha: campo de texto com o marcador "O que precisa ser feito nesse dia?", um seletor de prioridade (Rotina, Importante, Urgente) e o botão "Adicionar" em dourado com texto escuro. A tecla Enter no campo também adiciona.

Lista de tarefas: cada item é uma faixa com fundo de superfície secundária e uma borda esquerda de 3px na cor da prioridade. Contém:

Caixa de seleção quadrada arredondada à esquerda. Ao marcar, fica verde com um tique

O texto da tarefa. Quando concluída, fica com 40% de opacidade e riscado

Uma etiqueta arredondada com o nome da prioridade, em fundo translúcido da cor correspondente

Um "×" discreto à direita para excluir

Ordenação: pendentes primeiro, e dentro delas Urgente, depois Importante, depois Rotina. Concluídas ficam no final.

Estado vazio: "Nenhuma tarefa nesse dia ainda. Escreva a primeira acima e escolha o nível."

Botão de repetição: abaixo da lista, um botão de borda tracejada com o texto "Repetir essas tarefas nos dias úteis restantes do mês". Ele copia as tarefas do dia selecionado (sempre como pendentes) para todos os dias de segunda a sexta que ainda faltam no mês, sem duplicar tarefas de texto igual. Só aparece quando o dia tem pelo menos uma tarefa.

7. Metas do mês

Card na coluna da direita. Título "Metas do mês" e, no canto, a média de progresso em dourado.

Cada meta mostra:

O título à esquerda e o contador atual/alvo à direita, em JetBrains Mono, com o número atual em dourado e maior

Uma barra de progresso de 5px com o mesmo gradiente dourado

Abaixo, dois botões quadrados pequenos de menos e mais que ajustam o valor atual (nunca abaixo de zero)

Quando o valor atinge o alvo, a barra muda para gradiente verde e aparece uma etiqueta "Batida"

Um "×" à direita para excluir a meta

No rodapé do card, o formulário para criar meta: campo de texto "Nova meta", campo numérico estreito para o alvo, e um botão dourado com "+".

Estado vazio: "Sem metas definidas. Escreva o que você quer bater nesse mês e o número que fecha a conta."

Metas pertencem ao mês exibido. Ao trocar de mês, carregue as metas daquele mês.

8. Pendências por nível

Card abaixo das metas com três blocos lado a lado. Cada bloco mostra um número grande em JetBrains Mono na cor da prioridade e, abaixo, o rótulo em caixa alta: Urgente, Importante, Rotina.

O número é a contagem de tarefas não concluídas do mês inteiro naquele nível.

9. Responsividade

No desktop, duas colunas: calendário e painel do dia à esquerda (proporção 1,45), metas e pendências à direita (proporção 1).

Abaixo de 880px, tudo vira uma coluna única na ordem: cabeçalho, barra de conclusão, calendário, painel do dia, metas, pendências.

Abaixo de 520px, reduza o tamanho do mês para 28px, as células do calendário para altura mínima de 44px e o número do dia para 11px. O formulário de tarefa quebra em duas linhas.

10. Detalhes de comportamento

Ao abrir o app, o mês exibido é o mês atual e o dia selecionado é hoje

Trocar de mês mantém o app na mesma tela, apenas recarregando tarefas e metas daquele mês

Toda alteração salva no banco imediatamente e a interface reflete na hora

Se o salvamento falhar, mostre uma notificação curta no canto: "Não foi possível salvar. Verifique sua conexão."

Não use janelas de confirmação do navegador em nenhuma ação

Importante: foque primeiro em deixar o login e a agenda funcionando com o banco. Depois refine o visual conforme as cores e tipografia descritas acima.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://month-sync-81.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1346f7c9-9377-4f0d-b99d-aeffd946aa31).

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
