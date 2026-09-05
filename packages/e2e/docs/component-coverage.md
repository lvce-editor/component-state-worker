# Live component state coverage

Each `edit-live-*` test first displays the component, finds its named inspector
card, clicks the card, checks the JSON tab and component identity (`uid`, or `id` for Source Control), and changes the JSON
through `Editor.setText`. The final assertion checks the component's rendered UI
without saving the file. Tabs belong to Main; menu entries belong to TitleBar.

| Component       | Observable live edit                                                     |
| --------------- | ------------------------------------------------------------------------ |
| Explorer        | Item label and focused item                                              |
| TitleBar        | Window title and menu item label                                         |
| Main            | Existing tab label                                                       |
| StatusBar       | Status item label                                                        |
| Search          | Search input                                                             |
| Extensions      | Extension search input                                                   |
| ExtensionDetail | Extension name                                                           |
| Problems        | Filter input                                                             |
| ProcessExplorer | Error message                                                            |
| Source Control  | Provider unavailable message                                             |
| ExtensionView   | Counter text; existing dependency skip retained                          |
| SimpleBrowser   | Address input; skipped because browser CI lacks Electron WebContentsView |

The `unavailable-*` cases individually display these components and check their
named, disabled cards with `componentStateView.showUnavailableComponents` enabled:

- ActivityBar
- Chat
- ComponentState
- Debug Console
- Editor
- FileWatcherExplorer
- IframeInspector
- KeyBindings
- LanguageModels
- Layout
- Output
- Panel
- Ports
- Run And Debug
- RunningExtensions
- SecondarySideBar
- Secrets
- Settings
- SideBar

These components currently lack an editable component state API. Their cases
assert that limitation explicitly and fail if the API becomes available, so the
case can be replaced with a JSON-opening and live-edit regression. The existing
`unavailable-components-hidden` test covers the default hidden-card behavior.

This covers the persistent workbench views accessible in the standalone browser
harness. Transient dialogs/popups, media and webviews requiring separate fixtures,
and legacy viewlets without a numeric component UID are outside this inventory.
