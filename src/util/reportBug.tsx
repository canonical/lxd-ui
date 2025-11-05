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

export const getReportBugURL = (error?: Error) => {
  return `https://github.com/canonical/lxd-ui/issues/new?labels=Bug&title=Bug%20report&body=${encodeURIComponent(getReportBugBodyTemplate(error))}`;
};
