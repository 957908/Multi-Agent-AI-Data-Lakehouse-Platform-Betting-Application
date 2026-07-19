# प्रकल्पाचे मराठी स्पष्टीकरण

## प्रकल्प काय करतो?

हा प्रकल्प **बेटिंग साइट डेटा इंटेलिजन्ससाठी Multi-Agent AI Data Lakehouse Platform** तयार करतो. विविध सार्वजनिक स्रोतांमधून बेटिंग प्लॅटफॉर्मविषयी रिव्ह्यू, तक्रारी, बातम्या, पेमेंट माहिती आणि जोखीम संकेत गोळा करून ते डेटा पाइपलाइनमध्ये पाठवले जातात. त्यानंतर डेटा स्वच्छ केला जातो, Lakehouse मध्ये साठवला जातो, ML मॉडेल्सद्वारे Trust Score आणि Risk Score तयार केले जातात, RAG/Vector Search द्वारे प्रश्नांची उत्तरे दिली जातात आणि Dashboard वर विश्लेषण दाखवले जाते.

## मुख्य मॉड्यूल्स आणि त्यांचे काम

### 1. Backend API

`backend/app` मधील FastAPI अॅप्लिकेशन क्लायंटसाठी REST API पुरवते. Controller, Service आणि Repository अशा Clean Architecture थरांमध्ये जबाबदाऱ्या विभागल्या आहेत.

- Controller HTTP request/response हाताळतो.
- Service business logic चालवतो.
- Repository डेटा persistence boundary पुरवतो.
- Schemas Pydantic v2 validation करतात.
- Security module password hashing आणि JWT token तयार करतो.

### 2. Database

`backend/app/db/schema.sql` PostgreSQL schema तयार करते. यात platforms, reviews, complaints, news, payment_methods, transactions, embeddings, agents, users, logs, reports, analytics, trust_scores, risk_scores आणि platform_statistics tables आहेत. `pgvector` extension semantic embeddings साठवण्यासाठी वापरली जाते.

### 3. Frontend Dashboard

`frontend/src` मधील React + TypeScript + Vite dashboard user ला platform analytics, risk dashboard, agent dashboard आणि charts दाखवण्यासाठी UI foundation देते. TailwindCSS dark responsive layout साठी वापरले आहे.

### 4. Scrapy Data Collection

`data_collection/scrapy_app` सार्वजनिक आणि परवानगी असलेल्या स्रोतांमधून structured betting intelligence items गोळा करण्यासाठी आहे. Spider pagination, retries, user-agent आणि JSON export support करतो. Site-specific selectors पुढील milestone मध्ये जोडता येतील.

### 5. Playwright Dynamic Collection

`data_collection/playwright` JavaScript-rendered pages साठी आहे. हे page load करते, scroll करते, screenshot घेतो आणि rendered text extract करते. Scrapy पुरेसे नसल्यासच Playwright वापरायचा आहे.

### 6. Kafka Streaming

`streaming/kafka` raw, clean, retry आणि dead-letter topics साठी constants आणि async producer देतो. Scrapers आणि backend events Kafka मध्ये publish करू शकतात.

### 7. Flink Stream Processing

`streaming/flink` validation, deduplication, enrichment आणि clean/DLQ routing साठी job boundary देतो. Production मध्ये Kafka source/sink जोडले जातील.

### 8. Lakehouse Infrastructure

`docker-compose.yml` PostgreSQL/pgvector, Kafka, MinIO, Nessie, Prometheus आणि Grafana services उभे करते. MinIO object storage, Iceberg tables आणि Nessie catalog साठी foundation आहे.

### 9. Machine Learning

`ml/pipelines/scoring.py` Random Forest, Isolation Forest आणि KMeans वापरून trust scoring, anomaly detection आणि platform segmentation करण्याची baseline pipeline देते.

### 10. RAG आणि Vector Search

`rag/semantic_search.py` Sentence Transformers embeddings आणि FAISS index वापरून semantic search करतो. पुढे LangChain/Ollama/LLM RetrievalQA chain यावर जोडता येईल.

### 11. Multi-Agent AI

`agents/orchestrator.py` async agents sequence मध्ये चालवतो. Scraper Agent, Validator Agent, Analyzer Agent, Anomaly Detector, RAG Agent आणि Report Generator हे समान protocol follow करून जोडता येतात.

### 12. Monitoring

`monitoring/prometheus/prometheus.yml` metrics scraping foundation देते. Grafana dashboard production monitoring साठी compose मध्ये उपलब्ध आहे.

### 13. Tests

`tests` मध्ये API आणि service tests आहेत. Dependencies install केल्यानंतर pytest चालवून basic behavior verify करता येतो.

## डेटा फ्लो

1. Scrapy/Playwright सार्वजनिक स्रोतांमधून डेटा गोळा करतात.
2. Kafka raw events स्वीकारतो.
3. Flink data clean, validate, deduplicate आणि enrich करतो.
4. Lakehouse मध्ये bronze/silver/gold zones तयार होतात.
5. Spark batch jobs aggregation आणि feature engineering करतात.
6. ML models trust/risk/anomaly scores तयार करतात.
7. RAG semantic search वापरून explainable answers देते.
8. Agents modules orchestration करून reports तयार करतात.
9. Backend API dashboard ला data पुरवते.
10. Frontend charts आणि analytics user ला दाखवते.

## महत्वाचे आर्किटेक्चरल निर्णय

- Clean Architecture वापरली आहे, कारण business logic framework आणि database पासून स्वतंत्र राहते.
- Async FastAPI वापरले आहे, कारण streaming/data-heavy workloads मध्ये concurrency आवश्यक आहे.
- Repository Pattern वापरले आहे, त्यामुळे in-memory, PostgreSQL किंवा Lakehouse-backed persistence सहज बदलता येते.
- Kafka/Flink/Lakehouse वेगळे ठेवले आहेत, जेणेकरून real-time आणि batch analytics दोन्ही support होतील.
- FAISS/RAG वेगळ्या module मध्ये ठेवले आहे, त्यामुळे hallucination कमी करण्यासाठी retrieval-first AI answers तयार करता येतील.
- Agents protocol-based ठेवले आहेत, त्यामुळे नवीन agent जोडताना orchestrator बदलण्याची गरज नाही.
