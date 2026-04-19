# Marine Telematics · Admin

Área administrativa para gerenciar kits de controle de embarcações com mapeamento interativo de componentes.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (banco + auth + storage)
- Deploy no Lovable

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o conteúdo de `supabase_schema.sql` no **SQL Editor**
3. Crie usuários admin em **Authentication → Users**

### 2. Variáveis de ambiente

No Lovable (ou `.env` local):

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

Encontre esses valores em **Supabase → Settings → API**.

### 3. Deploy

**Lovable:** Import from GitHub → selecione este repositório → configure as env vars.

**Local:**
```bash
npm install
npm run dev
```

## Funcionalidades

- **Dashboard:** grid/lista de kits, busca, contagem de componentes
- **Criar/Editar Kit:** upload de imagem + import de JSON exportado pelo Editor de Hotspots
- **Visualizador:** polígonos interativos com hover/click, busca, painel de detalhes
- **Excluir:** remove kit + imagem do storage

## Fluxo de trabalho

```
hotspot_editor.html → desenha polígonos → exporta JSON
Admin → Novo Kit → upload imagem + JSON
Admin → Ver → testa mapeamento
```

## Estrutura

```
src/
  App.tsx                    # Auth + Dashboard
  main.tsx                   # Entry point
  index.css                  # Tailwind
  lib/
    supabase.ts              # Client + tipos
    kitService.ts            # CRUD
  hooks/
    useKits.ts               # Listagem
  components/
    KitCard.tsx              # Card do kit
    KitFormModal.tsx         # Criar/editar
    KitViewerModal.tsx       # Visualizador
    DeleteConfirmModal.tsx
    PolyViewer.tsx           # SVG interativo
```

## Tabela `kits`

| Campo        | Tipo        |
|--------------|-------------|
| id           | uuid        |
| name         | text        |
| description  | text        |
| image_path   | text        |
| hotspots     | jsonb       |
| created_at   | timestamptz |
| updated_at   | timestamptz |

## Storage: bucket `kit-images`

Público (leitura) · upload/delete restrito a autenticados.
