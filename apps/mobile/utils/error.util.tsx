import { IApiError } from "./interface.utl";

export const handleApiError = (error: IApiError): string => {
    if (!error.response)  {
        if (error.code === "ECONNABORTED") return "Request timeout. Please try again.";
        if (error.message?.includes("Network Error")) return "Network error. Please check your connection and try again.";
        return "Unable to connect to the server.";
      }    
  
    const { status, data } = error.response;
  
    const errorMessages: Record<number, string> = {
      100: "Continue: The server has received the request headers, and the client should proceed to send the request body.",
      101: "Switching Protocols: The requester has asked the server to switch protocols.",
      102: "Processing: The server is processing the request but no response is available yet.",
      200: "OK: The request was successful.",
      201: "Created: The request was successful and a new resource was created.",
      202: "Accepted: The request has been accepted for processing, but it is not complete.",
      203: "Non-Authoritative Information: The request was successful, but the returned data may be modified from the origin.",
      204: "No Content: The request was successful, but there is no content to send back.",
      205: "Reset Content: The request was successful, but the client should reset the document view.",
      206: "Partial Content: The server is delivering only part of the resource due to range requests.",
      300: "Multiple Choices: Multiple options for the requested resource are available.",
      301: "Moved Permanently: The requested resource has been permanently moved to a new URL.",
      302: "Found: The requested resource is temporarily available at a different URL.",
      303: "See Other: The response can be found at another URI using a GET request.",
      304: "Not Modified: The requested resource has not been modified since the last request.",
      307: "Temporary Redirect: The request should be repeated with another URI, but future requests should use the original URI.",
      308: "Permanent Redirect: The request should be repeated with another URI, and future requests should use the new URI permanently.",
      400: data?.message || data?.detail 
      || (Array.isArray(data?.errors) ? data?.errors.join(", ") 
      : "Bad Request: The server cannot process the request due to client error."),
      401: data?.message || "Unauthorized: Authentication is required and has failed or has not been provided.",
      402: "Payment Required: Payment is needed to access the requested resource.",
      403: "Forbidden: The server understands the request but refuses to authorize it.",
      404: "Not Found: The requested resource could not be found.",
      405: "Method Not Allowed: The request method is not supported for the requested resource.",
      406: "Not Acceptable: The requested resource is not available in a format that would be acceptable to the client.",
      407: "Proxy Authentication Required: The client must first authenticate with the proxy.",
      408: "Request Timeout: The server timed out waiting for the request.",
      409: "Conflict: The request could not be processed due to a conflict with the current state of the resource.",
      410: "Gone: The requested resource is no longer available and will not be available again.",
      411: "Length Required: The request did not specify a required Content-Length header.",
      412: "Precondition Failed: The server does not meet one of the preconditions specified in the request.",
      413: "Payload Too Large: The request is larger than the server is willing to process.",
      414: "URI Too Long: The requested URI is too long for the server to process.",
      415: "Unsupported Media Type: The server does not support the media format of the requested data.",
      416: "Range Not Satisfiable: The requested range cannot be fulfilled.",
      417: "Expectation Failed: The server cannot meet the requirements of the Expect request-header field.",
      418: "I'm a Teapot: This is a joke response code from RFC 2324.",
      422: data?.message || "Unprocessable Entity: The request was well-formed but could not be processed.",
      425: "Too Early: The server is unwilling to process the request because it might be replayed.",
      426: "Upgrade Required: The client must upgrade to a different protocol.",
      428: "Precondition Required: The request requires preconditions to be met.",
      429: error.response.headers?.["retry-after"]
      ? `Too many requests. Please wait ${error.response.headers["retry-after"]} seconds.`
      : "Too many requests. Please slow down.",
      431: "Request Header Fields Too Large: The request headers are too large.",
      451: "Unavailable for Legal Reasons: The resource is restricted due to legal reasons.",
      500: "Internal Server Error: Something went wrong on the server's side.",
      501: "Not Implemented: The server does not support the requested functionality.",
      502: "Bad Gateway: The server received an invalid response from the upstream server.",
      503: "Service Unavailable: The server is currently unavailable (overloaded or down for maintenance).",
      504: "Gateway Timeout: The server did not receive a timely response from the upstream server.",
      505: "HTTP Version Not Supported: The server does not support the HTTP version used in the request.",
      506: "Variant Also Negotiates: There was a server configuration error.",
      507: "Insufficient Storage: The server cannot store the representation needed to complete the request.",
      508: "Loop Detected: The server detected an infinite loop while processing the request.",
      510: "Not Extended: Further extensions are required for the request to be fulfilled.",
      511: "Network Authentication Required: The client must authenticate to gain network access."
    };
    
    if (errorMessages[status]) return errorMessages[status];

    console.error("Unhandled API Error:", error);
    return `Unexpected error (${status}). Please try again.`;
  };
  
  