import { useState, useMemo, useCallback } from 'react';

interface UseAdvancedTableProps {
  data: any[];
  initialSort?: { key: string; direction: 'asc' | 'desc' };
  initialFilters?: Record<string, any>;
  searchFields?: string[];
}

export const useAdvancedTable = ({
  data,
  initialSort,
  initialFilters = {},
  searchFields = []
}: UseAdvancedTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filtrage et recherche
  const filteredData = useMemo(() => {
    let result = [...data];

    // Recherche
    if (searchQuery) {
      result = result.filter(row => {
        if (searchFields.length > 0) {
          return searchFields.some(field =>
            String(row[field] || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          return Object.values(row).some(value =>
            String(value || '').toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });
    }

    // Filtres
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            result = result.filter(row => value.includes(row[key]));
          }
        } else {
          result = result.filter(row =>
            String(row[key] || '').toLowerCase().includes(String(value).toLowerCase())
          );
        }
      }
    });

    return result;
  }, [data, searchQuery, filters, searchFields]);

  // Tri
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      // Gestion des valeurs nulles/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Gestion des dates
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // Gestion des nombres
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Gestion des chaînes
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Fonctions de contrôle
  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : undefined;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const handleFilter = useCallback((key: string, value: any) => {
    setFilters(current => ({ ...current, [key]: value }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectRow = useCallback((index: number) => {
    setSelectedRows(current => {
      const newSet = new Set(current);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedRows(current => {
      if (current.size === sortedData.length) {
        return new Set();
      } else {
        return new Set(sortedData.map((_, index) => index));
      }
    });
  }, [sortedData.length]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setSortConfig(initialSort);
  }, [initialSort]);

  const exportData = useCallback((format: 'csv' | 'json' = 'csv') => {
    const selectedData = selectedRows.size > 0 
      ? sortedData.filter((_, index) => selectedRows.has(index))
      : sortedData;

    if (format === 'csv') {
      const headers = Object.keys(selectedData[0] || {});
      const csvContent = [
        headers.join(','),
        ...selectedData.map(row => 
          headers.map(header => `"${String(row[header] || '')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(selectedData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [sortedData, selectedRows]);

  return {
    // Données
    data: sortedData,
    filteredCount: filteredData.length,
    totalCount: data.length,
    
    // État
    searchQuery,
    sortConfig,
    filters,
    selectedRows,
    
    // Actions
    handleSort,
    handleFilter,
    handleSearch,
    handleSelectRow,
    handleSelectAll,
    resetFilters,
    exportData,
    
    // Utilitaires
    hasFilters: Object.keys(filters).length > 0 || searchQuery !== '',
    hasSelection: selectedRows.size > 0,
    isAllSelected: selectedRows.size === sortedData.length && sortedData.length > 0
  };
};