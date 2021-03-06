import { createServer } from "http";

import { Result } from "../TenorAPI";

let counter = 0;

const makeId = () => {
  counter += 1;
  return counter.toString();
};

const makeResult = (): Result => {
  const media = {
    preview: "https://via.placeholder.com/10x10",
    url: "https://via.placeholder.com/10x10",
    dims: [10, 10],
    size: 100
  };

  return {
    created: 12345,
    hasaudio: false,
    id: makeId(),
    media: [{ tinygif: media, gif: media, mp4: media }],
    tags: [],
    itemurl: "https://tenor.com/view/this-is-a-test-gif-12345",
    hascaption: false,
    url: "https://tenor.com/12345"
  };
};

export const results = { /* eslint-disable @typescript-eslint/camelcase */
  autocomplete: ["test", "testing", "test2", "testingtesting", "testy testerson"],
  search_suggestions: ["test", "unit test", "acceptance test", "testing", "how to test"],
  search: [makeResult(), makeResult(), makeResult(), makeResult(), makeResult()]
};

const getRequestKey = (url: string) => (
  url.slice(1).substring(0, url.indexOf("?") - 1)
);

export type TestServer = ReturnType<typeof createServer> & {
  requests: {
    autocomplete: number;
    search_suggestions: number;
    search: number;
  };
};

const withTestServer = (port: number, callback: ((server: TestServer) => void)) => async () => {
  const server = createServer() as TestServer;

  server.requests = {
    autocomplete: 0,
    search_suggestions: 0,
    search: 0
  };

  server.on("request", (request, response) => {
    const requestKey = getRequestKey(request.url) as ("autocomplete" | "search_suggestions" | "search");
    server.requests[requestKey] += 1;

    response.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, GET"
    });

    response.write(JSON.stringify({ results: results[requestKey], next: "12" }));
    response.end();
  });

  server.listen(port);

  try {
    await callback(server);
  } finally {
    server.close();
  }
};

export default withTestServer;
