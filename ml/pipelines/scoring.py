"""
मराठी टिप्पणी: ही ML scoring pipeline आहे. Random Forest trust score, Isolation Forest anomaly detection आणि KMeans segmentation साठी baseline models train करते.
"""

from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.cluster import KMeans


@dataclass
class ScoreModels:
    trust_model: RandomForestRegressor
    anomaly_model: IsolationForest
    segment_model: KMeans


def train_baseline_models(features: np.ndarray, labels: np.ndarray) -> ScoreModels:
    trust_model = RandomForestRegressor(n_estimators=100, random_state=42).fit(features, labels)
    anomaly_model = IsolationForest(random_state=42, contamination="auto").fit(features)
    segment_model = KMeans(n_clusters=min(3, len(features)), n_init="auto", random_state=42).fit(features)
    return ScoreModels(trust_model, anomaly_model, segment_model)
