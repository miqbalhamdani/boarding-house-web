import { describe, it, expect } from "vitest";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  getRole,
  setAuthCookies,
} from "./cookies";

describe("auth cookies", () => {
  it("stores and reads owner tokens", () => {
    setAuthCookies("owner", { access_token: "a1", refresh_token: "r1" });
    expect(getAccessToken("owner")).toBe("a1");
    expect(getRefreshToken("owner")).toBe("r1");
    expect(getRole()).toBe("owner");
  });

  it("keeps owner and tenant tokens separate", () => {
    setAuthCookies("owner", { access_token: "oa", refresh_token: "or" });
    setAuthCookies("tenant", { access_token: "ta", refresh_token: "tr" });
    expect(getAccessToken("owner")).toBe("oa");
    expect(getAccessToken("tenant")).toBe("ta");
  });

  it("clears tokens for a role", () => {
    setAuthCookies("owner", { access_token: "a1", refresh_token: "r1" });
    clearAuthCookies("owner");
    expect(getAccessToken("owner")).toBeUndefined();
    expect(getRefreshToken("owner")).toBeUndefined();
  });
});
