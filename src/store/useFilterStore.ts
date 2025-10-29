import { create } from 'zustand'
import type { FilterOptions } from '../types/database.types'

// Define a interface para o estado e as ações do nosso store.
interface FilterState {
  filters: FilterOptions
  currentPage: number
  setFilters: (newFilters: FilterOptions) => void
  setPage: (page: number) => void
  resetFilters: () => void
}

// Valor inicial para os filtros. 'bairro' agora é um array vazio.
const initialFilters: FilterOptions = { 
  includeOldData: true,
  bairro: []
}

// Cria o store com Zustand.
// Ele centraliza o estado dos filtros e da paginação, tornando-o acessível
// de qualquer componente sem a necessidade de "prop drilling".
export const useFilterStore = create<FilterState>((set) => ({
  filters: initialFilters,
  currentPage: 1,

  // Ação para atualizar os filtros.
  // Ao aplicar um novo filtro, sempre resetamos para a primeira página.
  setFilters: (newFilters) => set({ filters: newFilters, currentPage: 1 }),

  // Ação para mudar a página atual.
  setPage: (page) => set({ currentPage: page }),

  // Ação para limpar todos os filtros e voltar ao estado inicial.
  resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),
}))
