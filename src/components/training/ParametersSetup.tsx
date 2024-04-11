import useParameters from "@/hooks/useParameters";
import { OptimizationParameters, OptimizerType } from "@/types";
import { useCallback } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";

function ParameterField({
  children,
  identifier,
  name,
  description,
}: {
  children: React.ReactNode;
  identifier: string;
  name: string;
  description: string;
}) {
  return (
    <>
      <Label htmlFor={identifier}>{name}</Label>
      {children}
      <p className="text-sm text-slate-200">{description}</p>
    </>
  );
}

export default function ParametersSetup({
  children,
}: {
  children: React.ReactNode;
}) {
  const [parameters, setParameters] = useParameters();
  const changeOptimizer = useCallback(
    (value: OptimizerType) => {
      const params = { ...parameters };
      //   Both optimizers have dramatically different learning rates
      if (value === "adamax") {
        params.learningRate = 0.01;
        params.batchSize = 10;
      } else {
        params.learningRate = 10;
        params.batchSize = 10;
      }
      setParameters({ ...params, optimizer: value });
    },
    [setParameters, parameters]
  );
  const changeValue = useCallback(
    (value: number, key: keyof OptimizationParameters) => {
      setParameters({ ...parameters, [key]: value });
    },
    [parameters, setParameters]
  );
  return (
    <div>
      <p className="text-slate-200">Adjust the following parameters to improve performance.</p>
      <div className="p-3 grid md:grid-cols-[auto,220px,3fr] gap-x-5 gap-y-3 items-center sm:grid-cols-1">
        <ParameterField
          identifier="targetEmbeddingSize"
          name="Target Embedding Size"
          description="How big should the embedding be after the matmul. Larger is usually better but more expensive to search over."
        >
          <Input
            type="number"
            min={1}
            step={1}
            value={parameters.targetEmbeddingSize}
            onChange={(e) =>
              changeValue(Number(e.target.value), "targetEmbeddingSize")
            }
            id="targetEmbeddingSize"
          />
        </ParameterField>

        <ParameterField
          name="Optimizer"
          identifier="optimizer"
          description="The algorithm to optimize the matrix."
        >
          <Select value={parameters.optimizer} onValueChange={changeOptimizer}>
            <SelectTrigger className="w-[220px]" id="optimizer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gradient">Simple Gradient Descent</SelectItem>
              <SelectItem value="adamax">Adamax</SelectItem>
            </SelectContent>
          </Select>
        </ParameterField>

        <ParameterField
          identifier="learningRate"
          name="Learning Rate"
          description="How big of a gradient to apply at each step."
        >
          <Input
            type="text"
            value={parameters.learningRate}
            onChange={(e) => changeValue(Number(e.target.value), "learningRate")}
            id="learningRate"
          />
        </ParameterField>

        <ParameterField
          identifier="batchSize"
          name="Batch Size"
          description="How many examples to show on each update."
        >
          <Input
            type="text"
            value={parameters.batchSize}
            onChange={(e) => changeValue(Number(e.target.value), "batchSize")}
            id="batchSize"
          />
        </ParameterField>

        <ParameterField
          identifier="epochs"
          name="Epochs"
          description="How many times all examples should be shown to the model."
        >
          <Input
            type="text"
            value={parameters.epochs}
            onChange={(e) => changeValue(Number(e.target.value), "epochs")}
            id="epochs"
          />
        </ParameterField>

        <ParameterField
          identifier="dropoutFraction"
          name="Dropout Fraction"
          description="Proportion of weights to randomly ignore. To prevent overfitting."
        >
          <Input
            type="text"
            min={0}
            max={1}
            step={0.05}
            value={parameters.dropoutFraction}
            onChange={(e) => changeValue(Number(e.target.value), "dropoutFraction")}
            id="dropoutFraction"
          />
        </ParameterField>
      </div>
      {children}
    </div>
  );
}
