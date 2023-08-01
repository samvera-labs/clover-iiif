export interface RequestOptions {
  ignoreCache?: boolean;
  headers?: { [key: string]: string };
  timeout?: number;
  withCredentials: boolean;
}

export const DEFAULT_REQUEST_OPTIONS = {
  ignoreCache: false,
  headers: {
    Accept: "application/json, text/javascript, text/plain",
  },
  timeout: 5000,
  withCredentials: false,
};

export interface RequestResult {
  ok: boolean;
  status: number;
  statusText: string;
  data: string;
  json: <T>() => T;
  headers: string;
}

function parseXHRResult(xhr: XMLHttpRequest): RequestResult {
  return {
    ok: xhr.status >= 200 && xhr.status < 300,
    status: xhr.status,
    statusText: xhr.statusText,
    headers: xhr.getAllResponseHeaders(),
    data: xhr.responseText,
    json: <T>() => JSON.parse(xhr.responseText) as T,
  };
}

function errorResponse(
  xhr: XMLHttpRequest,
  message: string | null = null,
): RequestResult {
  return {
    ok: false,
    status: xhr.status,
    statusText: xhr.statusText,
    headers: xhr.getAllResponseHeaders(),
    data: message || xhr.statusText,
    json: <T>() => JSON.parse(message || xhr.statusText) as T,
  };
}

export function getRequest(
  url: string,
  options: RequestOptions = DEFAULT_REQUEST_OPTIONS,
) {
  const headers = options.headers || DEFAULT_REQUEST_OPTIONS.headers;

  return new Promise<RequestResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("get", url);
    xhr.withCredentials = options.withCredentials;

    if (headers) {
      Object.keys(headers).forEach((key) =>
        xhr.setRequestHeader(key, headers[key]),
      );
    }

    xhr.onload = () => {
      resolve(parseXHRResult(xhr));
    };

    xhr.onerror = () => {
      reject(errorResponse(xhr, `Failed to make request.`));
    };

    xhr.ontimeout = () => {
      reject(errorResponse(xhr, `Request took longer than expected.`));
    };

    xhr.send();
  });
}
