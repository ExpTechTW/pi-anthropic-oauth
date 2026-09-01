import test from "node:test";
import assert from "node:assert/strict";
import { buildThinkingParams } from "../.test-dist/stream.js";

const adaptive = {
  id: "claude-opus-5",
  reasoning: true,
  maxTokens: 128000,
  thinkingLevelMap: { xhigh: "xhigh", max: "max" },
  compat: { forceAdaptiveThinking: true },
};
const legacy = { id: "claude-haiku-4-5", reasoning: true, maxTokens: 64000 };

test("adaptive models send effort, not budget_tokens", () => {
  const p = buildThinkingParams(adaptive, "max", undefined, 42000);
  assert.deepEqual(p.thinking, { type: "adaptive", display: "summarized" });
  assert.deepEqual(p.output_config, { effort: "max" });
});

test("adaptive falls back to high for unmapped levels", () => {
  assert.deepEqual(buildThinkingParams(adaptive, "high", undefined, 42000).output_config, {
    effort: "high",
  });
  assert.deepEqual(buildThinkingParams(adaptive, "low", undefined, 42000).output_config, {
    effort: "low",
  });
});

test("legacy models keep budget_tokens and honour custom budgets", () => {
  assert.deepEqual(buildThinkingParams(legacy, "high", undefined, 42000).thinking, {
    type: "enabled",
    budget_tokens: 20480,
  });
  assert.deepEqual(buildThinkingParams(legacy, "max", { max: 50000 }, 42000).thinking, {
    type: "enabled",
    budget_tokens: 41999,
  });
});

test("levels mapped to null send nothing", () => {
  const off = { id: "x", reasoning: true, maxTokens: 1000, thinkingLevelMap: { low: null } };
  assert.deepEqual(buildThinkingParams(off, "low", undefined, 900), {});
});
