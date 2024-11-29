declare module "react-cytoscapejs" {
  import { ComponentType } from "react";

  export interface CytoscapeComponentProps {
    className?: string;
    elements: cytoscape.ElementDefinition[];
    style?: { height: string; width: string };
    layout?: cytoscape.LayoutOptions;
    cy?: (cy: cytoscape.Core) => void;
  }

  const CytoscapeComponent: ComponentType<CytoscapeComponentProps>;

  export default CytoscapeComponent;
}
