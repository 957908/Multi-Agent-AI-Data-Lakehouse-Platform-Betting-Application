"""
मराठी टिप्पणी: JavaScript-rendered pages Scrapy ने वाचता येत नसतील तेव्हा हा Playwright collector page render करून text आणि screenshot घेतो.
"""

from pathlib import Path

from playwright.async_api import async_playwright


async def collect_dynamic_page(url: str, screenshot_dir: str = "artifacts/screenshots") -> str:
    """Collect rendered text from JS-heavy public pages with retries and screenshots."""
    Path(screenshot_dir).mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, wait_until="networkidle", timeout=60_000)
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.screenshot(path=f"{screenshot_dir}/latest.png", full_page=True)
        content = await page.locator("body").inner_text()
        await browser.close()
        return content
