import re
from collections import Counter

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
    "been", "being", "to", "of", "in", "on", "at", "for", "with", "by",
    "from", "as", "that", "this", "these", "those", "it", "its", "we",
    "our", "they", "their", "has", "have", "had", "will", "would", "can",
    "could", "should", "i", "you", "he", "she", "his", "her", "them",
}


def _split_sentences(text: str):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]


def summarize_text(text: str, max_sentences: int = 3) -> str:
    sentences = _split_sentences(text)
    if len(sentences) <= max_sentences:
        return text.strip()

    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    freq = Counter(w for w in words if w not in STOPWORDS)

    scored = []
    for idx, sentence in enumerate(sentences):
        sent_words = re.findall(r'\b[a-zA-Z]+\b', sentence.lower())
        score = sum(freq.get(w, 0) for w in sent_words)
        scored.append((idx, score, sentence))

    top = sorted(scored, key=lambda x: x[1], reverse=True)[:max_sentences]
    top_in_order = sorted(top, key=lambda x: x[0])

    return " ".join(s for _, _, s in top_in_order)