# Dashboard Imobiliário - RealEstate Data Harvester

Sistema completo de coleta e visualização de dados imobiliários do VivaReal, desenvolvido com React, TypeScript, Vite e Supabase.

## Funcionalidades

### Dashboard Principal
- Visualização de imóveis em cards informativos
- Estatísticas em tempo real (total de imóveis, cidades, bairros, médias)
- Sistema de filtros avançados com:
  - Busca textual (endereço, bairro, cidade)
  - Filtros por localização (Estado, Cidade, Bairro)
  - Filtros por características (quartos, banheiros, vagas, suítes)
  - Filtros por comodidades (piscina, varanda, elevador)
- Paginação inteligente (20 imóveis por página)
- Design responsivo e moderno

### Monitor de Jobs
- Visualização de jobs de scraping em tempo real
- Status dos jobs (pendente, em execução, concluído, falhou)
- Métricas detalhadas (links encontrados, imóveis coletados, duração)
- Atualização automática a cada 10 segundos

### Integração com Python
- O script `webscrapping.py` coleta dados do VivaReal
- Dados são salvos automaticamente no Supabase
- Backup local em Excel para cada execução
- Sistema de rastreabilidade completo por Job ID

## Estrutura do Projeto

```
project/
├── src/
│   ├── components/          # Componentes React
│   │   ├── PropertyFilters.tsx
│   │   ├── PropertyList.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── Pagination.tsx
│   │   ├── StatsPanel.tsx
│   │   └── JobsMonitor.tsx
│   ├── lib/                 # Configuração e API
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── types/               # TypeScript types
│   │   └── database.types.ts
│   ├── utils/               # Utilitários
│   │   └── debounce.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── scripts/                 # Scripts Python
│   ├── webscrapping.py      # Script principal de coleta
│   └── requirements.txt
└── index.html

```

## Configuração

### 1. Frontend (React)

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

### 2. Python (Scraping)

```bash
# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install selenium webdriver-manager pandas openpyxl supabase python-dotenv colorama beautifulsoup4 tqdm

# Executar coleta
python scripts/webscrapping.py
```

### 3. Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais do Supabase.

## Banco de Dados

### Tabelas

**scraping_jobs**: Controle de execuções de scraping
- id, status, max_scrolls, links_found, properties_scraped
- started_at, completed_at, error_message, created_at

**properties**: Dados dos imóveis
- id, job_id, preco, metragem, quartos, banheiros, vagas, suites
- andar, piscina, varanda, elevador
- rua, bairro, cidade, estado, endereco_completo, link
- created_at

### Índices Otimizados
Índices criados para melhorar performance em:
- Cidade, Bairro, Estado
- Quartos, Status de Jobs
- Datas de criação

## Como Usar

1. **Execute o script Python** para coletar dados:
   ```bash
   cd scripts
   python webscrapping.py
   ```

2. **Acesse o dashboard** em `http://localhost:5173`

3. **Use os filtros** para encontrar imóveis específicos

4. **Monitore os jobs** na seção "Jobs de Scraping"

## Tecnologias

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, API REST)
- **Scraping**: Python, Selenium, BeautifulSoup
- **Estilização**: CSS-in-JS (inline styles)

## Recursos Implementados

- Debounce de 300ms nos filtros para otimizar consultas
- Filtros dependentes (bairros filtrados por cidade)
- Paginação com navegação inteligente
- Estados de loading e error
- Design responsivo para mobile e desktop
- Atualização em tempo real do monitor de jobs
- Backup automático em Excel

## Próximas Melhorias

- Cache de consultas frequentes
- Filtros salvos pelo usuário
- Busca fuzzy com tolerância a erros
- Filtros geográficos por proximidade
- Gráficos e visualizações avançadas
- Export de dados filtrados
