# Playbook: Upgrading the FUXA client to a newer Angular major

Taken from the Angular 18.2.14 → 22.2.3 upgrade of `client/` (branch `devin/1792261543-angular-22-upgrade`, PR mishelly-h/FUXA#1). The steps also apply to later upgrades of one or more majors.

## Goal

Move `client/` to the newest stable Angular major. Done means:

- `npx ng build -c production` passes and `npm run lint` passes.
- The visualization features still work: charts (ng2-charts), gridster cards, CodeMirror editors, popup/iframe drag and resize.
- The Electron app in `app/electron/` still packages and serves the new build.
- `client/dist` keeps its flat layout, so no paths change in Electron, Docker, `server/main.js` or CI.

## Prerequisites

- Node from nvm. In non-login shells node/npx are **not on PATH**. Run `source ~/.nvm/nvm.sh` (or `export PATH=~/.nvm/versions/node/<ver>/bin:$PATH`) before every command.
- npm 11 or newer. `npm install` in both `client/` and `server/` (the environment blueprint does this).
- A clean tree on a new branch: `git checkout -b devin/$(date +%s)-angular-<N>-upgrade`.
- `client/dist` is tracked in git and every build overwrites it. Restore it before each commit:
  `git checkout -- client/dist && git clean -fdq client/dist`
  The PR template says not to commit `client/dist`.

## 0. Survey

```bash
npm view @angular/core version                     # target major
cd client
grep -rl '@NgModule' src/app                       # how much NgModule code exists
for p in @angular/core@<N> @angular-eslint/schematics@<N> angular-gridster2@<N> \
         @ctrl/ngx-codemirror ngx-color-picker ngx-toastr ng2-charts @ngx-translate/core \
         angular2-draggable html5-qrcode; do
  echo "== $p"; npm view "$p" version peerDependencies --json | head -20; done
grep -rn "client/dist\|'dist'" --include=*.js --include=*.json --include=Dockerfile --include=*.yml . | grep -v node_modules | grep -v '^./client/dist'
```

Write down each package's exact latest patch for every intermediate major (`npm view @angular/core@19 version`, etc.). The next step uses these numbers.

## 1. Go up one major at a time (19 → 20 → 21 → 22 ...)

Never skip a major. Each major's migrations assume the previous one.

### 1a. Try `ng update` first

```bash
npx ng update @angular/core@<N> @angular/cli@<N> @angular/material@<N> \
  @angular/cdk@<N> @angular-eslint/schematics@<N> --allow-dirty --force
```

**Pitfall:** In FUXA this usually fails during npm install with `ERESOLVE`. Peer ranges conflict, for example `typescript@">=5.5 <5.9"` for build-angular 19, or `@angular/compiler-cli@^20` against the old one. `--force` does not get past this reliably.

### 1b. Fallback: pin versions, reinstall, then run migrations only

Use a small script (`pin.js`) that sets every Angular package to its exact version:

```js
// node pin.js <core> <cdk/material> <cli/build-angular/build> <angular-eslint>
const fs = require('fs'); const [ng, cdk, cli, eslintNg] = process.argv.slice(2);
const p = JSON.parse(fs.readFileSync('package.json'));
for (const sec of ['dependencies', 'devDependencies']) for (const k of Object.keys(p[sec])) {
  if (['@angular/cdk', '@angular/material', '@angular/material-moment-adapter'].includes(k)) p[sec][k] = cdk;
  else if (['@angular/cli', '@angular-devkit/build-angular', '@angular/build'].includes(k)) p[sec][k] = cli;
  else if (k.startsWith('@angular-eslint/')) p[sec][k] = eslintNg;
  else if (k.startsWith('@angular/')) p[sec][k] = ng;
}
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
```

```bash
node ~/pin.js 20.3.34 20.2.14 20.3.40 20.7.0        # example: the Angular 20 step
# bump the companions for this major in package.json:
#   typescript (19: ~5.8, 20/21: ~5.9, 22: ~6.0)  zone.js (19: ~0.15, 21+: ~0.16)  angular-gridster2: ^<N>.0.0
rm -rf node_modules package-lock.json && npm install --no-audit --no-fund
npm ls 2>&1 | grep -E 'invalid|UNMET'                # should print nothing

# run each package's migrations, starting from the previous version
for pkg in "@angular/core <prev>" "@angular/cli <prev>" "@angular/material <prev>" \
           "@angular/cdk <prev>" "@angular-eslint/schematics <prev>"; do
  set -- $pkg; npx ng update $1 --migrate-only --from=$2 --allow-dirty; done
```

If one package's migration needs an explicit target, pass `--to`, e.g.
`npx ng update @angular/cli --migrate-only --from=19.2.27 --to=20.3.40 --allow-dirty`.

Versions used last time:

| Step | core | cdk/material | cli/build | angular-eslint | Other changes |
|------|------|--------------|-----------|----------------|-------|
| 19 | 19.2.25 | 19.2.19 | 19.2.27 | 19.8.1 | gridster ^19, TS ~5.8.3, zone.js ~0.15.1 |
| 20 | 20.3.34 | 20.2.14 | 20.3.40 | 20.7.0 | gridster ^20, TS ~5.9.3 |
| 21 | 21.2.25 | 21.2.14 | 21.2.27 | 21.4.0 | gridster ^21 (standalone API), zone.js ~0.16.0, control-flow migration |
| 22 | 22.2.3 | 22.2.3 | 22.2.3 | 22.6.0 | gridster ^22, TS ~6.0.3, ESLint 10 flat config |

### 1c. Gate each step

```bash
npx ng build -c production 2>&1 | grep -E 'Error|error|✘|Initial total'
npm run lint
git checkout -- dist && git clean -fdq dist
git add -A . && git commit -m "chore(client): upgrade to Angular <N>"
```

Make one commit per major so a reviewer can follow the upgrade step by step.

## 2. Third-party dependencies (what was decided)

| Package | Outcome |
|---------|---------|
| `angular2-draggable` | Unmaintained. Replaced with `@angular/cdk/drag-drop` (`cdkDrag`, `DragDropModule`). Added a small `_directives/box-resizable.directive.ts` for iframe panel resizing. Removed `node_modules/angular2-draggable/css/resizable.min.css` from `angular.json` styles. |
| `@ctrl/ngx-codemirror` | ^7.0.0. Stays on CodeMirror 5 (`codemirror ^5.65`); no CM6 migration needed. |
| `@ngx-translate/core` + `http-loader` | ^18. Setup moved to `provideTranslateService()` + `provideTranslateHttpLoader()`. |
| `ng2-charts` | ^11. Uses `provideCharts(withDefaultRegisterables())`. |
| `angular-gridster2` | Same major as Angular. From 21 on it uses the standalone component API. |
| `ngx-toastr` | 20.0.5 declares an Angular 21 peer but builds and runs on 22. Accepted. |
| `ngx-color-picker` | ^20.1.1 works. |

Removed Angular APIs to watch for: Angular 22 dropped `ComponentFactoryResolver`. Replace it with `ViewContainerRef.createComponent(Type)` or `createComponent(Type, { environmentInjector })`.

## 3. ESLint flat config

When angular-eslint requires it (22.x uses ESLint 10), delete `client/.eslintrc.json` and write `client/eslint.config.js` with `typescript-eslint` + `angular-eslint` (`tsRecommended`, `templateRecommended`, `processInlineTemplates`). Keep the repo's existing rule overrides. Turning off `@angular-eslint/prefer-inject` avoids hundreds of constructor-injection errors. Keep `unused-imports/no-unused-imports: error`; the new lint finds a few real unused imports that you need to fix.

## 4. Build system

```bash
npx ng update @angular/cli --name use-application-builder --allow-dirty
```

Afterwards, in `client/angular.json`:

- Set `outputPath: { "base": "dist", "browser": "" }`. **Without this the output moves to `dist/browser/`** and breaks the Electron, Docker, `server/main.js` and CI paths. With it, none of them need to change.
- Switch the builders to `@angular/build:*` (add `@angular/build` to devDeps). Remove `vendorChunk`/`buildOptimizer`; `main` becomes `browser`.

## 5. Standalone migration (after the final major)

Run all three modes in order and commit after each one:

```bash
npx ng g @angular/core:standalone --mode=convert-to-standalone --path=src/app --defaults
npx ng g @angular/core:standalone --mode=prune-ng-modules    --path=src/app --defaults
npx ng g @angular/core:standalone --mode=standalone-bootstrap --path=src     --defaults
```

The bootstrap step replaces `AppModule` with `bootstrapApplication` in `client/src/main.ts`. Keep `provideZoneChangeDetection()`, because going zoneless is not safe for this codebase.

**Pitfall: runtime circular imports.** The build passes, but `/` and `/lab` crash with `NG0919: Cannot read @NgModule metadata` or `NG0200: Circular dependency detected`. To find the cycles:

```bash
npx -y madge@8 --circular --extensions ts --ts-config tsconfig.json src/app
```

Fix: in the component `imports: [...]` arrays on the cycle, wrap the entry that closes the cycle in `forwardRef(() => X)` (e.g. `flex-event`, `fuxa-view-dialog`, `webcam-player-dialog`, `daterangepicker`).

## 6. Smoke test

```bash
(cd server && node main.js)   # API + built UI on :1881
(cd client && npm start)      # dev UI on :4200
```

Load `/`, `/editor`, `/lab`, `/device`, scripts, reports and alarms, and check the browser console for errors. A Playwright script that visits each route and prints `pageerror`/console errors is quick and finds NG09xx errors that `ng build` does not report.

Then test the visualization features by hand or with a recorded browser test: charts, the cards/gridster editor, popup and iframe drag, the iframe resize handle, and the CodeMirror script editor.

Problems found in that test, and their fixes:

- **NG0955 duplicate keys** in icon pickers: `@for (... ; track icon)` fails because two icons share a name. Use `track $index`.
- **Drag lost over iframes**: when the cursor moves into an iframe during a drag or resize, the drag stops. Add CSS `.cdk-drag-dragging iframe, .box-resizing iframe { pointer-events: none; }` in `src/styles.css`, and toggle `box-resizing` in the resize directive.

These also happen on the old Angular 18 build, so they are not regressions: charts disappear when a view opens itself as a popup, and the pie graph logs NG0100 in dev mode. Cards are not draggable at runtime by design.

## 7. Electron packaging check

Use the same steps the CI workflow uses:

```bash
cd client && npx ng build -c production && cd ..
rm -rf ~/electron-pack && cp -r app/electron ~/electron-pack && cd ~/electron-pack
mkdir -p server client/dist
rsync -a --exclude node_modules --exclude _db --exclude _logs --exclude _appdata ~/repos/FUXA/server/ server/
cp -r ~/repos/FUXA/client/dist/. client/dist/
(cd server && npm ci --omit=dev --no-audit --no-fund)
npm ci --no-audit --no-fund --ignore-scripts
npx electron-builder --dir --linux --x64
ls dist/linux-unpacked/resources/app/client/dist/index.html
```

Start the packaged server and confirm that index, the main bundle and `assets/i18n` load.

## 8. PR

- Restore `client/dist` before the final commit.
- PR description: the upgrade path, each third-party decision from section 2, zone.js kept, the build output path unchanged, and what was not tested (e.g. charts tested with demo data only).
- The repo has no CI checks, so the local build, lint and Electron results are the only verification. List them in the PR.
- If the diff is too big to review: the control-flow migration re-indents every template, and that churn dominates the diff. Consider a stack of PRs, one per major, with the control-flow change split into a semantic PR and a whitespace-only PR (`schematicOptions.format`). Standalone goes last.

## Pitfalls summary

1. node/npx missing from PATH in non-login shells. Source nvm first.
2. `ng update` ERESOLVE on peer ranges. Pin versions, do a clean install, then run `--migrate-only --from`.
3. Forgetting the TypeScript, zone.js or gridster bump that each major needs.
4. The application builder moves output to `dist/browser`. Set `outputPath.browser: ""`.
5. `client/dist` gets committed by accident. Restore it before every commit.
6. The standalone migration creates runtime circular imports that the build does not catch. Use madge plus `forwardRef`, and check pages in a real browser.
7. `ComponentFactoryResolver` was removed in 22.
8. CDK drag over iframes needs `pointer-events: none` on the iframes.
