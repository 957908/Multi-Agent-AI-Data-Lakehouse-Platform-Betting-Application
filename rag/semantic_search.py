"""
मराठी टिप्पणी: हे RAG/semantic search module आहे. Sentence Transformers embeddings तयार करून FAISS index मधून top-k relevant text शोधते.
"""

from dataclasses import dataclass

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


@dataclass
class SearchResult:
    text: str
    score: float


class SemanticIndex:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> None:
        self.model = SentenceTransformer(model_name)
        self.texts: list[str] = []
        self.index: faiss.IndexFlatIP | None = None

    def build(self, texts: list[str]) -> None:
        self.texts = texts
        embeddings = self.model.encode(texts, normalize_embeddings=True).astype(np.float32)
        self.index = faiss.IndexFlatIP(embeddings.shape[1])
        self.index.add(embeddings)

    def search(self, query: str, top_k: int = 5) -> list[SearchResult]:
        if self.index is None:
            return []
        query_vector = self.model.encode([query], normalize_embeddings=True).astype(np.float32)
        scores, ids = self.index.search(query_vector, top_k)
        return [SearchResult(self.texts[i], float(score)) for score, i in zip(scores[0], ids[0]) if i >= 0]
