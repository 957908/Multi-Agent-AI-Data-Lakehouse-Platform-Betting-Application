"""
मराठी टिप्पणी: हा async Kafka producer आहे. Scraper किंवा backend events JSON मध्ये serialize करून Kafka topic वर publish करतो.
"""

import json
from collections.abc import Mapping

from aiokafka import AIOKafkaProducer


class EventProducer:
    def __init__(self, bootstrap_servers: str) -> None:
        self._producer = AIOKafkaProducer(bootstrap_servers=bootstrap_servers)

    async def start(self) -> None:
        await self._producer.start()

    async def stop(self) -> None:
        await self._producer.stop()

    async def send(self, topic: str, event: Mapping) -> None:
        await self._producer.send_and_wait(topic, json.dumps(event, default=str).encode())
