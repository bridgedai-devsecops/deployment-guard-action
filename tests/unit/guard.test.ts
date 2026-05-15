import { describe, expect, it, vi } from 'vitest';
import * as core from '@actions/core';
import { run } from '../../src/index';

describe('deployment-guard-action', () => {
  it('matches digests', async () => {
    const d = 'a'.repeat(64);
    vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    vi.spyOn(core, 'getInput').mockImplementation((name: string) => {
      const m: Record<string, string> = {
        'deployed-artifact': `image@sha256:${d}`,
        'approved-artifact-digest': `sha256:${d}`,
        environment: 'prod',
        mode: 'enforce',
      };
      return m[name] ?? '';
    });
    await expect(run()).resolves.toBeUndefined();
  });
});
