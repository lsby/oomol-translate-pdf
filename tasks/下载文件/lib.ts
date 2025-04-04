import type { Response, HeadersInit } from "node-fetch";

import fetch from "node-fetch";

export type DownloadParams = {
  readonly url: string;
  readonly query: Record<string, string>;
  readonly headers: Record<string, string>;
  readonly timeout: number | null;
  readonly retry_times: number;
  readonly reportProgress: (p: number) => void;
};

export default async function(params: DownloadParams): Promise<Buffer> {
  const { url, query, headers, timeout, retry_times, reportProgress } = params;
  let fullUrl = url;
  if (Object.keys(query).length > 0) {
    fullUrl + "?" + new URLSearchParams(query).toString();
  }
  const response = await fetchWithRetry(fullUrl, retry_times, headers, timeout);
  if (response.status !== 200) {
    throw await convertResponseError(response);
  }
  return await download(response, reportProgress);
};

async function fetchWithRetry(url: string, retries: number, headers: HeadersInit, timeout: number | null): Promise<Response> {
  for (let i = 0; i < retries; i ++) {
    let signal: AbortSignal | undefined;
    let timeoutId: null | ReturnType<typeof setTimeout> = null;

    try {
      if (typeof timeout === "number" && timeout > 0) {
        const controller = new AbortController();
        signal = controller.signal;
        timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
      }
      const response = await fetch(url, { headers, signal });
      switch (response.status) {
        case 500:
        case 502:
        case 503:
        case 504: {
          break;
        }
        default: {
          return response;
        }
      }
    } catch (error) {
      console.error("Error fetching URL failed and retrying", error);
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    }
  }
};

async function convertResponseError(response: Response): Promise<Error> {
  let error: string;
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    error = JSON.stringify(await response.json());
  } else {
    error = await response.text();
  }
  if (error === "") {
    return new Error(`Fetch URL failed with status code ${response.status}`);
  } else {
    return new Error(`Fetch URL failed with status code: ${response.status}: ${error}`);
  }
}

async function download(response: Response, reportProgress: (p: number) => void): Promise<Buffer> {
  const contentLength = response.headers.get("Content-Length");
  const totalLength = contentLength ? parseInt(contentLength, 10) : null;
  const chunks: Buffer[] = [];

  let receivedLength = 0;
  for await (const chunk of response.body) {
    chunks.push(chunk as Buffer);
    receivedLength += chunk.length;
    if (totalLength !== null) {
      reportProgress((receivedLength / totalLength) * 100);
    }
  }
  reportProgress(100);

  return Buffer.concat(chunks);
}