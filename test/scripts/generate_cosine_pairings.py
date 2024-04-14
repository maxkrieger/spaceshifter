# Groundtruth generation of cosine distances given pairings and embeddings
import numpy as np
import json
import argparse


# from https://github.com/openai/openai-python/blob/release-v0.28.1/openai/embeddings_utils.py
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


parser = argparse.ArgumentParser(description="Generate cosine distances for pairings")
parser.add_argument(
    "--embeddings",
    type=str,
    help="Path to embeddings json (maps from string to list of floats)",
)
parser.add_argument(
    "--pairings",
    type=str,
    help="Path to pairings json (array of {text_1: string, text_2: string})",
)
parser.add_argument(
    "--output",
    type=str,
    help="Path to output json (array of [float, label])",
)

args = parser.parse_args()

similarities = []

with open(args.pairings) as pairings_file, open(args.embeddings) as embeddings_file:
    pairings = json.load(pairings_file)
    embeddings = json.load(embeddings_file)
    for pairing in pairings:
        text_1 = pairing["text_1"]
        text_2 = pairing["text_2"]
        label = pairing["label"]
        embedding_1 = embeddings[text_1]
        embedding_2 = embeddings[text_2]
        similarity = cosine_similarity(embedding_1, embedding_2)
        similarities.append([similarity, label])

with open(args.output, "w") as output_file:
    json.dump(similarities, output_file)
