// filename: e2e/workspace.spec.ts
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("development-test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/(onboarding|app)(\/|$)/);
}
async function createOrganization(page: Page, name: string) {
  await page.goto("/onboarding");
  await page.getByLabel("Organization name", { exact: true }).fill(name);
  await page
    .getByRole("button", { name: "Create organization", exact: true })
    .click();
  await expect(page).toHaveURL(/\/app\/[0-9a-f-]+$/);
  return new URL(page.url()).pathname;
}
test("onboarding, organization switching, projects and invitation acceptance", async ({
  page,
  browser,
}, info) => {
  await login(page, "owner@example.test");
  const name = `Studio ${info.project.name}`;
  const base = await createOrganization(page, name);
  await expect(
    page.getByRole("heading", { name: "A clear view of what’s moving." }),
  ).toBeVisible();
  await page.goto(`${base}/projects`);
  await page.getByRole("button", { name: "New project", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Project name", { exact: true })
    .fill("Shared launch");
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("A real organization-scoped project.");
  await dialog
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Saved successfully.");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Edit Shared launch", exact: true })
    .click();
  await dialog
    .getByLabel("Project name", { exact: true })
    .fill("Shared launch revised");
  await dialog
    .getByRole("button", { name: "Save project", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Saved successfully.");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByLabel("Search projects", { exact: true })
    .fill("nothing-matches");
  await expect(page.getByText("No projects match your search.")).toBeVisible();
  await page.getByLabel("Search projects", { exact: true }).fill("");
  const row = page
    .getByRole("row")
    .filter({ hasText: "Shared launch revised" });
  await row.getByRole("button", { name: "Archive", exact: true }).click();
  await row.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(row.getByText("archived", { exact: true })).toBeVisible();
  const second = await createOrganization(page, `Second ${info.project.name}`);
  expect(second).not.toBe(base);
  await page.locator("summary").click();
  await page
    .getByRole("navigation", { name: "Switch organization" })
    .getByRole("link", { name, exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`${base}$`));
  await page.goto(`${base}/team`);
  await page
    .getByLabel("Invitation email", { exact: true })
    .fill("member@example.test");
  await page
    .getByRole("button", { name: "Invite teammate", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Invitation created");
  await page.goto(`${base}/outbox`);
  await page
    .getByRole("link", { name: "Review invitation", exact: true })
    .first()
    .click();
  const inviteUrl = await page
    .getByRole("link", { name: "Open invitation", exact: true })
    .getAttribute("href");
  expect(inviteUrl).toContain("/invite/");
  const memberContext = await browser.newContext({
    viewport:
      info.project.name === "mobile"
        ? { width: 390, height: 844 }
        : { width: 1280, height: 800 },
  });
  const member = await memberContext.newPage();
  await login(member, "member@example.test");
  await member.goto(inviteUrl!);
  await member
    .getByRole("button", { name: "Accept invitation", exact: true })
    .click();
  await expect(member).toHaveURL(new RegExp(`${base}$`));
  await member.goto(`${base}/team`);
  await expect(
    member.getByText("member@example.test", { exact: true }),
  ).toBeVisible();
  await expect(
    member.getByRole("button", { name: "Invite teammate" }),
  ).toHaveCount(0);
  await member.goto(`${second}/projects`);
  await expect(
    member.getByText("You do not belong to this organization."),
  ).toBeVisible();
  await member.goto(inviteUrl!);
  await member
    .getByRole("button", { name: "Continue to organization", exact: true })
    .click();
  await expect(member).toHaveURL(new RegExp(`${base}$`));
  await page.goto(`${base}/billing`);
  await expect(page.getByRole("status")).toContainText("Demonstration billing");
  await page
    .getByRole("button", { name: "Use Team demonstration plan", exact: true })
    .click();
  await expect(page.getByText("Provider: demo", { exact: true })).toBeVisible();
  await page.goto(base);
  await expect(page.getByText("Team", { exact: true }).last()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.locator(".recharts-bar-rectangle path").last(),
  ).toBeVisible();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: /Use (light|dark) theme/ }).click();
  await page.evaluate(async () => {
    await Promise.allSettled(
      document.getAnimations().map((animation) => animation.finished),
    );
  });
  const alternateTheme = await new AxeBuilder({ page }).analyze();
  expect(
    alternateTheme.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
  await memberContext.close();
});
test("unauthenticated private access, public pages and light/dark themes", async ({
  page,
  request,
}) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/pricing");
  await expect(
    page.getByRole("heading", { name: "Start small. Grow thoughtfully." }),
  ).toBeVisible();
  const toggle = page.getByRole("button", { name: /Use (light|dark) theme/ });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    /light|dark/,
  );
  const invalid = await request.post("/api/auth/session", {
    headers: { Origin: "https://attacker.invalid" },
    data: { idToken: "invalid" },
  });
  expect(invalid.status()).toBe(403);
});
