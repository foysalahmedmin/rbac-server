import { AsyncLocalStorage } from 'async_hooks';

export const userStorage = new AsyncLocalStorage<{ id: number }>();
