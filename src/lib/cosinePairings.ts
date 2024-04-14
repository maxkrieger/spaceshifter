import { zip } from "lodash";
import { CosinePairings, TensorDataset } from "../types";
import { metrics, tidy, Tensor2D } from "@tensorflow/tfjs";

function matMul(tensor: Tensor2D, mat?: Tensor2D) {
  return mat ? tensor.matMul(mat) : tensor;
}

/**
 * Gets the cosine distances for each pair in the dataset.
 * Zips with the groundtruth label for easy comparison/labeling
 * @param mat (optional) matrix to multiply by each embedding before computing
 */
export default async function computeCosinePairings(
  dataset: TensorDataset,
  mat?: Tensor2D
): Promise<CosinePairings> {
  const res = tidy(() => {
    const proximities = metrics
      .cosineProximity(matMul(dataset.e1, mat), matMul(dataset.e2, mat))
      .mul(-1);
    return proximities.arraySync() as number[];
  });

  return zip(res, dataset.labels.arraySync()) as CosinePairings;
}
