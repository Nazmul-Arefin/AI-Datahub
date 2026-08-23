# WeChat Personal Auto-Reply — টেস্ট রিপোর্ট (বাংলা)

তারিখ: 2026-08-21  
লোকেশন: `tools/wechat-personal-bridge/`

## বসের চাহিদা (যা বুঝেছি)

- বস/বন্ধু **আপনার আসল WeChat** এ মেসেজ দিলে AI **আপনার নামে** সেই চ্যাটেই রিপ্লাই দেবে।
- আলাদা **WeixinClawBot** চ্যাট নয়।
- আপাতত শুধু whitelist: Weixin ID **`nazmularefin`** (Nazmul Arefin)।

## আমরা কী বানিয়েছি

Windows এ চলার জন্য একটি **নিরাপদ bridge** (WeChatFerry / `wcferry`):

- শুধু allowlist কন্টাক্ট
- গ্রুপ মেসেজ বন্ধ
- নিজের মেসেজে রিপ্লাই বন্ধ
- ডিফল্ট **dry-run** (পাঠায় না, শুধু লগ)
- ডিফল্ট **enabled=false** (ম্যানুয়ালি চালু করতে হয়)
- ৪৫ সেকেন্ড cooldown + ঘণ্টায় সর্বোচ্চ ১২ রিপ্লাই
- কন্ট্রোল API: `http://127.0.0.1:8765` (`/enable`, `/disable`, `/status`)

## টেস্ট রেজাল্ট (এখন যা করেছি)

| টেস্ট | ফল |
| --- | --- |
| Unit tests (allowlist / group / disable / cooldown) | **7/7 PASS** |
| Self-test simulation (`nazmularefin` হ্যাঁ, stranger না) | **PASS** |
| `wcferry` import (v39.5.2.0) | **OK** |
| Live WeChat inject + আসল রিপ্লাই পাঠানো | **এখন করা হয়নি (সেফটি)** |

## গুরুত্বপূর্ণ ব্লকার (আপডেট 2026-08-21)

Tencent এখন পুরনো **WeChat 3.9.x** এ লগইন ব্লক করে (“version is outdated”)。  
তাই **wcferry Option B এই মেশিনে আর ব্যবহারযোগ্য নয়**।

**এখন করণীয়:** নতুন **Weixin / WeChat PC 4.x** ইনস্টল করে স্বাভাবিকভাবে ব্যবহার করুন।  
পুরনো 3.9 জোর করে চালানো / ভার্সন স্পুফ করা — অ্যাকাউন্ট ঝুঁকি, আমরা করব না।

### ডেমো বিকল্প (৩.৯ বন্ধ হওয়ার পর)

1. **AstrBot ClawBot (আগে যা কানেক্ট)** — আলাদা AI কন্টাক্ট; “আপনার নামে” নয়।
2. **নতুন আনুষ্ঠানিক iLink** — মূলত বট আইডেন্টিটি; ব্যক্তিগত অ্যাকাউন্ট হিসেবে রিপ্লাই গ্যারান্টি নেই।
3. **আসল নামে অটো-রিপ্লাই** — পুরনো PC hook ছাড়া আজ রাতের মধ্যে নির্ভরযোগ্য পাথ নেই।

---

## কীভাবে কানেক্ট ও টেস্ট করবেন (ধাপে ধাপে)

### A) নিরাপদ টেস্ট (এখনই করা যায় — মেসেজ যাবে না)

1. PowerShell খুলুন:

```bat
cd "D:\Office\AI Data Hub\AI-Datahub\github\v2\v3.2\tools\wechat-personal-bridge"
.\.venv\Scripts\activate
python bridge.py --self-test
```

2. আউটপুটে `nazmularefin` কেস **OK** দেখতে হবে, অন্য কন্টাক্ট **রিপ্লাই পাবে না**।

### B) লাইভ ডেমো (শুধু WeChat 3.9.12.51 ইনস্টলের পর)

**ধাপ ১ — কনফিগ চেক** (`config.yaml`):

- `allowlist: [nazmularefin]`
- প্রথমে `dry_run: true`, `enabled: false` রাখুন

**ধাপ ২ — WeChat 3.9 লগইন** করে খোলা রাখুন।

**ধাপ ৩ — ড্রাই-রান + রিয়েল অ্যাটাচ (পাঠাবে না):**

```bat
REM config এ dry_run: true রাখুন
python bridge.py --live
```

লগে দেখুন: `Allowlist target 'nazmularefin' matched` — না দেখলে সেই চ্যাট একবার খুলে রাখুন।

**ধাপ ৪ — Nazmul থেকে টেস্ট মেসেজ** পাঠান।  
লগে দেখাবে: `DRY-RUN would reply to ...` — মানে লজিক ঠিক, কিন্তু পাঠানো হয়নি।

**ধাপ ৫ — আসল রিপ্লাই চালু (সতর্ক):**

1. Bridge বন্ধ করুন (Ctrl+C)
2. `config.yaml` এ `dry_run: false`
3. চালান: `python bridge.py --live`
4. অন্য টার্মিনালে:

```bat
curl -X POST http://127.0.0.1:8765/enable
```

5. Nazmul আবার টেক্সট পাঠাক → **আপনার আসল অ্যাকাউন্ট থেকে** টেমপ্লেট রিপ্লাই যাবে।

**ধাপ ৬ — বন্ধ করতে:**

```bat
curl -X POST http://127.0.0.1:8765/disable
```

অথবা bridge প্রসেস বন্ধ করুন।

---

## অ্যাকাউন্ট সেফটি টিপস

- প্রথমে সবসময় **dry-run** দিয়ে দেখুন।
- শুধু **একজন** (`nazmularefin`) — সবাইকে খুলে দেবেন না।
- ঘন ঘন অনেক মেসেজ অটো-রিপ্লাই করবেন না (লিমিট আছে)।
- ডেমোর সময় WeChat 3.9 ছাড়া অন্য অটোমেশন টুল একসাথে চালাবেন না।
- সন্দেহ হলে সাথে সাথে `/disable` বা Ctrl+C।

## বর্তমান রিপ্লাই টেক্সট

টেমপ্লেট (নিরাপদ):

> Hi — I'm tied up right now and will reply properly soon. (auto-reply)

পরে চাইলে `reply_mode: llm` + `DEEPSEEK_API_KEY` দিয়ে স্মার্ট রিপ্লাই করা যাবে।

---

## সারাংশ

- **কোড + সেফটি টেস্ট: রেডি**
- **লাইভ অটো-রিপ্লাই: WeChat 3.9.12.51 ইনস্টলের অপেক্ষা**
- ClawBot চ্যাট ≠ এই ফিচার; এই bridge ই “আপনার নামে বসকে রিপ্লাই”

WeChat 3.9 ইনস্টল করে দিলে বলুন — পরের ধাপে একসাথে dry-run → enable করে লাইভ ভেরিফাই করব।
