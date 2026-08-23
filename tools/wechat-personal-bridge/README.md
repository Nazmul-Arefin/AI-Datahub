# WeChat personal auto-reply bridge (safe demo)

Windows host tool. Uses WeChatFerry against **WeChat PC 3.9.12.51** only.
Does **not** work with **Weixin 4.x**.

## Safety defaults

| Setting | Default | Meaning |
| --- | --- | --- |
| `enabled` | `false` | No replies until you enable |
| `dry_run` | `true` | Log only, never send |
| allowlist | `nazmularefin` | Only that Weixin ID |
| groups | blocked | 1:1 only |
| cooldown | 45s | Per contact |
| hourly cap | 12 | Global |

`--live` is also required before any real send. So two locks must open:
1. `dry_run: false` in config
2. `python bridge.py --live`
3. then `POST /enable` or `enabled: true`

## Commands

```bat
cd tools\wechat-personal-bridge
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m unittest discover -s tests -v
python bridge.py --self-test
python bridge.py
```

Live (only after WeChat 3.9.12.51 is installed + logged in):

```bat
REM edit config.yaml: dry_run: false
python bridge.py --live
curl -X POST http://127.0.0.1:8765/enable
```
