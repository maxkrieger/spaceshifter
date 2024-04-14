import numpy as np
from typing import List, Tuple, Optional


# from https://github.com/openai/openai-python/blob/release-v0.28.1/openai/embeddings_utils.py
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def cosine_similarity_matrix(a, b, M):
    a_M = a @ M
    b_M = b @ M
    return cosine_similarity(a_M, b_M)


# functions adapted from https://github.com/openai/openai-cookbook/blob/main/examples/Customizing_embeddings.ipynb
def accuracy_and_se(cos_and_labels: List[Tuple[float, int]]) -> dict:
    accuracies = []
    for threshold_thousandths in range(-1000, 1000, 1):
        threshold = threshold_thousandths / 1000
        total = 0
        correct = 0
        for cs, ls in cos_and_labels:
            total += 1
            if cs > threshold:
                prediction = 1
            else:
                prediction = -1
            if prediction == ls:
                correct += 1
        accuracy = correct / total
        accuracies.append(accuracy)
    a = max(accuracies)
    n = len(cos_and_labels)
    standard_error = (a * (1 - a) / n) ** 0.5  # standard error of binomial
    message = f"{a:0.1%} ± {1.96 * standard_error:0.1%}"
    return {"accuracy": a, "se": standard_error, "message": message}


def generate_cosine_distances(
    embeddings: dict, pairings: List[dict], M: Optional[np.ndarray] = None
) -> List[List[float]]:
    similarities = []
    for pairing in pairings:
        text_1 = pairing["text_1"]
        text_2 = pairing["text_2"]
        label = pairing["label"]
        embedding_1 = embeddings[text_1]
        embedding_2 = embeddings[text_2]
        if M is not None:
            similarity = cosine_similarity_matrix(embedding_1, embedding_2, M)
        else:
            similarity = cosine_similarity(embedding_1, embedding_2)
        similarities.append([similarity, label])
    return similarities
