import { fireEvent, render, screen } from "@testing-library/react";

import ErrorState from "../../src/components/ErrorState";

describe("ErrorState", () => {
  it("renders the default fallback copy when no message is provided", () => {
    render(<ErrorState />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
  });

  it("renders a custom message and calls retry when provided", () => {
    const onRetry = vi.fn();

    render(<ErrorState message="Worker geography could not be loaded." onRetry={onRetry} />);

    expect(screen.getByText("Worker geography could not be loaded.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
