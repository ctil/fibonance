import { describe, it, expect } from "bun:test";
import { rebalanceCalc } from "./rebalance";
import { parseConfig } from "./config";
import { readdirSync } from "fs";
import { join } from "path";

interface TestExpectedSymbol {
  amount: number;
  currentPercentage: number;
  drift: number;
  amountNeeded: number;
}

interface TestDefinition {
  name: string;
  description: string;
  command: string;
  configFile: string;
  input: {
    csvFile: string;
    depositAmount: number;
  };
  expected: {
    total: number;
    symbols: Record<string, TestExpectedSymbol>;
  };
  tolerance: number;
}

const testsDir = join(import.meta.dir, "../../../tests");
const definitionsDir = join(testsDir, "definitions");

const testFiles = readdirSync(definitionsDir).filter((f) => f.endsWith(".json"));

describe("rebalance", () => {
  for (const testFile of testFiles) {
    const testPath = join(definitionsDir, testFile);
    const testDef: TestDefinition = require(testPath);

    if (testDef.command !== "rebalance") {
      continue;
    }

    it(testDef.description, async () => {
      const configPath = join(testsDir, testDef.configFile);
      const csvPath = join(testsDir, testDef.input.csvFile);

      const configContent = await Bun.file(configPath).text();
      const csvContent = await Bun.file(csvPath).text();

      const config = parseConfig(configContent);
      const result = rebalanceCalc(
        config,
        csvContent,
        testDef.input.depositAmount
      );

      // Check total
      expect(result.total).toBe(testDef.expected.total);

      // Check each symbol
      for (const [symbol, expected] of Object.entries(testDef.expected.symbols)) {
        const actual = result.symbols[symbol];
        expect(actual).toBeDefined();

        expect(actual.amount).toBe(expected.amount);

        expect(actual.currentPercentage).toBeCloseTo(
          expected.currentPercentage,
          3
        );

        expect(actual.drift).toBeCloseTo(expected.drift, 3);

        expect(actual.amountNeeded).toBe(expected.amountNeeded);
      }
    });
  }
});
