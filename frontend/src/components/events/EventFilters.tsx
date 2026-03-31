interface EventFiltersProps {
  onFilter: (filters: { category?: string; search?: string; dateFrom?: string }) => void;
}

export default function EventFilters({ onFilter }: EventFiltersProps) {
  return (
    <div className="event-filters">
      <input
        placeholder="Search..."
        onChange={(e) => onFilter({ search: e.target.value })}
      />
      <input
        placeholder="Category"
        onChange={(e) => onFilter({ category: e.target.value })}
      />
      <input
        type="date"
        onChange={(e) => onFilter({ dateFrom: e.target.value })}
      />
    </div>
  );
}
