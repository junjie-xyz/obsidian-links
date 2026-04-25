const BLOCKED_PARAM_NAMES = new Set([
  "target",
  "url",
  "redirect",
  "callback",
]);

const ACTIONS = {
  open: {
    orderedParams: ["vault", "file", "path", "prepend", "append", "paneType"],
    validate(params) {
      return params.vault || params.path ? [] : ["vault or path is required"];
    },
  },
  new: {
    orderedParams: [
      "vault",
      "name",
      "file",
      "path",
      "paneType",
      "content",
      "clipboard",
      "silent",
      "append",
      "overwrite",
      "x-success",
    ],
    validate(params) {
      return params.vault || params.path ? [] : ["vault or path is required"];
    },
  },
  daily: {
    orderedParams: [
      "vault",
      "name",
      "file",
      "path",
      "paneType",
      "content",
      "clipboard",
      "silent",
      "append",
      "overwrite",
      "x-success",
    ],
    validate(params) {
      return params.vault || params.path ? [] : ["vault or path is required"];
    },
  },
  unique: {
    orderedParams: ["vault", "paneType", "content", "clipboard", "x-success"],
    validate(params) {
      return params.vault ? [] : ["vault is required"];
    },
  },
  search: {
    orderedParams: ["vault", "query"],
    validate(params) {
      return params.vault ? [] : ["vault is required"];
    },
  },
  "choose-vault": {
    orderedParams: [],
  },
  "hook-get-address": {
    orderedParams: ["vault", "x-success", "x-error"],
  },
};

const CONTROL_PARAM_NAMES = new Set(["autoopen"]);
const GATEWAY_ROUTES = new Set(Object.keys(ACTIONS));

const PARAM_LIMITS = {
  vault: 200,
  file: 1000,
  query: 500,
};

const MAX_OBSIDIAN_URI_LENGTH = 2000;
const ALLOWED_PANE_TYPES = new Set(["tab", "split", "window"]);

function stripPrefix(value, prefix) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function normalizeHash(hash) {
  if (!hash) return "";

  const withoutHash = stripPrefix(hash, "#");
  return stripPrefix(withoutHash, "?");
}

function normalizeSearch(search) {
  if (!search) return "";
  return stripPrefix(search, "?");
}

function hasValue(value) {
  return typeof value === "string" && value.length > 0;
}

function hasParam(params, name) {
  return Object.prototype.hasOwnProperty.call(params, name);
}

function isAutoOpenValue(value) {
  return value === "" || value === "1" || value === "true" || value === "yes";
}

function splitGatewayParams(params) {
  const actionParams = {};
  const controls = {
    autoopen: false,
  };

  for (const [key, value] of Object.entries(params)) {
    if (CONTROL_PARAM_NAMES.has(key)) {
      controls.autoopen = isAutoOpenValue(value);
    } else {
      actionParams[key] = value;
    }
  }

  return { actionParams, controls };
}

function composeObsidianUri(action, params) {
  const config = ACTIONS[action];
  const pairs = [];

  for (const name of config.orderedParams) {
    if (hasParam(params, name)) {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(params[name])}`);
    }
  }

  return pairs.length > 0 ? `obsidian://${action}?${pairs.join("&")}` : `obsidian://${action}`;
}

function composeHashParams(action, params, controls = {}) {
  const config = ACTIONS[action];
  const pairs = [];

  for (const name of config.orderedParams) {
    if (hasParam(params, name)) {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(params[name])}`);
    }
  }

  if (controls.autoopen) {
    pairs.push("autoopen=1");
  }

  return pairs.join("&");
}

function parseShorthandObsidianUri(url) {
  if (url.hostname === "vault") {
    const parts = url.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part));

    if (parts.length === 0) {
      return {
        action: "open",
        params: {},
      };
    }

    return {
      action: "open",
      params: {
        vault: parts[0],
        ...(parts.length > 1 ? { file: parts.slice(1).join("/") } : {}),
      },
    };
  }

  if (url.hostname === "" && url.pathname) {
    return {
      action: "open",
      params: {
        path: decodeURIComponent(url.pathname),
      },
    };
  }

  return null;
}

export function parseParamsFromLocation(locationLike) {
  const hashSource = normalizeHash(locationLike?.hash || "");
  const searchSource = normalizeSearch(locationLike?.search || "");
  const source = hashSource || searchSource;
  const searchParams = new URLSearchParams(source);
  const params = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  return params;
}

export function parseObsidianUri(input) {
  let url;

  try {
    url = new URL(input.trim());
  } catch {
    return {
      ok: false,
      action: "",
      params: {},
      errors: ["Enter a valid obsidian:// URI"],
    };
  }

  if (url.protocol !== "obsidian:") {
    return {
      ok: false,
      action: "",
      params: {},
      errors: ["Only obsidian:// URIs are supported"],
    };
  }

  const shorthand = parseShorthandObsidianUri(url);
  const action = shorthand?.action || url.hostname;
  const params = shorthand?.params || {};

  if (!shorthand) {
    for (const [key, value] of url.searchParams.entries()) {
      params[key] = value;
    }
  }

  const validation = validateRequest(action, params);

  return {
    ok: validation.ok,
    action,
    params,
    errors: validation.errors,
  };
}

export function validateRequest(action, params) {
  const config = ACTIONS[action];
  const errors = [];

  if (!config) {
    return {
      ok: false,
      errors: [`Unsupported action: ${action}`],
    };
  }

  const allowedParams = new Set(config.orderedParams);

  for (const key of Object.keys(params)) {
    if (BLOCKED_PARAM_NAMES.has(key)) {
      errors.push(`Blocked parameter: ${key}`);
      continue;
    }

    if (!allowedParams.has(key)) {
      errors.push(`Unsupported parameter: ${key}`);
    }
  }

  if (config.validate) {
    errors.push(...config.validate(params));
  }

  for (const [key, maxLength] of Object.entries(PARAM_LIMITS)) {
    if (hasValue(params[key]) && params[key].length > maxLength) {
      errors.push(`${key} must be ${maxLength} characters or less`);
    }
  }

  if (hasValue(params.paneType) && !ALLOWED_PANE_TYPES.has(params.paneType)) {
    errors.push("paneType must be tab, split, or window");
  }

  if (errors.length === 0) {
    const uri = composeObsidianUri(action, params);

    if (uri.length > MAX_OBSIDIAN_URI_LENGTH) {
      errors.push(`Obsidian URI must be ${MAX_OBSIDIAN_URI_LENGTH} characters or less`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function buildObsidianUri(action, params) {
  const validation = validateRequest(action, params);

  if (!validation.ok) {
    throw new Error(validation.errors.join("; "));
  }

  return composeObsidianUri(action, params);
}

export function buildGatewayUrl(action, params, baseUrl, options = {}) {
  const validation = validateRequest(action, params);

  if (!validation.ok) {
    throw new Error(validation.errors.join("; "));
  }

  if (!GATEWAY_ROUTES.has(action)) {
    throw new Error(`Unsupported route: ${action}`);
  }

  const url = new URL(`${action}/`, baseUrl);
  url.hash = composeHashParams(action, params, {
    autoopen: options.autoopen === true,
  });

  return url.toString();
}

export function createLinkState(action, locationLike) {
  const params = parseParamsFromLocation(locationLike);
  const { actionParams, controls } = splitGatewayParams(params);
  const validation = validateRequest(action, actionParams);

  if (!validation.ok) {
    return {
      ok: false,
      action,
      params: actionParams,
      controls,
      errors: validation.errors,
      obsidianUri: "",
    };
  }

  return {
    ok: true,
    action,
    params: actionParams,
    controls,
    errors: [],
    obsidianUri: buildObsidianUri(action, actionParams),
  };
}
