# Script de Web Scraping - VivaReal

Este script coleta dados de imóveis do VivaReal e salva automaticamente no Supabase.

## Instalação

1. Instale o Python 3.8 ou superior
2. Instale as dependências:

```bash
pip install -r requirements.txt
```

## Configuração

O script usa as variáveis de ambiente do arquivo `.env` na raiz do projeto:

- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

Essas variáveis já estão configuradas no arquivo `.env` do projeto.

## Como Executar

```bash
cd scripts
python webscrapping.py
```

## O que o script faz

1. **Cria um job no banco de dados** com status "running"
2. **Coleta links** de imóveis do VivaReal (scroll na página de listagem)
3. **Extrai informações** de cada imóvel:
   - Preço
   - Metragem
   - Quartos, banheiros, vagas
   - Endereço completo
   - Comodidades (piscina, varanda, elevador)
4. **Salva no Supabase** em lotes de 10 imóveis
5. **Atualiza o status do job** em tempo real
6. **Gera arquivo Excel** de backup com todos os dados
7. **Finaliza o job** com status "completed"

## Visualização dos Dados

Após executar o script, acesse o site web para visualizar:
- Lista de todos os imóveis coletados
- Detalhes de cada job de scraping
- Estatísticas e filtros por job

## Personalização

Você pode ajustar o número de scrolls na linha 149:

```python
max_scrolls = 6  # Aumente para coletar mais imóveis
```

Mais scrolls = mais imóveis encontrados (mas também mais tempo de execução).
