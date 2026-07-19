import scrapy


class BettingPlatformItem(scrapy.Item):
    platform = scrapy.Field()
    source_url = scrapy.Field()
    title = scrapy.Field()
    content = scrapy.Field()
    rating = scrapy.Field()
    category = scrapy.Field()
    collected_at = scrapy.Field()
