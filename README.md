# Component State Worker

Inspect and edit live LVCE Editor component state as JSON.

The worker provides the component-state grid view and the
`live-component-state:///<uid>.json` filesystem implementation used by LVCE
Editor.

## Development

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`, then run `Developer: Open Component State` from
the command palette. Select an editable component to open its live state as a
JSON file. Saving that file applies the new state to the running component.

Run the browser tests headlessly with:

```sh
npm run build
npm run build:static
npm run e2e:headless
```
