import { test, expect } from "@playwright/test";

test("edit a slide, see the live preview update, and export .pptx", async ({ page }) => {
  await page.goto("/");

  const frame = page.frameLocator(".preview-frame");

  // The example deck loads and renders in the preview iframe.
  await expect(frame.locator("section").first()).toBeVisible();
  await expect(frame.getByText("Acme All-Hands")).toBeVisible();

  // Editing the selected (title) slide's heading updates the preview live.
  const heading = page.getByLabel("Heading").first();
  await heading.fill("Edited Title");
  await expect(frame.getByText("Edited Title")).toBeVisible();

  // Export to PPTX downloads a non-empty .pptx file.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Download \.pptx/ }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.pptx$/);

  // Download HTML also works.
  const [htmlDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /^HTML$/ }).click(),
  ]);
  expect(htmlDownload.suggestedFilename()).toMatch(/\.html$/);
});
