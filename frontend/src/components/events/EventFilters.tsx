import { EVENT_TYPES } from '../../types/event.types';
import { useEffect, useState } from 'react';
import { getCategories } from '../../api/eventsApi';
import type { Category } from '../../types/event.types';

export interface EventFilterValues {
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  eventType?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface EventFiltersProps {
  onFilter: (filters: EventFilterValues) => void;
  /** The primary keyword search lives in the search-page navigation bar. */
  showSearch?: boolean;
}

export default function EventFilters({ onFilter, showSearch = true }: EventFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data)).catch(() => setCategories([]));
  }, []);

  return (
    <div className="event-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
      {showSearch && (
        <input
          type="text"
          placeholder="Αναζήτηση εκδηλώσεων..."
          onChange={(e) => onFilter({ search: e.target.value || undefined })}
          style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 200px' }}
        />
      )}
      <select
        onChange={(e) => onFilter({ category: e.target.value || undefined })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' }}
      >
        <option value="">Κατηγορία</option>
        {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
      </select>
      <select onChange={(e) => onFilter({ eventType: e.target.value || undefined })} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 170px' }}>
        <option value="">Τύπος Εκδήλωσης</option>
        {EVENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
      </select>
      <input
        type="date"
        aria-label="Ημερομηνία από"
        onChange={(e) => onFilter({ dateFrom: e.target.value || undefined })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' }}
      />
      <input
        type="date"
        aria-label="Ημερομηνία έως"
        onChange={(e) => onFilter({ dateTo: e.target.value ? `${e.target.value}T23:59:59.999` : undefined })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' }}
      />
      <input type="number" min="0" step="0.01" placeholder="Ελάχιστη τιμή (€)" onChange={(e) => onFilter({ minPrice: e.target.value ? Number(e.target.value) : undefined })} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '150px' }} />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Μέγιστη τιμή εισιτηρίου (€)"
        onChange={(e) => onFilter({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '210px' }}
      />
    </div>
  );
}
