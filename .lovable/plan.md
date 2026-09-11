# CRM Altivus integrado à Agenda

## Objetivo
Manter a Agenda atual como a primeira área do aplicativo e adicionar uma área CRM completa, acessível pela navegação principal. O CRM terá três telas internas: Relatório Geral, Funil e Leads Ativos.

## Navegação e identidade
- Criar um cabeçalho compartilhado nas páginas protegidas com a marca **Altivus.** e acessos para **Agenda**, **CRM** e **Clientes**.
- Preservar a Agenda existente, seus dados, calendário, checklist, metas e pendências.
- Usar azul-marinho como base e introduzir laranja como destaque do CRM, sem descaracterizar a Agenda.
- No CRM, adicionar abas para **Relatório**, **Funil** e **Leads Ativos**, mantendo boa navegação no celular.

## Banco de dados e segurança
- Criar a tabela `leads` com: nome/empresa, telefone, nicho, origem, campanha, data de entrada, status, próxima ação, data/hora da próxima ação e controle de arquivamento.
- Criar a tabela `lead_notes` com o texto da observação, data/hora e vínculo com o lead.
- Validar no banco os status e origens permitidos.
- Ativar regras para que cada usuário possa visualizar e alterar somente seus próprios leads e observações.
- Garantir remoção conjunta das observações quando um lead for excluído.

## Relatório Geral
- Mostrar cartões para total de leads, ativos, fechados, perdidos e taxa de conversão.
- Exibir conversão por origem: Meta Ads, Google Ads, Cold Call, Indicação, Instagram, Prospecção Manual e Outro.
- Calcular a conversão com base nos resultados definitivos: fechados em relação a fechados + perdidos/churn.
- Incluir estados vazios claros enquanto o CRM ainda não possui leads.

## Funil
- Criar um quadro horizontal com as fases:
  1. Novo Lead
  2. Follow Up
  3. Em Abordagem
  4. Reunião Marcada
  5. Proposta Enviada
  6. Criação do Site
  7. Cliente Fechado
  8. Perdido/Sem Interesse
  9. Cliente Perdido (Churn)
- Permitir arrastar cartões entre colunas, salvando a nova fase imediatamente.
- Oferecer também uma opção acessível no cartão para trocar a fase sem arrastar.
- Abrir os detalhes do lead ao clicar no cartão.

## Leads Ativos e cadastro
- Listar leads não arquivados, ordenados pela próxima ação mais urgente; itens sem data ficam no final.
- Permitir busca e filtro por status.
- Criar uma janela única para cadastrar e editar: nome/empresa, telefone, nicho, origem, campanha, entrada, status, próxima ação e data/hora.
- Oferecer lista pronta de nichos comuns, incluindo Encanador, Eletricista e Reboque, além de opção Outro.
- Permitir arquivar/restaurar leads.
- Excluir definitivamente somente após confirmação explícita em uma janela própria.

## Histórico de observações
- Dentro dos detalhes do lead, listar observações da mais recente para a mais antiga.
- Permitir adicionar uma nova nota com registro automático de data e hora.
- Atualizar o histórico imediatamente após salvar.

## Validação
- Verificar tipagem e carregamento das novas páginas.
- Testar no navegador: criar, editar, mover no funil, adicionar observação, arquivar, restaurar e excluir.
- Conferir visual e navegação em desktop e celular, sem alterar o funcionamento atual da Agenda.

## Detalhes técnicos
- Novas páginas protegidas em `/crm`, `/crm/funil` e `/crm/leads`.
- Acesso ao banco pelo cliente autenticado existente, mantendo as regras de segurança por usuário.
- Arrastar e soltar com recursos nativos do navegador, evitando dependência desnecessária.
- Componentes compartilhados para navegação, formulários, cartões e detalhes, evitando duplicação entre as três telas.
