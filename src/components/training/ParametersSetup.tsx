import useParameters from "@/hooks/useParameters";
import { OptimizerType } from "@/types";
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
      <Label htmlFor={identifier} className="md:text-right sm:text-left">
        {name}
      </Label>
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
  const [parameters, setParameter] = useParameters();
  const changeOptimizer = useCallback(
    (value: OptimizerType) => {
      //   Both optimizers have dramatically different learning rates
      if (value === "adamax") {
        setParameter("learningRate", 0.01);
      } else {
        setParameter("learningRate", 10);
      }
      setParameter("optimizer", value);
    },
    [setParameter]
  );

  return (
    <div>
      <p className="text-slate-200">
        Adjust the following parameters to improve performance.
      </p>
      <div className="p-3 grid md:grid-cols-[auto,220px,3fr] sm:grid-cols-1 gap-x-5 gap-y-3 items-center">
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
              setParameter("targetEmbeddingSize", Number(e.target.value))
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
            type="number"
            min={0}
            step={0.01}
            value={parameters.learningRate}
            onChange={(e) =>
              setParameter("learningRate", Number(e.target.value))
            }
            id="learningRate"
          />
        </ParameterField>

        <ParameterField
          identifier="batchSize"
          name="Batch Size"
          description="How many examples to show on each update."
        >
          <Input
            type="number"
            min={1}
            step={1}
            value={parameters.batchSize}
            onChange={(e) => setParameter("batchSize", Number(e.target.value))}
            id="batchSize"
          />
        </ParameterField>

        <ParameterField
          identifier="epochs"
          name="Epochs"
          description="How many times all examples should be shown to the model."
        >
          <Input
            type="number"
            min={1}
            step={1}
            value={parameters.epochs}
            onChange={(e) => setParameter("epochs", Number(e.target.value))}
            id="epochs"
          />
        </ParameterField>

        <ParameterField
          identifier="dropoutFraction"
          name="Dropout Fraction"
          description="Proportion of weights to randomly ignore. To prevent overfitting."
        >
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={parameters.dropoutFraction}
            onChange={(e) =>
              setParameter("dropoutFraction", Number(e.target.value))
            }
            id="dropoutFraction"
          />
        </ParameterField>
      </div>
      {children}
    </div>
  );
}
