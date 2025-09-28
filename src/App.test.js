import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Cure8 workspace", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /curate what matters most today/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/paste a url to add/i)).toBeInTheDocument();
});
