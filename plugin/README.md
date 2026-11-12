# Open Klant

A Valtimo external plugin, scaffolded with `valtimo-plugin-init`. It compiles to WebAssembly, is
packaged as a `.zip`, and is uploaded to a Valtimo plugin host.

## Project structure

```
manifest.json     # Identity, translations, configuration schema, actions, permissions
package.json      # Build scripts and the @valtimo/plugin-sdk dependency
tsconfig.json     # Type-checking only — esbuild does the compiling
src/
  plugin.ts       # Every handler this plugin registers, each with a comment explaining it
frontend/         # React bundles rendered in an iframe, if this project has any (see below)
dist/             # Build output (gitignored): plugin.wasm and open-klant-0.1.0.zip
```

## Build and pack

```bash
npm install
npm run build:pack     # -> dist/open-klant-0.1.0.zip
```

`build` bundles `src/plugin.ts` and compiles it to `dist/plugin.wasm`; `pack` validates
`manifest.json`, compiles any `frontend/*.tsx` bundle, and zips everything into an uploadable
package. **The first build is slow** — it downloads the Wasm toolchain (`extism-js` and binaryen).
The download is cached per user, so later builds take seconds.

Run `npx tsc --noEmit` to type-check without building.

## Upload and activate

Upload the `.zip` to a running plugin host over its signed admin API. Inside the Valtimo plugin-host
repository that is:

```bash
npm run plugin:upload -- dist/open-klant-0.1.0.zip
```

Then, in the GZAC admin UI: activate the plugin version (accepting the capabilities
`manifest.json` declares under `permissions`), create a configuration of it, and wire its action
onto a BPMN service task via a process link. The action writes a `greeting` process variable.

## Editing the plugin

- **`src/plugin.ts`** — add handlers. `action("key", …)` runs from a process link, `onEvent(…)`
  receives platform events, `request("/path", …)` serves JSON to this plugin's own iframes.
- **`manifest.json`** — every handler needs a matching declaration. An `action` needs an entry in
  `actions[]`; an `onEvent` handler needs the event type in `eventSubscriptions`; anything that uses
  a host function (`log`, `gzacApi`, `kv`, `httpRequest`) or serves iframe data needs the capability
  in `permissions.capabilities`.
- **`translations`** — the plugin's name, description and every UI string, per locale. There are no
  top-level `name`/`description` fields; each declared locale must carry both.
- **`configurationSchema`** — the JSON Schema for what an administrator fills in per configuration.
  Read those values with `config.get("key")`.

### Pinning a GZAC version range

`manifest.json` may declare which GZAC versions the plugin supports. It is optional and left out by
default, because a range that is wrong is worse than no range at all:

```json
"compatibility": {"minGzacVersion": "12.0.0", "maxGzacVersion": "12.1.0"}
```

## Learn more

- [`@valtimo/plugin-sdk` README](https://www.npmjs.com/package/@valtimo/plugin-sdk) — the full SDK
  API: host functions, capabilities, egress declarations, and the browser-side iframe SDK.
- The `case-summary` sample plugin in the Valtimo plugin-host repository — the reference for
  everything this scaffold leaves out: `gzacApi` calls back into GZAC, outbound `httpRequest` with
  egress grants, the `kv` store, several bundles of the same type, and the other two levels of
  task-form submission.

## The configuration bundle (`frontend/config.tsx`)

An administrator creating a configuration of this plugin sees this React bundle in an iframe instead
of a form generated from `configurationSchema`. It collects the configuration *title* (required —
the form is invalid without it) and the `greeting` property, and reports both to the Valtimo parent
through `sdk.setConfiguration(valid, title, data)`.

Everything user-visible comes from `sdk.t(key)`, backed by the `config.*` keys in each
`translations` bucket in `manifest.json`. The bundle mounts inside `sdk.ready().then(…)` because
before that resolves `sdk.t()` returns the raw key.

`npm run pack` compiles `frontend/config.tsx` into `config.bundle.js` — the file
`frontend/config.html` loads — and includes both in the package. The compiled bundle is a build
artifact and is gitignored.

## The process-link action form (`frontend/action-config.tsx`)

When an administrator wires this plugin's action onto a BPMN task, the process-link stepper shows
this React bundle instead of the form it would otherwise generate from `actions[].properties`. It
configures **one use** of the action; `frontend/config.tsx` configures the plugin as a whole.

The values it reports through `sdk.setConfiguration(valid, "", data)` arrive as
`input.properties` in the `action("open-klant", …)` handler in `src/plugin.ts`. The title
argument is empty on purpose — a process link has no name of its own.

GZAC matches this bundle to the action by `key`, which is why the bundle is keyed `open-klant`,
exactly like `actions[0]`.

The action could also declare `outputs` in `manifest.json` to map its result onto process
variables. It doesn't here: `outputs` is a runtime contract — a completed action whose `result`
omits a declared key is rejected — and that is a sharp edge to leave behind an example.
