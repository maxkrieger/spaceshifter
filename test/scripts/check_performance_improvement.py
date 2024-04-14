import cookbooklib
import json
import argparse
import numpy as np

parser = argparse.ArgumentParser(
    description="Checks the performance improvement provided by a matrix"
)

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
    "--M",
    type=str,
    help="Path to matrix .npy file",
)

args = parser.parse_args()

with open(args.pairings) as pairings_file, open(args.embeddings) as embeddings_file:
    M = np.load(args.M, allow_pickle=True)
    embeddings = json.load(embeddings_file)
    pairings = json.load(pairings_file)
    similarities_before_multiplication = cookbooklib.generate_cosine_distances(
        embeddings, pairings
    )
    similarities_after_multiplication = cookbooklib.generate_cosine_distances(
        embeddings, pairings, M
    )
    accuracy_and_se_before_multiplication = cookbooklib.accuracy_and_se(
        similarities_before_multiplication
    )
    accuracy_and_se_after_multiplication = cookbooklib.accuracy_and_se(
        similarities_after_multiplication
    )
    print(f"Before: {accuracy_and_se_before_multiplication['message']}")
    print(f"After: {accuracy_and_se_after_multiplication['message']}")
