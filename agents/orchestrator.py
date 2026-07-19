"""
मराठी टिप्पणी: हा multi-agent orchestrator आहे. Scraper, Validator, Analyzer, RAG आणि Report agents सारखे async agents क्रमाने चालवतो.
"""

from dataclasses import dataclass
from typing import Protocol


class Agent(Protocol):
    name: str

    async def run(self, message: dict) -> dict: ...


@dataclass
class AgentOrchestrator:
    agents: list[Agent]

    async def execute(self, message: dict) -> dict:
        state = message
        for agent in self.agents:
            state = await agent.run(state)
        return state
