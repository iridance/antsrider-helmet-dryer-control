# NA ANTSRIDER Helmet Dryer & Sterilizer Controller

[繁體中文](README.md)

Control your NA ANTSRIDER helmet dryer and sterilizer over Bluetooth (Web Bluetooth) straight from the browser, with no WeChat mini-program needed.

**Use it online: <https://iridance.github.io/antsrider-helmet-dryer-control/>**

## Features

- Fan: off, or levels 1 to 10
- Timer: common presets from 5 minutes to 4 hours
- UV sterilization: on or off
- Auto-connect, Traditional Chinese / English, and four theme colors (lime, pink, teal, orange)
- Remembers your usage habits: fan, timer, and UV settings are kept across reloads, and "Start" applies your last combination

## Usage

1. Use Chrome or Edge on Android or desktop (Safari on iPhone does not support Web Bluetooth).
2. Disconnect the WeChat mini-program first. The device accepts only one connection at a time.
3. Open the link above, press "Connect", and choose `KT6328A-BLE-2.1`.

## Protocol

The device uses Bluetooth Low Energy with service `0xFFF0`. Commands are sent as write-without-response to characteristic `0xFFF1`:

| Function | Command |
| --- | --- |
| Fan 0 to 10 | `AA 01 <level>` |
| Timer (minutes, 16-bit) | `AA 02 <high byte> <low byte>` |
| UV | `AA 03 00 00 <1 on / 0 off>` |

`0xFFF2` is the notify characteristic. Data sent back by the device appears in the page's trace log.

## Run locally

A plain static page with no build step. Open `site/index.html` in Chrome, or run `python -m http.server -d site 8000` in the project folder and open `http://localhost:8000`.

## Deployment

GitHub Actions deploys `site/` to GitHub Pages only when a version tag (such as `v1.0.0`) is pushed. The footer version is taken from the tag, and pushing to `main` does not update the page.

```
git tag v1.0.0
git push origin v1.0.0
```

First-time setup:

1. In Settings → Pages, set Source to "GitHub Actions".
2. In Settings → Environments → github-pages, add a Tag rule `v*` under Deployment branches and tags.

## Disclaimer

This is an unofficial project and is not affiliated with the ANTSRIDER brand. Use at your own risk.

© [Irice](https://github.com/iridance). Released under the [MIT License](LICENSE).
