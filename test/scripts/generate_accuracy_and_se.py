import argparse
import json
from cookbooklib import accuracy_and_se


parser = argparse.ArgumentParser(
    description="Generate accuracy and standard error given cosine pairings"
)
parser.add_argument(
    "--cosine_pairings",
    type=str,
    help="Path to cosine pairings json (array of [float, label])",
)
parser.add_argument(
    "--output",
    type=str,
    help="Path to output json (object with accuracy, se, and message)",
)

args = parser.parse_args()

with open(args.cosine_pairings) as cosine_pairings_file, open(
    args.output, "w"
) as output_file:
    cos_and_labels = json.load(cosine_pairings_file)
    accuracy_and_se_dict = accuracy_and_se(cos_and_labels)
    json.dump(accuracy_and_se_dict, output_file)
