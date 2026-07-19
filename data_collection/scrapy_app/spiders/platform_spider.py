"""
मराठी टिप्पणी: हा Scrapy spider सार्वजनिक/परवानगी असलेल्या betting intelligence pages मधून structured reviews, complaints आणि news items गोळा करतो.
"""

from datetime import datetime, timezone
from urllib.parse import urljoin

import scrapy

from data_collection.scrapy_app.items import BettingPlatformItem


class PlatformSpider(scrapy.Spider):
    name = "platform_reviews"
    custom_settings = {
        "DOWNLOAD_DELAY": 1,
        "RETRY_TIMES": 3,
        "FEEDS": {"exports/platform_reviews.json": {"format": "json", "encoding": "utf8"}},
        "USER_AGENT": "BettingIntelligenceResearchBot/0.1 (+compliance@example.com)",
    }
    platform_urls = {
        "melbet": "https://example.com/melbet",
        "10cric": "https://example.com/10cric",
        "22xbet": "https://example.com/22xbet",
        "22crick": "https://example.com/22crick",
        "stake": "https://example.com/stake",
        "mostbet": "https://example.com/mostbet",
        "parimatch": "https://example.com/parimatch",
    }

    def start_requests(self):
        for platform, url in self.platform_urls.items():
            yield scrapy.Request(url, cb_kwargs={"platform": platform})

    def parse(self, response, platform: str):
        for card in response.css("article, .review, .complaint, .news-item"):
            yield BettingPlatformItem(
                platform=platform,
                source_url=response.url,
                title=" ".join(card.css("h1::text,h2::text,h3::text,.title::text").getall()).strip(),
                content=" ".join(card.css("p::text,.content::text,.body::text").getall()).strip(),
                rating=card.css("[data-rating]::attr(data-rating), .rating::text").get(),
                category=card.css(".category::text").get(default="review"),
                collected_at=datetime.now(timezone.utc).isoformat(),
            )
        next_page = response.css("a[rel='next']::attr(href), a.next::attr(href)").get()
        if next_page:
            yield response.follow(urljoin(response.url, next_page), callback=self.parse, cb_kwargs={"platform": platform})
