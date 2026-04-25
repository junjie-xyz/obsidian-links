import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGatewayUrl,
  buildObsidianUri,
  createLinkState,
  parseObsidianUri,
  parseParamsFromLocation,
} from "../assets/obsidian-links.js";

test("parses vault and file from hash parameters", () => {
  assert.deepEqual(
    parseParamsFromLocation({
      hash: "#vault=Work&file=Inbox%2FTest.md",
      search: "",
    }),
    {
      vault: "Work",
      file: "Inbox/Test.md",
    },
  );
});

test("parses vault and file from #? hash parameters", () => {
  assert.deepEqual(
    parseParamsFromLocation({
      hash: "#?vault=Work&file=Inbox%2FTest.md",
      search: "",
    }),
    {
      vault: "Work",
      file: "Inbox/Test.md",
    },
  );
});

test("parses vault and file from query string", () => {
  assert.deepEqual(
    parseParamsFromLocation({
      hash: "",
      search: "?vault=Work&file=Inbox%2FTest.md",
    }),
    {
      vault: "Work",
      file: "Inbox/Test.md",
    },
  );
});

test("hash parameters take priority over query string", () => {
  assert.deepEqual(
    parseParamsFromLocation({
      hash: "#vault=HashVault&file=Hash.md",
      search: "?vault=QueryVault&file=Query.md",
    }),
    {
      vault: "HashVault",
      file: "Hash.md",
    },
  );
});

test("encodes Chinese vault and file values", () => {
  assert.equal(
    buildObsidianUri("open", {
      vault: "工作",
      file: "收件箱/测试.md",
    }),
    "obsidian://open?vault=%E5%B7%A5%E4%BD%9C&file=%E6%94%B6%E4%BB%B6%E7%AE%B1%2F%E6%B5%8B%E8%AF%95.md",
  );
});

test("encodes slash in file values", () => {
  assert.equal(
    buildObsidianUri("open", {
      vault: "Work",
      file: "Inbox/Test.md",
    }),
    "obsidian://open?vault=Work&file=Inbox%2FTest.md",
  );
});

test("encodes spaces as %20 instead of plus signs", () => {
  assert.equal(
    buildObsidianUri("open", {
      vault: "DemoVault",
      file: "Folder/Example Note",
    }),
    "obsidian://open?vault=DemoVault&file=Folder%2FExample%20Note",
  );
});

test("accepts md notes without the .md extension", () => {
  const state = createLinkState("open", {
    hash: "#vault=DemoVault&file=Folder%2FExample%20Note",
    search: "",
  });

  assert.equal(state.ok, true);
  assert.equal(
    state.obsidianUri,
    "obsidian://open?vault=DemoVault&file=Folder%2FExample%20Note",
  );
});

test("parses obsidian open URI input", () => {
  assert.deepEqual(
    parseObsidianUri("obsidian://open?vault=DemoVault&file=Folder%2FExample%20Note"),
    {
      ok: true,
      action: "open",
      params: {
        vault: "DemoVault",
        file: "Folder/Example Note",
      },
      errors: [],
    },
  );
});

test("builds HTTPS gateway links from obsidian URI params", () => {
  assert.equal(
    buildGatewayUrl(
      "open",
      {
        vault: "DemoVault",
        file: "Folder/Example Note",
      },
      "https://obsidian-links.junjie.xyz/",
    ),
    "https://obsidian-links.junjie.xyz/open/#vault=DemoVault&file=Folder%2FExample%20Note",
  );
});

test("builds HTTPS search gateway links from obsidian URI params", () => {
  const parsed = parseObsidianUri("obsidian://search?vault=DemoVault&query=Example%20query");

  assert.equal(parsed.ok, true);
  assert.equal(
    buildGatewayUrl(parsed.action, parsed.params, "https://obsidian-links.junjie.xyz/"),
    "https://obsidian-links.junjie.xyz/search/#vault=DemoVault&query=Example%20query",
  );
});

test("builds autoopen gateway links for open action", () => {
  assert.equal(
    buildGatewayUrl(
      "open",
      {
        vault: "DemoVault",
        file: "Inbox/Test",
      },
      "https://obsidian-links.junjie.xyz/",
      { autoopen: true },
    ),
    "https://obsidian-links.junjie.xyz/open/#vault=DemoVault&file=Inbox%2FTest&autoopen=1",
  );
});

test("builds autoopen gateway links for search action", () => {
  assert.equal(
    buildGatewayUrl(
      "search",
      {
        vault: "DemoVault",
        query: "Example",
      },
      "https://obsidian-links.junjie.xyz/",
      { autoopen: true },
    ),
    "https://obsidian-links.junjie.xyz/search/#vault=DemoVault&query=Example&autoopen=1",
  );
});

test("rejects obsidian URI input without vault", () => {
  const parsed = parseObsidianUri("obsidian://open?file=Inbox%2FTest.md");

  assert.equal(parsed.ok, false);
  assert.match(parsed.errors.join("\n"), /vault or path is required/);
});

test("allows open with vault and no file", () => {
  const state = createLinkState("open", {
    hash: "#vault=Work",
    search: "",
  });

  assert.equal(state.ok, true);
  assert.equal(state.obsidianUri, "obsidian://open?vault=Work");
});

test("allows search with vault and no query", () => {
  const state = createLinkState("search", {
    hash: "#vault=Work",
    search: "",
  });

  assert.equal(state.ok, true);
  assert.equal(state.obsidianUri, "obsidian://search?vault=Work");
});

test("supports documented new action", () => {
  assert.equal(
    buildObsidianUri("new", {
      vault: "Work",
      name: "New note",
      content: "Hello World",
    }),
    "obsidian://new?vault=Work&name=New%20note&content=Hello%20World",
  );
});

test("supports documented no-parameter choose-vault action", () => {
  assert.equal(buildObsidianUri("choose-vault", {}), "obsidian://choose-vault");
});

test("supports documented hook-get-address callback params", () => {
  assert.equal(
    buildObsidianUri("hook-get-address", {
      vault: "Work",
      "x-success": "hook://x-callback-url",
      "x-error": "hook://error",
    }),
    "obsidian://hook-get-address?vault=Work&x-success=hook%3A%2F%2Fx-callback-url&x-error=hook%3A%2F%2Ferror",
  );
});

test("parses documented vault shorthand URI", () => {
  assert.deepEqual(parseObsidianUri("obsidian://vault/my%20vault/my%20note"), {
    ok: true,
    action: "open",
    params: {
      vault: "my vault",
      file: "my note",
    },
    errors: [],
  });
});

test("parses documented absolute path shorthand URI", () => {
  assert.deepEqual(parseObsidianUri("obsidian:///Example%20Vault/Example%20Note"), {
    ok: true,
    action: "open",
    params: {
      path: "/Example Vault/Example Note",
    },
    errors: [],
  });
});

test("autoopen parameter controls gateway page only", () => {
  const state = createLinkState("open", {
    hash: "#vault=Work&file=Inbox.md&autoopen=1",
    search: "",
  });

  assert.equal(state.ok, true);
  assert.equal(state.controls.autoopen, true);
  assert.equal(state.obsidianUri, "obsidian://open?vault=Work&file=Inbox.md");
});

test("rejects target parameter", () => {
  const state = createLinkState("open", {
    hash: "#vault=Work&file=Inbox.md&target=obsidian%3A%2F%2Fopen",
    search: "",
  });

  assert.equal(state.ok, false);
  assert.match(state.errors.join("\n"), /Blocked parameter: target/);
});

test("allows paneType tab, split, and window", () => {
  for (const paneType of ["tab", "split", "window"]) {
    assert.equal(
      createLinkState("open", {
        hash: `#vault=Work&file=Inbox.md&paneType=${paneType}`,
        search: "",
      }).ok,
      true,
    );
  }
});

test("rejects unsupported paneType values", () => {
  const state = createLinkState("open", {
    hash: "#vault=Work&file=Inbox.md&paneType=modal",
    search: "",
  });

  assert.equal(state.ok, false);
  assert.match(state.errors.join("\n"), /paneType must be tab, split, or window/);
});
