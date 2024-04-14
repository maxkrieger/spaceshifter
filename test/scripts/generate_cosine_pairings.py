# Groundtruth generation of cosine distances given pairings and embeddings
import numpy as np
import json
import argparse
from cookbooklib import generate_cosine_distances


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
    similarities = generate_cosine_distances(
        json.load(embeddings_file), json.load(pairings_file)
    )

with open(args.output, "w") as output_file:
    json.dump(similarities, output_file)
