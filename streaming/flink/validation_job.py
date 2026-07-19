"""
मराठी टिप्पणी: हा Flink stream-processing job boundary आहे. Production मध्ये raw Kafka events validate, deduplicate, enrich करून clean/DLQ topics कडे पाठवले जातील.
"""

from pyflink.datastream import StreamExecutionEnvironment


def build_validation_job() -> StreamExecutionEnvironment:
    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_parallelism(2)
    # Production wiring reads Kafka raw events, validates, deduplicates, enriches, and writes clean/DLQ topics.
    return env
