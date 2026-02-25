import { select } from '@bridgeshop/postgres-query-builder';

export const getAttributeGroupsBaseQuery = () =>
  select().from('attribute_group');
