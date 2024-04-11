import { ThemeProvider } from "../theme-provider";

import ExampleDatasets from "./ExampleDatasets";
import MyDatasets from "./MyDatasets";

export default function ProjectPanel() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="mx-auto my-3 max-w-4xl flex flex-row justify-center flex-wrap">
        <ExampleDatasets />
        <MyDatasets />
      </div>
    </ThemeProvider>
  );
}
