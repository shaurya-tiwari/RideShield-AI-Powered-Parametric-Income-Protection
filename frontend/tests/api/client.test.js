import client, { setAuthToken } from "../../src/api/client";

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

const rejected = client.interceptors.response.handlers[0].rejected;
const originalLocation = window.location;

function setLocation(pathname, search = "") {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      pathname,
      search,
      href: `${pathname}${search}`,
    },
  });
}

describe("API client auth redirects", () => {
  beforeEach(() => {
    setAuthToken(null);
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("does not redirect when a 401 happens on the auth page", async () => {
    setLocation("/auth", "?tab=admin");

    await expect(
      rejected({
        config: {},
        response: { status: 401, data: { detail: "Invalid credentials." } },
      }),
    ).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(window.location.href).toBe("/auth?tab=admin");
  });

  it("redirects to the session-expired page from other routes", async () => {
    setLocation("/dashboard");

    await expect(
      rejected({
        config: {},
        response: { status: 401, data: { detail: "Session expired." } },
      }),
    ).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(window.location.href).toBe("/auth?reason=session_expired");
  });

  it("sets and clears the default authorization header", () => {
    setAuthToken("session-token");
    expect(client.defaults.headers.common.Authorization).toBe("Bearer session-token");

    setAuthToken(null);
    expect(client.defaults.headers.common.Authorization).toBeUndefined();
  });
});
