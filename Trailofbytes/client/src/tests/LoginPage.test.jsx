import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";

describe("LoginPage", () => {
  it("renders form fields", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Team Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Team Code/i)).toBeInTheDocument();
  });
});

