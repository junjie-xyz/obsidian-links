import { buildGatewayUrl, createLinkState, parseObsidianUri } from "./obsidian-links.js";

const PAGE_CONFIG = {
  open: {
    title: "Open in Obsidian",
    valueLabel: "File",
    valueKey: "file",
    openLabel: "Open Obsidian",
    copyValueLabel: "Copy File Path",
  },
  search: {
    title: "Search in Obsidian",
    valueLabel: "Query",
    valueKey: "query",
    openLabel: "Search in Obsidian",
    copyValueLabel: "Copy Search Query",
  },
  new: {
    title: "Create in Obsidian",
    openLabel: "Create in Obsidian",
  },
  daily: {
    title: "Daily Note in Obsidian",
    openLabel: "Open Daily Note",
  },
  unique: {
    title: "Unique Note in Obsidian",
    openLabel: "Create Unique Note",
  },
  "choose-vault": {
    title: "Choose Obsidian Vault",
    openLabel: "Open Vault Manager",
  },
  "hook-get-address": {
    title: "Get Hook Address",
    openLabel: "Get Hook Address",
  },
};

function appendDetail(list, label, value) {
  const term = document.createElement("dt");
  const description = document.createElement("dd");

  term.textContent = label;
  description.textContent = value;

  list.append(term, description);
}

function setButtonCopied(button) {
  const originalText = button.textContent;

  button.textContent = "Copied";
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1400);
}

async function copyText(text) {
  if (!navigator.clipboard) {
    throw new Error("Clipboard is unavailable");
  }

  await navigator.clipboard.writeText(text);
}

function renderLinkPage(root, action, config) {
  const state = createLinkState(action, window.location);
  const shouldAutoOpen = state.controls.autoopen;

  const status = root.querySelector("[data-status]");
  const details = root.querySelector("[data-details]");
  const uri = root.querySelector("[data-uri]");
  const openButton = root.querySelector("[data-open]");
  const copyUriButton = root.querySelector("[data-copy-uri]");
  const copyValueButton = root.querySelector("[data-copy-value]");

  details.replaceChildren();

  openButton.textContent = config.openLabel;
  copyValueButton.textContent = config.copyValueLabel || "Copy Value";
  copyValueButton.hidden = !config.valueKey || !state.params[config.valueKey];
  openButton.onclick = null;
  copyUriButton.onclick = null;
  copyValueButton.onclick = null;

  if (!state.ok) {
    status.textContent = state.errors.join(". ");
    status.dataset.state = "error";
    uri.textContent = "No URI generated.";
    openButton.disabled = true;
    copyUriButton.disabled = true;
    copyValueButton.disabled = true;

    for (const [key, value] of Object.entries(state.params)) {
      appendDetail(details, key, value);
    }

    return;
  }

  status.textContent = "Ready";
  status.dataset.state = "ready";
  uri.textContent = state.obsidianUri;
  openButton.disabled = false;
  copyUriButton.disabled = false;
  copyValueButton.disabled = false;

  for (const [key, value] of Object.entries(state.params)) {
    appendDetail(details, key, value);
  }

  if (Object.keys(state.params).length === 0) {
    appendDetail(details, "Action", action);
  }

  openButton.onclick = () => {
    window.location.href = state.obsidianUri;
  };

  copyUriButton.onclick = async () => {
    try {
      await copyText(state.obsidianUri);
      setButtonCopied(copyUriButton);
    } catch {
      status.textContent = "Copy failed";
      status.dataset.state = "error";
    }
  };

  copyValueButton.onclick = async () => {
    if (!config.valueKey) return;

    try {
      await copyText(state.params[config.valueKey]);
      setButtonCopied(copyValueButton);
    } catch {
      status.textContent = "Copy failed";
      status.dataset.state = "error";
    }
  };

  if (shouldAutoOpen) {
    window.location.href = state.obsidianUri;
  }
}

function initLinkPage() {
  const root = document.querySelector("[data-action]");

  if (!root) return;

  const action = root.dataset.action;
  const config = PAGE_CONFIG[action];

  if (!config) return;

  document.title = `${config.title} · Obsidian Links`;
  renderLinkPage(root, action, config);
  window.addEventListener("hashchange", () => renderLinkPage(root, action, config));
  window.addEventListener("popstate", () => renderLinkPage(root, action, config));
}

function initConverter() {
  const root = document.querySelector("[data-converter]");

  if (!root) return;

  const form = root.querySelector("[data-converter-form]");
  const input = root.querySelector("[data-converter-input]");
  const status = root.querySelector("[data-converter-status]");
  const output = root.querySelector("[data-converter-output]");
  const copyButton = root.querySelector("[data-converter-copy]");
  const openButton = root.querySelector("[data-converter-open]");
  const autoopenInput = root.querySelector("[data-converter-autoopen]");

  let gatewayUrl = "";

  function setDisabled(disabled) {
    copyButton.disabled = disabled;
    openButton.disabled = disabled;
  }

  function renderResult() {
    const parsed = parseObsidianUri(input.value);

    if (!parsed.ok) {
      gatewayUrl = "";
      status.textContent = parsed.errors.join(". ");
      status.dataset.state = "error";
      output.textContent = "No HTTPS link generated.";
      setDisabled(true);
      return;
    }

    try {
      gatewayUrl = buildGatewayUrl(parsed.action, parsed.params, `${window.location.origin}/`, {
        autoopen: autoopenInput?.checked === true,
      });
    } catch (error) {
      gatewayUrl = "";
      status.textContent = error.message;
      status.dataset.state = "error";
      output.textContent = "No HTTPS link generated.";
      setDisabled(true);
      return;
    }

    status.textContent = "Ready";
    status.dataset.state = "ready";
    output.textContent = gatewayUrl;
    setDisabled(false);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderResult();
  });

  autoopenInput?.addEventListener("change", () => {
    if (input.value.trim().length > 0) {
      renderResult();
    }
  });

  input.addEventListener("input", () => {
    if (input.value.trim().length === 0) {
      gatewayUrl = "";
      status.textContent = "Paste an Obsidian URI";
      status.dataset.state = "neutral";
      output.textContent = "No HTTPS link generated.";
      setDisabled(true);
      return;
    }

    renderResult();
  });

  copyButton.addEventListener("click", async () => {
    if (!gatewayUrl) return;

    try {
      await copyText(gatewayUrl);
      setButtonCopied(copyButton);
    } catch {
      status.textContent = "Copy failed";
      status.dataset.state = "error";
    }
  });

  openButton.addEventListener("click", () => {
    if (!gatewayUrl) return;
    window.location.href = gatewayUrl;
  });
}

initLinkPage();
initConverter();
