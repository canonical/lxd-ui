// Given a chunk of binary data, find the index of an input string that is within the binary data.
// This function should return the index of the string in the chunk, or -1 if the string is not found.
// To make things a bit more efficient, instead of doing a byte by byte comparison, we can do a sliding window approach with early return
// e.g. chunk = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], text = [3, 4, 5] (converted from string)
export const findTextIndexInBinary = (
  chunk: Uint8Array,
  text: string,
): number => {
  const textBytes = new TextEncoder().encode(text);
  const chunkLength = chunk.length;
  const textBytesLength = textBytes.length;

  const invalidText = textBytesLength === 0 || textBytesLength > chunkLength;
  if (invalidText) {
    return -1;
  }

  let matchIndex = 0;
  while (matchIndex <= chunkLength - textBytesLength) {
    const firstByteMatch = chunk[matchIndex] === textBytes[0];
    // If the first byte matches, check the rest of the text
    if (firstByteMatch) {
      let found = true;
      // start at 1 since we already checked the first byte
      for (let i = 1; i < textBytesLength; i++) {
        if (chunk[matchIndex + i] !== textBytes[i]) {
          found = false;
          break;
        }
      }

      if (found) {
        return matchIndex;
      }
    }

    // If the first byte doesn't match, move to the next byte without iterating the text
    matchIndex++;
  }

  return -1;
};

export const splitMultipartChunk = (chunk: Uint8Array, boundary: string) => {
  const splits: Uint8Array[] = [];

  // if the boundary is not found in the chunk, return the chunk as is
  let boundaryIndex = findTextIndexInBinary(chunk, boundary);
  if (boundaryIndex === -1) {
    splits.push(chunk);
    return splits;
  }

  // deep copy the chunk so we don't operate on the original data
  let nextPartInChunk = new Uint8Array(chunk);
  while (boundaryIndex !== -1) {
    const partContent = nextPartInChunk.slice(0, boundaryIndex);
    splits.push(partContent);

    const nextPartStartIndex = boundaryIndex + boundary.length;
    nextPartInChunk = nextPartInChunk.slice(nextPartStartIndex);
    boundaryIndex = findTextIndexInBinary(nextPartInChunk, boundary);
  }

  if (nextPartInChunk.length > 0) {
    splits.push(nextPartInChunk);
  }

  const decoder = new TextDecoder("utf-8");
  const splitsOutput: Uint8Array[] = [];
  for (const split of splits) {
    const splitStr = decoder.decode(split);
    // if the split is empty, it means it's a boundary, we should skip it
    if (splitStr.trim() === "--") {
      continue;
    }

    splitsOutput.push(split);
  }

  return splitsOutput;
};

// Given a chunk of binary data from a multipart/form-data response.
// for the purpose of this function, the input binary data is gauranteed to have headers and body
export const splitHeaderAndBody = (
  part: Uint8Array,
  delimiter: string = "\r\n\r\n",
): {
  headers: Record<string, string>;
  headerEndIndex: number;
  body: Uint8Array;
} => {
  // index at which the header ends
  // NOTE: the body starts after the header + number of bytes in delimiter
  const headerEndIndex = findTextIndexInBinary(part, delimiter);
  const headerText = new TextDecoder().decode(part.slice(0, headerEndIndex));

  const interHeaderDelimiter = "\r\n";
  const headers = headerText.split(interHeaderDelimiter);
  const outputHeaders: Record<string, string> = {};
  for (const header of headers) {
    const [key, value] = header.split(": ");
    outputHeaders[key.toLowerCase()] = value;
  }

  // if the header is not found, the body starts at the beginning of the part
  let bodyStartIndex = 0;
  if (headerEndIndex !== -1) {
    bodyStartIndex = headerEndIndex + delimiter.length;
  }
  const body = part.slice(bodyStartIndex);
  return { headers: outputHeaders, headerEndIndex, body };
};

export const sanitizeExportFileName = (filename: string) => {
  // remove quotes and replace invalid characters with underscores
  return filename.replace(/['"]+/g, "").replace(/[\s\\/:*?"<>|]+/g, "_");
};
