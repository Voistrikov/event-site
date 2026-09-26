# Recommendation dataset

Place the e-class CSV directory at:

```text
backend/dataset/rel_event_csvs/
```

The recommendation evaluation uses `event_interest.csv`, whose fields are
`user,event,invited,timestamp,interested,not_interested`.

Signal mapping:

- `interested = 1` -> rating `5` (strong positive signal)
- `not_interested = 1` -> rating `1` (negative signal)
- neither flag -> rating `2` (weak view/neutral signal)

Run the reproducible leave-one-out evaluation with:

```bash
cd backend
npm run dataset:evaluate
```

The remaining CSVs contain anonymized 2012 event attributes, attendance and
social links. They are intentionally not imported into the application
database: they have no event titles and their dates are expired. Runtime
recommendations use the application's current bookings and recorded views.
