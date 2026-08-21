"""Generate scripts/fixtures/connectors.json (China-first catalog)."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


def c(
    id: str,
    name: str,
    category: str,
    description: str,
    scopes: list[str] | str,
    auth_type: str,
    availability: str,
    region: str = "global",
    nango: str | None = None,
    method: str | None = None,
) -> dict:
    row = {
        "id": id,
        "name": name,
        "category": category,
        "description": description,
        "scopes": scopes if isinstance(scopes, list) else [scopes],
        "auth_type": auth_type,
        "availability": availability,
        "region": region,
    }
    if nango:
        row["nango_provider_key"] = nango
    if method:
        row["method"] = method
    return row


def main() -> None:
    connectors: list[dict] = [
        c("local-device-bridge", "Local device bridge", "device", "Connect a phone, laptop, or USB device through an encrypted local bridge.", ["Selected device categories"], "api_key", "api_key"),
        c("local-folder", "Local folder", "files", "Import only the files and folders you choose.", ["Selected documents"], "api_key", "api_key"),
        c("notion", "Notion", "productivity", "Import selected workspace pages.", ["Selected workspace"], "nango", "live", "global", "notion", "Live"),
        c("telegram", "Telegram", "communication", "Connect Telegram as a messaging source (AstrBot).", ["Authorized chats"], "astrbot", "astrbot", method="AstrBot"),
        c("discord", "Discord", "communication", "Connect Discord as a messaging source (AstrBot).", ["Authorized servers"], "astrbot", "astrbot", method="AstrBot"),
        c("google-calendar", "Google Calendar", "productivity", "Sync events and availability for planning.", ["Event title", "Time & availability"], "nango", "live", "global", "google-calendar", "Live"),
        c("google-drive", "Google Drive", "files", "Sync selected folders for document retrieval.", ["Selected folders"], "nango", "coming_soon", "global", "google-drive"),
        c("gmail", "Gmail", "productivity", "Read selected mail for scheduling and follow-up.", ["Selected labels"], "nango", "coming_soon", "global", "google-mail"),
        c("github", "GitHub", "productivity", "Read selected repositories for project context.", ["Selected repositories"], "nango", "coming_soon", "global", "github"),
        c("linear", "Linear", "productivity", "Track issues and project status.", ["Issue titles", "Status"], "nango", "coming_soon", "global", "linear"),
        c("slack", "Slack", "productivity", "Connect selected channels for work context.", ["Selected channels"], "nango", "coming_soon", "global", "slack"),
        c("apple-fitness", "Apple Fitness", "health", "Import activity and sleep summaries.", ["Activity", "Sleep summary"], "nango", "coming_soon", "global", "apple-health"),
        c("deepsearch", "DeepSearch", "identity", "Public research queries that never run automatically.", ["Per-task query only"], "mcp_url", "mcp_url", method="MCP URL"),
        c("wechat", "微信 WeChat", "communication", "Import chosen chats for relationship context.", ["Chosen chats only"], "api_key", "api_key", "cn"),
    ]

    # AstrBot-ready China messaging (real bot connect via dashboard QR / env).
    astrbot_cn = [
        ("wecom", "企业微信 WeCom", "communication", "Work chats and org directory for China workplaces (AstrBot bot).", ["Selected chats", "Org contacts"]),
        ("wecom-ai", "企微智能机器人", "communication", "WeCom AI bot channel via AstrBot wecom_ai_bot.", ["Bot conversations"]),
        ("dingtalk", "钉钉 DingTalk", "communication", "Alibaba workplace messaging via AstrBot (One-click QR).", ["Selected chats", "Calendar"]),
        ("feishu", "飞书 Feishu / Lark", "productivity", "Docs, calendar, and chat via AstrBot lark (One-click QR).", ["Selected docs", "Calendar", "Chats"]),
        ("qq", "QQ", "communication", "QQ Official Bot via AstrBot (AppID + Secret).", ["Chosen chats"]),
    ]
    for cid, name, cat, desc, scopes in astrbot_cn:
        connectors.append(c(cid, name, cat, desc, scopes, "astrbot", "astrbot", "cn", method="AstrBot"))

    cn = [
        ("weibo", "微博 Weibo", "communication", "Public and followed posts for social context.", ["Followed feeds"]),
        ("douyin", "抖音 Douyin", "communication", "Short-video and creator activity signals (authorized scope).", ["Selected profiles"]),
        ("bilibili", "哔哩哔哩 Bilibili", "communication", "Watch history and favorites for interest context.", ["Favorites", "History"]),
        ("xiaohongshu", "小红书 Xiaohongshu", "communication", "Saved notes and lifestyle boards.", ["Saved notes"]),
        ("zhihu", "知乎 Zhihu", "identity", "Followed topics and answered questions for knowledge context.", ["Followed topics"]),
        ("baidu-netdisk", "百度网盘", "files", "Selected folders from Baidu Netdisk.", ["Selected folders"]),
        ("aliyun-drive", "阿里云盘", "files", "Selected folders from Aliyun Drive.", ["Selected folders"]),
        ("tencent-docs", "腾讯文档", "files", "Shared Tencent Docs for project context.", ["Selected documents"]),
        ("yuque", "语雀 Yuque", "files", "Knowledge base articles from Yuque.", ["Selected books"]),
        ("wps", "WPS 办公", "files", "WPS cloud documents you explicitly select.", ["Selected documents"]),
        ("netease-mail", "网易邮箱", "productivity", "Selected mailbox labels for follow-ups.", ["Selected labels"]),
        ("qq-mail", "QQ邮箱", "productivity", "Selected QQ Mail labels for follow-ups.", ["Selected labels"]),
        ("tencent-meeting", "腾讯会议", "productivity", "Upcoming meetings and notes metadata.", ["Meeting titles", "Time"]),
        ("netease-music", "网易云音乐", "health", "Listening habits as lifestyle signal (opt-in).", ["Recent plays"]),
        ("qq-music", "QQ音乐", "health", "Listening habits as lifestyle signal (opt-in).", ["Recent plays"]),
        ("keep", "Keep", "health", "Workouts and activity summaries.", ["Workouts", "Activity"]),
        ("huawei-health", "华为运动健康", "health", "Steps, sleep, and workout summaries.", ["Activity", "Sleep"]),
        ("meituan", "美团", "productivity", "Orders and local life schedule cues.", ["Recent orders"]),
        ("dianping", "大众点评", "productivity", "Saved places and dining preferences.", ["Saved places"]),
        ("didi", "滴滴出行", "productivity", "Trip history for commute planning.", ["Recent trips"]),
        ("amap", "高德地图", "productivity", "Saved places and commute routes.", ["Saved places", "Routes"]),
        ("baidu-maps", "百度地图", "productivity", "Saved places and commute routes.", ["Saved places"]),
        ("alipay", "支付宝", "productivity", "Bill and subscription summaries (user-authorized).", ["Bill summaries"]),
        ("taobao", "淘宝", "productivity", "Order history for purchase context.", ["Recent orders"]),
        ("jd", "京东", "productivity", "Order history for purchase context.", ["Recent orders"]),
        ("pinduoduo", "拼多多", "productivity", "Order history for purchase context.", ["Recent orders"]),
        ("ctrip", "携程 Ctrip", "productivity", "Trips and hotel bookings for travel goals.", ["Upcoming trips"]),
        ("rail-12306", "铁路12306", "productivity", "Train bookings for travel planning.", ["Upcoming tickets"]),
        ("ximalaya", "喜马拉雅", "health", "Listening / learning content preferences.", ["Subscriptions"]),
        ("weread", "微信读书", "files", "Reading progress and shelf for learning goals.", ["Shelf", "Progress"]),
    ]
    for i, (cid, name, cat, desc, scopes) in enumerate(cn):
        avail = "api_key" if i < 4 else "coming_soon"
        connectors.append(c(cid, name, cat, desc, scopes, "api_key", avail, "cn"))

    more = [
        ("kuaishou", "快手 Kuaishou", "communication", "cn", "Creator and watch signals (authorized).", ["Selected profiles"], "coming_soon", "api_key"),
        ("toutiao", "今日头条", "identity", "cn", "Followed channels for news context.", ["Followed channels"], "coming_soon", "api_key"),
        ("tencent-video", "腾讯视频", "communication", "cn", "Watchlist preferences.", ["Watchlist"], "coming_soon", "api_key"),
        ("iqiyi", "爱奇艺", "communication", "cn", "Watchlist preferences.", ["Watchlist"], "coming_soon", "api_key"),
        ("youku", "优酷", "communication", "cn", "Watchlist preferences.", ["Watchlist"], "coming_soon", "api_key"),
        ("eleme", "饿了么", "productivity", "cn", "Food order timing for daily planning.", ["Recent orders"], "coming_soon", "api_key"),
        ("hellobike", "哈啰出行", "productivity", "cn", "Mobility trips for commute context.", ["Recent trips"], "coming_soon", "api_key"),
        ("boss-zhipin", "BOSS直聘", "productivity", "cn", "Job search activity (user-authorized).", ["Applications"], "coming_soon", "api_key"),
        ("lagou", "拉勾", "productivity", "cn", "Job search activity (user-authorized).", ["Applications"], "coming_soon", "api_key"),
        ("maimai", "脉脉", "identity", "cn", "Professional network signals.", ["Profile"], "coming_soon", "api_key"),
        ("tencent-cloud", "腾讯云", "files", "cn", "Selected cloud objects via API key.", ["Selected buckets"], "api_key", "api_key"),
        ("aliyun-oss", "阿里云 OSS", "files", "cn", "Selected object storage via API key.", ["Selected buckets"], "api_key", "api_key"),
        ("coze", "扣子 Coze", "productivity", "cn", "Bot and workflow metadata via MCP URL.", ["Selected bots"], "mcp_url", "mcp_url"),
        ("dify", "Dify", "productivity", "cn", "Knowledge apps via MCP / API key.", ["Selected apps"], "mcp_url", "mcp_url"),
        ("fastgpt", "FastGPT", "productivity", "cn", "Knowledge base via API key.", ["Selected bases"], "api_key", "api_key"),
        ("tongyi", "通义 Tongyi", "productivity", "cn", "Assistant history export (authorized).", ["Selected chats"], "coming_soon", "api_key"),
        ("kimi", "Kimi 月之暗面", "productivity", "cn", "Assistant history export (authorized).", ["Selected chats"], "coming_soon", "api_key"),
        ("doubao", "豆包", "productivity", "cn", "Assistant history export (authorized).", ["Selected chats"], "coming_soon", "api_key"),
        ("wenxin", "文心一言", "productivity", "cn", "Assistant history export (authorized).", ["Selected chats"], "coming_soon", "api_key"),
        ("spark", "讯飞星火", "productivity", "cn", "Assistant history export (authorized).", ["Selected chats"], "coming_soon", "api_key"),
        ("tiangong", "天工", "productivity", "cn", "Assistant history export (authorized).", ["Selected chats"], "coming_soon", "api_key"),
        ("dropbox", "Dropbox", "files", "global", "Selected folders from Dropbox.", ["Selected folders"], "coming_soon", "nango", "dropbox"),
        ("onedrive", "OneDrive", "files", "global", "Selected folders from OneDrive.", ["Selected folders"], "coming_soon", "nango", "one-drive"),
        ("box", "Box", "files", "global", "Selected enterprise folders.", ["Selected folders"], "coming_soon", "nango", "box"),
        ("evernote", "Evernote", "files", "global", "Selected notebooks.", ["Notebooks"], "coming_soon", "api_key"),
        ("obsidian-sync", "Obsidian (vault MCP)", "files", "global", "Local/remote vault via MCP URL.", ["Vault notes"], "mcp_url", "mcp_url"),
        ("jira", "Jira", "productivity", "global", "Selected projects and issues.", ["Issues", "Projects"], "coming_soon", "nango", "jira"),
        ("asana", "Asana", "productivity", "global", "Selected projects and tasks.", ["Tasks"], "coming_soon", "nango", "asana"),
        ("trello", "Trello", "productivity", "global", "Selected boards.", ["Boards"], "coming_soon", "nango", "trello"),
        ("monday", "monday.com", "productivity", "global", "Selected boards.", ["Boards"], "coming_soon", "nango", "monday"),
        ("clickup", "ClickUp", "productivity", "global", "Selected spaces and tasks.", ["Tasks"], "coming_soon", "nango", "clickup"),
        ("todoist", "Todoist", "productivity", "global", "Task lists for daily planning.", ["Tasks"], "coming_soon", "nango", "todoist"),
        ("microsoft-todo", "Microsoft To Do", "productivity", "global", "Task lists for daily planning.", ["Tasks"], "coming_soon", "api_key"),
        ("outlook", "Outlook Mail", "productivity", "global", "Selected mailbox folders.", ["Selected folders"], "coming_soon", "nango", "outlook"),
        ("microsoft-teams", "Microsoft Teams", "communication", "global", "Selected channels and chats.", ["Channels"], "coming_soon", "nango", "microsoft-teams"),
        ("zoom", "Zoom", "productivity", "global", "Upcoming meetings metadata.", ["Meetings"], "coming_soon", "nango", "zoom"),
        ("linkedin", "LinkedIn", "identity", "global", "Profile and posts you authorize.", ["Profile"], "coming_soon", "nango", "linkedin"),
        ("twitter", "X (Twitter)", "communication", "global", "Followed feeds you authorize.", ["Feeds"], "coming_soon", "nango", "twitter"),
        ("facebook", "Facebook", "communication", "global", "Pages and groups you authorize.", ["Pages"], "coming_soon", "nango", "facebook"),
        ("instagram", "Instagram", "communication", "global", "Business account insights you authorize.", ["Insights"], "coming_soon", "nango", "instagram"),
        ("whatsapp", "WhatsApp Business", "communication", "global", "Business messaging via relay/API.", ["Business chats"], "coming_soon", "api_key"),
        ("spotify", "Spotify", "health", "global", "Listening habits (opt-in).", ["Recent plays"], "coming_soon", "nango", "spotify"),
        ("fitbit", "Fitbit", "health", "global", "Activity and sleep summaries.", ["Activity", "Sleep"], "coming_soon", "nango", "fitbit"),
        ("strava", "Strava", "health", "global", "Workouts and rides.", ["Activities"], "coming_soon", "nango", "strava"),
        ("garmin", "Garmin Connect", "health", "global", "Activity and sleep summaries.", ["Activity", "Sleep"], "coming_soon", "api_key"),
        ("reddit", "Reddit", "identity", "global", "Subscribed communities.", ["Subscriptions"], "coming_soon", "nango", "reddit"),
        ("youtube", "YouTube", "communication", "global", "Subscriptions and playlists.", ["Subscriptions"], "coming_soon", "nango", "google"),
        ("notion-mcp", "Notion MCP (remote)", "productivity", "global", "Bring your own Notion MCP server URL.", ["Server tools"], "mcp_url", "mcp_url"),
        ("github-mcp", "GitHub MCP (remote)", "productivity", "global", "Bring your own GitHub MCP server URL.", ["Server tools"], "mcp_url", "mcp_url"),
        ("filesystem-mcp", "Filesystem MCP", "files", "global", "Local filesystem tools via MCP URL.", ["Selected paths"], "mcp_url", "mcp_url"),
        ("browser-mcp", "Browser MCP", "identity", "global", "On-demand browser tools via MCP URL.", ["Per-task only"], "mcp_url", "mcp_url"),
        ("postgres-mcp", "Postgres MCP", "files", "global", "Read-only DB tools via MCP URL.", ["Selected schemas"], "mcp_url", "mcp_url"),
        ("figma", "Figma", "productivity", "global", "Selected files for design context.", ["Selected files"], "coming_soon", "nango", "figma"),
        ("airtable", "Airtable", "productivity", "global", "Selected bases.", ["Bases"], "coming_soon", "nango", "airtable"),
        ("hubspot", "HubSpot", "productivity", "global", "CRM records you authorize.", ["Contacts"], "coming_soon", "nango", "hubspot"),
        ("salesforce", "Salesforce", "productivity", "global", "CRM records you authorize.", ["Objects"], "coming_soon", "nango", "salesforce"),
        ("intercom", "Intercom", "communication", "global", "Support conversations you authorize.", ["Conversations"], "coming_soon", "nango", "intercom"),
        ("zendesk", "Zendesk", "communication", "global", "Tickets you authorize.", ["Tickets"], "coming_soon", "nango", "zendesk"),
        ("confluence", "Confluence", "files", "global", "Selected spaces.", ["Spaces"], "coming_soon", "nango", "confluence"),
        ("gitlab", "GitLab", "productivity", "global", "Selected projects.", ["Projects"], "coming_soon", "nango", "gitlab"),
        ("bitbucket", "Bitbucket", "productivity", "global", "Selected repositories.", ["Repositories"], "coming_soon", "nango", "bitbucket"),
        ("icloud", "iCloud Drive", "files", "global", "Selected folders (adapter).", ["Selected folders"], "coming_soon", "api_key"),
        ("amazon", "Amazon Orders", "productivity", "global", "Order history for purchase context.", ["Recent orders"], "coming_soon", "api_key"),
        ("uber", "Uber", "productivity", "global", "Trip history for commute planning.", ["Recent trips"], "coming_soon", "api_key"),
        ("google-maps", "Google Maps", "productivity", "global", "Saved places.", ["Saved places"], "coming_soon", "api_key"),
        ("apple-calendar", "Apple Calendar", "productivity", "global", "Selected calendars via device bridge.", ["Calendars"], "api_key", "api_key"),
        ("apple-mail", "Apple Mail", "productivity", "global", "Selected mailboxes via device bridge.", ["Mailboxes"], "api_key", "api_key"),
        ("samsung-health", "Samsung Health", "health", "global", "Activity summaries via adapter.", ["Activity"], "coming_soon", "api_key"),
        ("openai-mcp", "OpenAI MCP", "productivity", "global", "Bring your own OpenAI MCP / tools URL.", ["Tools"], "mcp_url", "mcp_url"),
        ("anthropic-mcp", "Anthropic MCP", "productivity", "global", "Bring your own Anthropic tools URL.", ["Tools"], "mcp_url", "mcp_url"),
    ]

    for row in more:
        cid, name, cat, region, desc, scopes, avail, auth = row[:8]
        nango = row[8] if len(row) > 8 else None
        connectors.append(c(cid, name, cat, desc, scopes, auth, avail, region, nango))

    seen: set[str] = set()
    unique: list[dict] = []
    for item in connectors:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        unique.append(item)

    path = Path(__file__).resolve().parents[1] / "app" / "fixtures" / "connectors.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    legacy = Path(__file__).resolve().parent / "fixtures" / "connectors.json"
    payload = {
        "version": 1,
        "market_priority": "cn",
        "notes": "Catalog cards only. availability=live|api_key|mcp_url|astrbot|coming_soon. Enable OAuth later without new routers.",
        "connectors": unique,
    }
    text = json.dumps(payload, ensure_ascii=False, indent=2)
    path.write_text(text, encoding="utf-8")
    legacy.parent.mkdir(parents=True, exist_ok=True)
    legacy.write_text(text, encoding="utf-8")
    print(f"wrote {len(unique)} connectors -> {path}")
    print(f"also wrote legacy copy -> {legacy}")
    print("availability", dict(Counter(i["availability"] for i in unique)))
    print("region", dict(Counter(i["region"] for i in unique)))
    print("category", dict(Counter(i["category"] for i in unique)))
    print("cn count", sum(1 for i in unique if i["region"] == "cn"))


if __name__ == "__main__":
    main()
