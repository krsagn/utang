import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../lib/utils.js';

describe('escapeHtml', () => {
  it('should return the string unchanged if no special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('should escape &', () => {
    expect(escapeHtml('fish & chips')).toBe('fish &amp; chips');
  });

  it('should escape <', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('should escape >', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('should escape "', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it("should escape '", () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('should escape multiple special characters', () => {
    expect(escapeHtml('<b class="bold">it\'s a & test</b>')).toBe(
      '&lt;b class=&quot;bold&quot;&gt;it&#39;s a &amp; test&lt;/b&gt;'
    );
  });
});
