import { select } from '@bridgeshop/postgres-query-builder';

export const getWidgetsBaseQuery = () => {
  const query = select().from('widget');

  return query;
};
