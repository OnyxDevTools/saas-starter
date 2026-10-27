// @vitest-environment jsdom
// filename: components/saas/action-form.test.tsx
import "@testing-library/jest-dom/vitest";
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
vi.mock("@/modules/actions", () => ({ mutate: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
import { mutate } from "@/modules/actions";
import { NameForm } from "./action-form";
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("validates accessible form inputs before invoking a server action", async () => {
  vi.mocked(mutate).mockResolvedValue({ ok: true });
  render(
    <NameForm
      operation="project.create"
      organizationId="org"
      label="Project name"
      description
      button="Create project"
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Create project" }));
  expect(await screen.findByText("Use at least two characters.")).toBeVisible();
  expect(mutate).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Project name"), {
    target: { value: "New project" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create project" }));
  await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Saved successfully.",
  );
});
it("preserves values and shows safe server feedback on failure", async () => {
  vi.mocked(mutate).mockResolvedValue({
    ok: false,
    error: "The plan has no available projects.",
  });
  render(
    <NameForm
      operation="project.create"
      organizationId="org"
      initialName="Keep my input"
      button="Create project"
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Create project" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "no available projects",
  );
  expect(screen.getByLabelText("Name")).toHaveValue("Keep my input");
});
