import * as core from '@actions/core';
import { fail, getOptionalInput, getRequiredInput } from './lib/action-core';
import { setOutputs } from './lib/outputs';
import { appendJobSummary, escapeCell } from './lib/summary';
import { ConfigurationError } from './lib/errors';
import { parseEnum } from './lib/validation';

const SHA256 = /sha256:([a-f0-9]{64})/i;
const AT_SHA256 = /@sha256:([a-f0-9]{64})/i;

function normalizeDigest(raw: string): string {
  const s = String(raw ?? '').trim();
  const m1 = s.match(SHA256);
  if (m1) return m1[1]!.toLowerCase();
  const m2 = s.match(/^[a-f0-9]{64}$/i);
  if (m2) return s.toLowerCase();
  throw new ConfigurationError(`Invalid digest format: ${raw}`);
}

function parseDeployedDigest(deployedArtifact: string): string {
  const s = String(deployedArtifact ?? '').trim();
  const m = s.match(AT_SHA256) ?? s.match(SHA256);
  if (!m) {
    throw new ConfigurationError(
      'deployed-artifact must include a sha256 digest (expected @sha256:… or sha256:…).',
    );
  }
  return m[1]!.toLowerCase();
}

export async function run(): Promise<void> {
  const deployed = getRequiredInput('deployed-artifact');
  const approved = normalizeDigest(getRequiredInput('approved-artifact-digest'));
  const environment = getOptionalInput('environment');
  const mode = parseEnum('mode', getOptionalInput('mode') || 'enforce', ['observe', 'warn', 'enforce'] as const);

  const deployedDigest = parseDeployedDigest(deployed);
  const match = deployedDigest === approved;

  setOutputs({
    'deployed-digest': `sha256:${deployedDigest}`,
    'approved-digest': `sha256:${approved}`,
    match: match ? 'true' : 'false',
  });

  await appendJobSummary(
    [
      '## BridgedAI deployment guard',
      '',
      '| Field | Value |',
      '| --- | --- |',
      `| environment | ${escapeCell(environment)} |`,
      `| match | ${escapeCell(String(match))} |`,
      `| deployed | \`sha256:${escapeCell(deployedDigest)}\` |`,
      `| approved | \`sha256:${escapeCell(approved)}\` |`,
      '',
    ].join('\n'),
  );

  if (mode === 'observe') {
    return;
  }

  if (!match) {
    const msg = 'Deployed artifact digest does not match approved digest.';
    if (mode === 'warn') {
      core.warning(msg);
      return;
    }
    fail(msg);
  }
}

if (process.env.VITEST !== 'true') {
  void run().catch((e) => {
    fail(e instanceof Error ? e : new Error(String(e)));
  });
}
