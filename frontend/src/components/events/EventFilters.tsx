interface EventFiltersProps {
  onFilter: (filters: { category?: string; search?: string; dateFrom?: string; rooms?: number; beds?: number; maxPrice?: number }) => void;
}

export default function EventFilters({ onFilter }: EventFiltersProps) {
  return (
    <div className="event-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Αναζήτηση (π.χ. Αθήνα, πισίνα)..."
        onChange={(e) => onFilter({ search: e.target.value })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 200px' }}
      />
      <select
        onChange={(e) => onFilter({ category: e.target.value })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' }}
      >
        <option value="">Όλες οι Κατηγορίες</option>
        <option value="APARTMENT">Διαμέρισμα</option>
        <option value="VILLA">Βίλα</option>
        <option value="STUDIO">Στούντιο</option>
        <option value="SUITE">Σουίτα</option>
        <option value="LOFT">Loft</option>
        <option value="PENTHOUSE">Ρετιρέ</option>
      </select>
      <input
        type="date"
        onChange={(e) => onFilter({ dateFrom: e.target.value })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', flex: '1 1 150px' }}
      />
      
      {/* New Filters */}
      <input
        type="number"
        min="1"
        placeholder="Δωμάτια+"
        onChange={(e) => onFilter({ rooms: e.target.value ? parseInt(e.target.value) : undefined })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' }}
      />
      <input
        type="number"
        min="1"
        placeholder="Κρεβάτια+"
        onChange={(e) => onFilter({ beds: e.target.value ? parseInt(e.target.value) : undefined })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' }}
      />
      <input
        type="number"
        min="1"
        placeholder="Μέγιστη Τιμή (€)"
        onChange={(e) => onFilter({ maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
        style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '130px' }}
      />
    </div>
  );
}
