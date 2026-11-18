import { describe, expect, test } from 'bun:test';
import { readSearchTerm, searchUrlFor } from '../src/lib/searchUrl.js';

describe('searchUrl', () => {
  test('reads the q parameter from a search string', () => {
    expect(readSearchTerm('?q=pop!_os')).toBe('pop!_os');
    expect(readSearchTerm('?family=Arch&q=fedora')).toBe('fedora');
    expect(readSearchTerm('?family=Arch')).toBe('');
    expect(readSearchTerm('')).toBe('');
  });

  test('builds a shareable url with an encoded search term', () => {
    expect(searchUrlFor('Pop!_OS')).toBe('/directory/?q=Pop%21_OS');
    expect(searchUrlFor('c++')).toBe('/directory/?q=c%2B%2B');
  });

  test('drops the query when the search is cleared', () => {
    expect(searchUrlFor('', '/directory/', '#results')).toBe('/directory/#results');
  });
});
