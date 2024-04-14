import argparse
import json
from typing import List, Tuple


# adapted from https://github.com/openai/openai-cookbook/blob/main/examples/Customizing_embeddings.ipynb
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
