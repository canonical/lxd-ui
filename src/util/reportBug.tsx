import { UI_VERSION } from "./version";

export const getReportBugBodyTemplate = (error?: Error) => {
  return `\
  # Description

  A brief description of the problem. Should include what you were attempting to do, what you did, what happened and what you expected to 
  see happen.
    
  # Metadata
    
  UI Version: ${UI_VERSION}
  Path: ${location.toString()}
    
  ${
    error && error.stack
      ? `# Stacktrace
    
    ${error.stack}`
      : ""
  } `;
};
