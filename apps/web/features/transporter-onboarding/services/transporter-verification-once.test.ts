/** @jest-environment jsdom */

import {
  hasSeenTransporterVerifiedView,
  markTransporterVerifiedViewSeen,
} from "./transporter-verification-once";

describe("transporter verification once helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns false before the verified confirmation is shown", () => {
    expect(hasSeenTransporterVerifiedView("acc_123")).toBe(false);
  });

  it("persists the verified confirmation per user", () => {
    markTransporterVerifiedViewSeen("acc_123");

    expect(hasSeenTransporterVerifiedView("acc_123")).toBe(true);
    expect(hasSeenTransporterVerifiedView("acc_456")).toBe(false);
  });
});
