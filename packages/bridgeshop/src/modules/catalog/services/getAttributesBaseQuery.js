import { select } from '@bridgeshop/postgres-query-builder';

export const getAttributesBaseQuery = () => select().from('attribute');
