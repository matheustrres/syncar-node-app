# Design system da SynCar

## Direção

A SynCar é um software de operação para locadoras. A identidade combina **verde profundo**, **lima** e **superfícies claras quentes**. A landing pode ser expressiva; autenticação faz a transição; a plataforma precisa priorizar leitura rápida, dados confiáveis e ações previsíveis.

O sistema atual está em transição. Landing e autenticação usam essa identidade. As páginas em `/dashboard` ainda têm classes cinza e azul anteriores e devem ser migradas por fluxo, sem trocar apenas as cores de componentes isolados.

### Aplicação por superfície

| Superfície | Tratamento |
| --- | --- |
| Landing | Fundo verde profundo nas áreas de decisão, títulos expressivos e lima no CTA principal. |
| Login e cadastro | Painel de marca verde, formulário claro, lima na ação principal. |
| Plataforma operacional | Canvas creme, painéis brancos, texto verde escuro. Verde profundo concentra navegação e identidade; lima indica ação principal ou seleção, sem dominar tabelas e gráficos. |

## Fonte de verdade

- Valores compartilhados: [`src/app/globals.css`](src/app/globals.css).
- Utilitários para telas novas: [`tailwind.config.ts`](tailwind.config.ts), com prefixo `syncar` (`bg-syncar-canvas`, `text-syncar-text`, `border-syncar-border`).
- CSS Modules podem usar `var(--syncar-...)` para composições específicas, como landing e autenticação.
- Não introduzir novo hex em telas operacionais quando já existir um papel semântico equivalente. Cores de dados e gráficos exigem decisão própria, pois marca e estado não são séries de dados.
- Inter, carregada em `src/app/layout.tsx`, é a família tipográfica da interface.

## Cor

| Papel | Token CSS | Valor | Uso |
| --- | --- | --- | --- |
| Marca | `--syncar-green-950` | `#102d30` | Navegação, painéis escuros e texto sobre lima. |
| Marca elevada | `--syncar-green-900` | `#173b3c` | Hover ou superfície elevada sobre verde. |
| Ação | `--syncar-action` | `#d8f779` | CTA principal e seleção em fundo escuro. |
| Canvas | `--syncar-canvas` | `#f7f6ef` | Fundo da aplicação. |
| Superfície | `--syncar-surface` | `#ffffff` | Formulários, tabelas e painéis. |
| Superfície sutil | `--syncar-surface-subtle` | `#eef3ec` | Hover neutro e agrupamentos leves. |
| Texto | `--syncar-text` | `#142c2e` | Títulos, valores e corpo. |
| Texto secundário | `--syncar-text-muted` | `#52655f` | Descrições, metadados e legendas. |
| Divisor | `--syncar-border` | `#dce4dc` | Divisões e contornos necessários. |
| Foco | `--syncar-focus` | `#32634e` | Anel de foco visível em superfícies claras. |

Estados usam `--syncar-success` (`#286747`), `--syncar-warning` (`#8a4b0c`), `--syncar-danger` (`#ad352a`) e `--syncar-info` (`#245e78`). Eles descrevem o significado dos dados, não a marca. Nunca depender só da cor: incluir texto, ícone ou ambos. `--syncar-action-text` é o texto sobre o botão lima.

Contrastes verificados para combinações centrais: texto principal sobre ação 12,24:1; ação sobre marca 12,15:1; texto secundário sobre canvas 5,73:1; texto secundário sobre branco 6,2:1. Validar novamente qualquer combinação de estado, opacidade ou cor de gráfico na tela concreta.

## Tipografia e números

| Papel | Desktop | Mobile | Diretriz |
| --- | --- | --- | --- |
| Título da página operacional | 28 px / 34 px, 700 | 24 px / 30 px | Um `h1` por página. |
| Título de seção | 20 px / 28 px, 650 | 18 px / 26 px | Próximo do conteúdo que introduz. |
| Título de painel | 16 px / 24 px, 650 | igual | Não competir com o título da página. |
| Corpo e controles | 14 px / 22 px, 400–600 | igual | Rótulos explícitos; evitar caixa alta no conteúdo. |
| Metadados | 12 px / 18 px, 400–600 | igual | Somente informação secundária. |
| Indicador principal | 28 px / 34 px, 700 | 24 px / 30 px | Unidade e período sempre visíveis. |

Usar numerais tabulares (`font-variant-numeric: tabular-nums`) em preços, métricas e colunas monetárias. Valores monetários seguem `pt-BR`; alinhar números à direita em tabelas. A escala acima orienta a plataforma; a landing mantém a própria escala editorial.

## Espaçamento, forma e movimento

- Espaçamento base: 4, 8, 12, 16, 24, 32 e 48 px. Entre elementos do mesmo grupo: 8–16 px. Entre blocos operacionais: 24–32 px.
- Área principal: limite recomendado de 1440 px; padding lateral de 32 px no desktop, 24 px no tablet e 16 px no celular.
- Barra superior: 64 px. Navegação lateral: 256 px no desktop; gaveta acionável no celular. Não usar a navegação como única indicação de localização: título e contexto devem estar no conteúdo.
- Controles: raio `--syncar-radius-control` (8 px), alvo mínimo de 44 × 44 px. Painéis: raio `--syncar-radius-panel` (14 px).
- Painéis de dados usam borda **ou** sombra, escolhida pela hierarquia. A sombra `--syncar-shadow-overlay` fica para menus e camadas elevadas.
- Transições curtas (`--syncar-motion-fast`, 150 ms) apenas quando comunicam estado. Respeitar `prefers-reduced-motion`. Evitar movimento em números e dados que mudam.
- Foco de teclado é sempre visível; não remover o contorno sem substituto.

## Contratos de componentes

O repositório já possui `src/components/ui`. Reaproveitar e alinhar esses componentes ao implementar as próximas telas; extrair novas primitivas somente quando houver uso repetido com a mesma intenção.

| Componente | Contrato visual e funcional |
| --- | --- |
| Botão | `primary` usa lima e texto verde profundo; `secondary` usa superfície clara e contorno; `quiet` parece link sem perder área clicável; `destructive` usa cor de erro apenas na ação de confirmação. Estados `hover`, `focus`, `disabled` e `loading` obrigatórios. Um CTA primário por região de decisão. |
| Campo | Rótulo persistente acima do campo, ajuda opcional, erro abaixo com texto de correção. Placeholder não substitui rótulo. Altura mínima de 44 px; estado inválido também indicado por texto. |
| Painel | Cabeçalho opcional com título, descrição e ação. Superfície branca, espaço interno de 24 px no desktop e 16 px no celular. Evitar cartões aninhados. |
| Indicador | Título, valor, unidade ou período e contexto de variação quando disponível. Estado de carregamento preserva espaço; ausência de dados não vira zero. |
| Status | Texto curto de domínio (por exemplo, “Disponível”, “Alugado”, “Em manutenção”) acompanhado por cor semântica. Não usar apenas ponto colorido. |
| Tabela | Cabeçalho claro, linhas com altura confortável, números alinhados à direita, ações identificáveis, ordenação e filtros visíveis quando oferecidos. Em largura pequena, priorizar colunas e permitir rolagem horizontal rotulada ou apresentação em lista. |
| Filtros | Mostrar filtros aplicados, permitir limpar e preservar o contexto ao atualizar dados. Busca e filtros não devem competir com a ação principal. |
| Feedback | `EmptyState` indica o próximo passo real; erro explica falha e recuperação; skeleton preserva a estrutura; toast confirma ações breves; modal só para confirmação ou tarefa que exija foco protegido. |

Ícones seguem `lucide-react`, com espessura consistente e rótulo acessível em controles só com ícone. Não usar um ícone como substituto do texto de uma ação crítica.

## Estrutura da dashboard operacional

1. **Contexto:** título “Visão geral”, período dos dados, última atualização quando relevante e ação principal da operação.
2. **Situação atual:** poucos indicadores verificáveis, com rótulo, unidade e período. Exemplo de ordem: veículos disponíveis, contratos ativos, pagamentos pendentes, resultado financeiro. Não usar dados demonstrativos em produção.
3. **Exige atenção:** vencimentos, atrasos e manutenções com quantidade, prazo, impacto e destino clicável. Priorizar urgência real.
4. **Operação:** tabela ou lista com próximos itens de trabalho, filtros simples e estado vazio útil.
5. **Análise:** gráficos e relatórios vêm depois da rotina; legenda e unidade sempre presentes. A escolha da cor codifica categoria ou estado de forma consistente.

No celular, preservar essa ordem e transformar agrupamentos largos em blocos empilhados. Conteúdo crítico não deve depender de hover.

## Migração e critério de aceite

1. Migrar primeiro o shell da dashboard (`layout`, `Sidebar`, `Header`) para canvas, marca, tipografia, foco e navegação responsiva.
2. Migrar a visão geral com dados reais e componentes de indicador, atenção e lista. Revisar estados de carregamento, erro e ausência de dados.
3. Migrar páginas de veículos, contratos e financeiro por fluxo, consolidando padrões repetidos em `src/components/ui`.
4. Remover estilos azuis e cinzas legados somente após substituir seus usos. A landing também contém regras antigas sobrescritas; limpar em uma alteração própria com comparação visual.

Aceite por tela: hierarquia legível em 320 px e desktop, navegação por teclado, foco visível, texto comum com contraste mínimo de 4,5:1, dados com período e unidade, estados vazios e de erro úteis, nenhuma cor usada como sinal único, nenhuma informação fictícia apresentada como real.
