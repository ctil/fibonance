import { describe, it, expect } from "bun:test";
import { rebalance } from "./rebalance";
import { join } from "path";
import type { Config } from "./types";

const portfoliosDir = join(import.meta.dir, "tests/portfolios");

const simpleConfig: Config = {
    stocks: [
        { symbol: "VTI", targetPercentage: 71 },
        { symbol: "VXUS", targetPercentage: 18 },
        { symbol: "BND", targetPercentage: 11 },
    ],
};

const singleSymbolConfig: Config = {
    stocks: [{ symbol: "VTI", targetPercentage: 100 }],
};

function csv(name: string) {
    return Bun.file(join(portfoliosDir, name)).text();
}

describe("rebalance", () => {
    it("Portfolio at target allocation should have zero drift", async () => {
        const result = rebalance(simpleConfig, await csv("balanced.csv"), 0);

        expect(result.total).toBe(10000000);

        expect(result.symbols["VTI"].amount).toBe(7100000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(71.0, 3);
        expect(result.symbols["VTI"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(0);

        expect(result.symbols["VXUS"].amount).toBe(1800000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(18.0, 3);
        expect(result.symbols["VXUS"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(0);

        expect(result.symbols["BND"].amount).toBe(1100000);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(11.0, 3);
        expect(result.symbols["BND"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(0);
    });

    it("Balanced portfolio with $10k deposit should allocate proportionally", async () => {
        const result = rebalance(
            simpleConfig,
            await csv("balanced.csv"),
            1000000,
        );

        expect(result.total).toBe(11000000);

        expect(result.symbols["VTI"].amount).toBe(7100000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(
            64.545454545,
            3,
        );
        expect(result.symbols["VTI"].drift).toBeCloseTo(-6.454545455, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(710000);

        expect(result.symbols["VXUS"].amount).toBe(1800000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(
            16.363636364,
            3,
        );
        expect(result.symbols["VXUS"].drift).toBeCloseTo(-1.636363636, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(180000);

        expect(result.symbols["BND"].amount).toBe(1100000);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(10.0, 3);
        expect(result.symbols["BND"].drift).toBeCloseTo(-1.0, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(110000);
    });

    it("Extra symbol in CSV (AAPL) should be ignored, only track configured symbols", async () => {
        const result = rebalance(
            simpleConfig,
            await csv("extra_symbol.csv"),
            0,
        );

        expect(result.total).toBe(10000000);

        expect(result.symbols["VTI"].amount).toBe(7100000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(71.0, 3);
        expect(result.symbols["VTI"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(0);

        expect(result.symbols["VXUS"].amount).toBe(1800000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(18.0, 3);
        expect(result.symbols["VXUS"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(0);

        expect(result.symbols["BND"].amount).toBe(1100000);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(11.0, 3);
        expect(result.symbols["BND"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(0);
    });

    it("Portfolio heavily skewed with VTI at 95%", async () => {
        const result = rebalance(
            simpleConfig,
            await csv("heavily_skewed.csv"),
            0,
        );

        expect(result.total).toBe(10000000);

        expect(result.symbols["VTI"].amount).toBe(9500000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(95.0, 3);
        expect(result.symbols["VTI"].drift).toBeCloseTo(24.0, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(-2400000);

        expect(result.symbols["VXUS"].amount).toBe(300000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(3.0, 3);
        expect(result.symbols["VXUS"].drift).toBeCloseTo(-15.0, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(1500000);

        expect(result.symbols["BND"].amount).toBe(200000);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(2.0, 3);
        expect(result.symbols["BND"].drift).toBeCloseTo(-9.0, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(900000);
    });

    it("Small portfolio with large $50k deposit", async () => {
        const result = rebalance(simpleConfig, await csv("small.csv"), 5000000);

        expect(result.total).toBe(5010000);

        expect(result.symbols["VTI"].amount).toBe(7100);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(
            0.141716567,
            3,
        );
        expect(result.symbols["VTI"].drift).toBeCloseTo(-70.858283433, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(3550000);

        expect(result.symbols["VXUS"].amount).toBe(1800);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(
            0.035928144,
            3,
        );
        expect(result.symbols["VXUS"].drift).toBeCloseTo(-17.964071856, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(900000);

        expect(result.symbols["BND"].amount).toBe(1100);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(
            0.021956088,
            3,
        );
        expect(result.symbols["BND"].drift).toBeCloseTo(-10.978043912, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(550000);
    });

    it("Non-round dollar amounts test calculation precision", async () => {
        const result = rebalance(simpleConfig, await csv("rounding.csv"), 0);

        expect(result.total).toBe(3333333);

        expect(result.symbols["VTI"].amount).toBe(2366667);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(
            71.00001,
            3,
        );
        expect(result.symbols["VTI"].drift).toBeCloseTo(0.00001, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(-1);

        expect(result.symbols["VXUS"].amount).toBe(600000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(18.0, 3);
        expect(result.symbols["VXUS"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(0);

        expect(result.symbols["BND"].amount).toBe(366666);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(
            10.99998,
            3,
        );
        expect(result.symbols["BND"].drift).toBeCloseTo(-0.00002, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(1);
    });

    it("Symbol in config (BND) not present in CSV should show 0% current", async () => {
        const result = rebalance(
            simpleConfig,
            await csv("missing_symbol.csv"),
            0,
        );

        expect(result.total).toBe(10000000);

        expect(result.symbols["VTI"].amount).toBe(8900000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(89.0, 3);
        expect(result.symbols["VTI"].drift).toBeCloseTo(18.0, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(-1800000);

        expect(result.symbols["VXUS"].amount).toBe(1100000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(11.0, 3);
        expect(result.symbols["VXUS"].drift).toBeCloseTo(-7.0, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(700000);

        expect(result.symbols["BND"].amount).toBe(0);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(0.0, 3);
        expect(result.symbols["BND"].drift).toBeCloseTo(-11.0, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(1100000);
    });

    it("Very small $100 portfolio tests cent-level precision", async () => {
        const result = rebalance(simpleConfig, await csv("small.csv"), 0);

        expect(result.total).toBe(10000);

        expect(result.symbols["VTI"].amount).toBe(7100);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(71.0, 3);
        expect(result.symbols["VTI"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(0);

        expect(result.symbols["VXUS"].amount).toBe(1800);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(18.0, 3);
        expect(result.symbols["VXUS"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(0);

        expect(result.symbols["BND"].amount).toBe(1100);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(11.0, 3);
        expect(result.symbols["BND"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(0);
    });

    it("Config with single symbol (100% VTI) should have zero drift", async () => {
        const result = rebalance(
            singleSymbolConfig,
            await csv("single_symbol.csv"),
            0,
        );

        expect(result.total).toBe(1000000);

        expect(result.symbols["VTI"].amount).toBe(1000000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(100.0, 3);
        expect(result.symbols["VTI"].drift).toBeCloseTo(0.0, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(0);
    });

    it("Portfolio with VTI overweight (80%), others underweight", async () => {
        const result = rebalance(simpleConfig, await csv("unbalanced.csv"), 0);

        expect(result.total).toBe(10000000);

        expect(result.symbols["VTI"].amount).toBe(8000000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(80.0, 3);
        expect(result.symbols["VTI"].drift).toBeCloseTo(9.0, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(-900000);

        expect(result.symbols["VXUS"].amount).toBe(1200000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(12.0, 3);
        expect(result.symbols["VXUS"].drift).toBeCloseTo(-6.0, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(600000);

        expect(result.symbols["BND"].amount).toBe(800000);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(8.0, 3);
        expect(result.symbols["BND"].drift).toBeCloseTo(-3.0, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(300000);
    });

    it("Unbalanced portfolio with $10k deposit", async () => {
        const result = rebalance(
            simpleConfig,
            await csv("unbalanced.csv"),
            1000000,
        );

        expect(result.total).toBe(11000000);

        expect(result.symbols["VTI"].amount).toBe(8000000);
        expect(result.symbols["VTI"].currentPercentage).toBeCloseTo(
            72.727272727,
            3,
        );
        expect(result.symbols["VTI"].drift).toBeCloseTo(1.727272727, 3);
        expect(result.symbols["VTI"].amountNeeded).toBe(-190000);

        expect(result.symbols["VXUS"].amount).toBe(1200000);
        expect(result.symbols["VXUS"].currentPercentage).toBeCloseTo(
            10.909090909,
            3,
        );
        expect(result.symbols["VXUS"].drift).toBeCloseTo(-7.090909091, 3);
        expect(result.symbols["VXUS"].amountNeeded).toBe(780000);

        expect(result.symbols["BND"].amount).toBe(800000);
        expect(result.symbols["BND"].currentPercentage).toBeCloseTo(
            7.272727273,
            3,
        );
        expect(result.symbols["BND"].drift).toBeCloseTo(-3.727272727, 3);
        expect(result.symbols["BND"].amountNeeded).toBe(410000);
    });
});
