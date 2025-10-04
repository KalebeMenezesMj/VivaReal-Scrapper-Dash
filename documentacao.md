# 📘 Documentação Definitiva do Projeto de Scraping Imobiliário

Este documento serve como a fonte única de verdade para a arquitetura, operação e desenvolvimento do sistema híbrido de coleta e visualização de dados imobiliários.

## 1. Project Overview

| Campo | Detalhe |
| :--- | :--- |
| **Nome do Projeto** | RealEstate Data Harvester (RE-DH) |
| **Resumo de Alto Nível** | Sistema híbrido assíncrono projetado para coletar, processar e visualizar dados de listagens imobiliárias de fontes externas (e.g., VivaReal) de forma automatizada e escalável. |
| **Objetivos de Negócio** | Fornecer um *dataset* limpo e atualizado de imóveis para análise de mercado, precificação e inteligência competitiva. Garantir a rastreabilidade completa de cada lote de dados coletado. |
| **Público Alvo** | Engenheiros de Dados, Analistas de Mercado, Desenvolvedores Full-Stack (para manutenção do Frontend/API). |

## 2. Architecture & Design

### 2.1. Padrão Arquitetônico
**Padrão:** Arquitetura Orientada a Dados (Data-Centric) com Desacoplamento de Processos (Hybrid Asynchronous).

O sistema é dividido em três camadas principais que se comunicam através de um *Data Hub* centralizado (Supabase), minimizando dependências diretas entre o motor de I/O intensivo (Python) e a camada de apresentação (React).

### 2.2. Stack Tecnológica

| Camada | Tecnologia Principal | Propósito |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | Interface de monitoramento e auditoria. |
| **Data Hub** | Supabase (PostgreSQL) | Persistência, Autenticação, API Gateway (Edge Functions). |
| **Scraping Engine** | Python 3.x, Selenium, BeautifulSoup | Coleta de dados, simulação de navegador, parsing. |
| **Infraestrutura** | WebContainer (Desenvolvimento) | Ambiente de execução embutido no navegador. |

### 2.3. Topologia de Implantação (Conceitual)

```mermaid
graph TD
    subgraph Frontend [Camada de Apresentação]
        A[React App] -->|API Calls (Anon Key)| B(Supabase Client)
    end

    subgraph DataHub [Data Hub - Supabase]
        B --> C{PostgreSQL DB}
        D[Edge Function] -->|Service Role Key| C
    end

    subgraph ScraperEngine [Motor de Coleta]
        E[Python Script] -->|Writes/Updates| F(Supabase Client)
    end

    E -- Gera Relatório --> G[Local Backup (.xlsx)]
    A -- Monitora --> C
```

### 2.4. Decisões Chave de Design

*   **Desacoplamento I/O:** O uso do Python/Selenium isola a carga pesada de I/O do ambiente Node.js/Vite, prevenindo bloqueios no servidor de desenvolvimento.
*   **Centralização de Dados:** O Supabase é escolhido como *single source of truth*, permitindo que o Frontend consuma dados diretamente via RLS, simplificando a necessidade de um backend REST tradicional.
*   **Robustez do Scraping:** Uso de `webdriver_manager` para garantir que o binário do Chrome Driver esteja sempre compatível com a versão do Chrome instalada no ambiente de execução do Python.
*   **Auditoria:** A tabela `scraping_jobs` garante que cada execução de coleta seja rastreável, ligando todos os imóveis extraídos a um *Job ID* específico.

## 3. System Components

### 3.1. Scraper Engine (`scripts/webscrapping.py`)

*   **Responsabilidade:** Orquestração da coleta, navegação, parsing e persistência em lote.
*   **API/Contrato de Comunicação (Supabase):**
    *   **Input:** `max_scrolls` (configuração).
    *   **Output (DB Write):** Insere/Atualiza registros em `scraping_jobs` e `properties`.
    *   **Protocolo:** Cliente Python `supabase` (HTTP/REST via Service Key/Anon Key).
*   **Modelos de Dados (Chaves):**
    *   `scraping_jobs`: `{id, status, links_found, properties_scraped, ...}`
    *   `properties`: `{job_id, preco, metragem, rua, bairro, ...}`
*   **Lógica Crítica:** Uso intensivo de `re` (Regex) para normalizar dados não estruturados (preço, área) e funções de limpeza para padronizar endereços.

### 3.2. Data Hub (Supabase PostgreSQL)

*   **Responsabilidade:** Armazenamento persistente, aplicação de regras de negócio (RLS) e exposição de dados.
*   **Modelos de Dados:** Detalhados na Seção 5.1.
*   **Comunicação:** Via API REST/Realtime.

### 3.3. Frontend (`src/lib/supabase.ts` e Componentes)

*   **Responsabilidade:** Interface de usuário para visualização, filtragem e monitoramento do status dos *jobs*.
*   **API/Contrato de Comunicação (Supabase):**
    *   **Input:** Credenciais (Anon Key) para inicialização do cliente.
    *   **Output (DB Read):** `supabase.from('scraping_jobs').select()` e `supabase.from('properties').select()`.
    *   **Protocolo:** Cliente JavaScript `@supabase/supabase-js` (HTTP/REST).

## 4. Development & Setup

### 4.1. Pré-requisitos de Ferramentas

*   Node.js: Versão 20.x ou superior.
*   Python: Versão 3.10 ou superior.
*   Gerenciador de Pacotes: npm (ou yarn/pnpm).

### 4.2. Configuração do Ambiente (Frontend/Node.js)

1.  **Instalar Dependências:**
    ```bash
    npm install
    ```
2.  **Configurar Variáveis de Ambiente:** Crie o arquivo `.env` na raiz do projeto com as chaves do Supabase:
    ```bash
    VITE_SUPABASE_URL=https://levouorsotoewkshrgnk.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```
3.  **Iniciar o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    *(O servidor estará acessível em http://localhost:5173 por padrão).*

### 4.3. Configuração do Ambiente (Scraper Engine - Python)

**Nota:** Este ambiente deve ser configurado separadamente, idealmente em um ambiente virtual (`venv`).

1.  **Criar Ambiente Virtual (Exemplo):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
2.  **Instalar Dependências Python:**
    ```bash
    # Instalação baseada no conteúdo do script webscrapping.py
    pip install selenium webdriver-manager pandas openpyxl supabase
    ```
3.  **Configurar Variáveis de Ambiente Python:** O script Python também requer as chaves do Supabase (pode usar o mesmo `.env` se configurado para ser lido pelo Python, ou um `.env` específico para o script).

### 4.4. Execução de Testes

*   **Frontend:** Testes de unidade/integração devem ser implementados usando Jest/Vitest (não configurado, mas recomendado). Executar via `npm test` (se configurado).
*   **Scraper Engine:** Testes unitários para as funções de parsing (`extrair_valores`, `dividir_endereco`) são cruciais.

## 5. Data Management

### 5.1. Schema do Banco de Dados (PostgreSQL)

O schema é definido pela migração `20251001025023_create_properties_and_jobs_tables.sql`.

**Tabela: `scraping_jobs`**
| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, Default `gen_random_uuid()` |
| `status` | `text` | NOT NULL, Default 'pending' |
| `max_scrolls` | `integer` | Default 5 |
| `properties_scraped` | `integer` | Default 0 |
| `created_at`, `completed_at` | `timestamptz` | Timestamps de controle |

**Tabela: `properties`**
| Coluna | Tipo | Restrições |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, Default `gen_random_uuid()` |
| `job_id` | `uuid` | FK para `scraping_jobs`, ON DELETE CASCADE |
| `preco`, `metragem`, etc. | `text` | Dados extraídos (normalizados como texto para preservar a formatação original do site) |
| `endereco_completo` | `text` | Endereço bruto |

### 5.2. Estratégia de Persistência

*   **Escrita:** O Python escreve dados em lotes de 10 registros na tabela `properties` para otimizar a latência de rede e a carga do banco de dados.
*   **Leitura (Frontend):** O Frontend lê diretamente do PostgreSQL via cliente Supabase, aproveitando a infraestrutura gerenciada.

### 5.3. Procedimentos de Migração de Dados

Todas as alterações de schema devem seguir o protocolo de migração do Supabase:

1.  Criar um novo arquivo SQL em `/supabase/migrations/` com um timestamp descritivo.
2.  O arquivo deve ser **completo** (DDL total) e incluir `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
3.  Executar a migração usando o CLI do Supabase (fora do escopo do WebContainer, mas procedimento padrão).

### 5.4. Backup e Recuperação

*   **Backup Primário:** O script Python gera um backup local (`.xlsx`) de cada execução, servindo como um ponto de recuperação imediato e auditável.
*   **Backup Secundário:** O Supabase gerencia backups automáticos do PostgreSQL. A recuperação de desastres deve seguir a documentação oficial do Supabase.

## 6. Security Considerations

### 6.1. Autenticação e Autorização

*   **Frontend:** Utiliza a `Anon Key` do Supabase, que restringe o acesso a operações de escrita (INSERT/UPDATE/DELETE) através de políticas RLS estritas. Apenas `SELECT` é permitido publicamente.
*   **Scraper Engine (Escrita):** O script Python deve idealmente usar uma chave de serviço (`Service Role Key`) ou uma chave de API gerada por uma Edge Function com permissões elevadas, pois ele precisa inserir dados mesmo quando o RLS está ativo para usuários anônimos.

### 6.2. Criptografia

*   **Em Trânsito:** Todas as comunicações (Frontend <-> Supabase, Python <-> Supabase) são forçadas a usar **HTTPS/TLS**, garantido pela infraestrutura do Supabase.
*   **Em Repouso:** Os dados no PostgreSQL são criptografados em repouso, conforme padrão do serviço Supabase.

### 6.3. Vulnerabilidades e Mitigações

*   **SQL Injection:** Mitigado pelo uso de clientes ORM/SDKs (Supabase JS/Python) que parametrizam consultas, e pela restrição de acesso de escrita via RLS/Service Key.
*   **Denial of Service (Scraping):** O `human_sleep` e a limitação de *scrolls* (`max_scrolls`) no Python ajudam a mitigar o risco de sobrecarga do servidor de destino e a detecção de bots.

## 7. Operational & Maintenance

### 7.1. Logging e Monitoramento

*   **Scraper Engine:** Utiliza `colorama` para logs coloridos no console (INFO, WARNING, ERROR). O status do job (`status='failed'`) no Supabase serve como principal métrica de falha operacional.
*   **Frontend:** Logs de erro de rede (falhas de conexão com Supabase) devem ser capturados e exibidos ao usuário.
*   **Métricas:** A tabela `scraping_jobs` é o *dashboard* primário:
    *   **Latência:** Diferença entre `started_at` e `completed_at`.
    *   **Taxa de Sucesso:** `properties_scraped` / `links_found`.

### 7.2. Estratégia de Tratamento de Erros

*   **Erros de Parsing (Python):** Se a extração de um único imóvel falhar, o erro é logado, o imóvel é pulado, e o *job* continua. O erro é registrado no campo `error_message` do `scraping_jobs` apenas se for um erro fatal (e.g., falha de conexão com o DB).
*   **Erros de Conexão (Python):** Tentativas de reconexão ou *sleep* exponencial são recomendadas, mas não implementadas no *script* inicial. Falhas críticas marcam o job como `status='failed'`.

### 7.3. Procedimentos de Deploy/Rollback

*   **Frontend (Vite):** Deploy via `npm run build` seguido pelo upload dos artefatos estáticos para o serviço de hospedagem (e.g., Vercel, Netlify). Rollback é feito revertendo para a versão anterior dos artefatos estáticos.
*   **Scraper Engine (Python):** O script é executado manualmente ou via um orquestrador externo (e.g., Cron Job, GitHub Actions). Rollback significa simplesmente não executar o script até que a versão anterior do código seja implantada no ambiente de execução.
