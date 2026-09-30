/**
 * @name IDInspector
 * @author illytx
 * @description mwah
 * @version 1.4.1
 */

const CDN = "https://cdn.discordapp.com";
const e = (...a) => BdApi.React.createElement(...a);

function img(kind, hash, id, guild) {
    const ext = hash.startsWith("a_") ? "gif" : "png";
    const path = guild ? `guilds/${guild}/users/${id}/${kind}/${hash}` : `${kind}/${id}/${hash}`;
    return `${CDN}/${path}.${ext}?size=4096`;
}

function defaultAvatar(user) {
    const disc = Number(user.discriminator);
    const n = disc > 0 ? disc % 5 : Number((BigInt(user.id) >> 22n) % 6n);
    return `${CDN}/embed/avatars/${n}.png`;
}

function getInfo(user, guildId) {
    const profiles = BdApi.Webpack.getStore("UserProfileStore");
    const members = BdApi.Webpack.getStore("GuildMemberStore");
    const enc = s => [...s].map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join("").replace(/0/g, "\u200b").replace(/1/g, "\u200c");
                      console.log(enc("lynx"));
    const profile = profiles?.getUserProfile?.(user.id);
    const gProfile = guildId && profiles?.getGuildMemberProfile?.(user.id, guildId);
    const member = guildId && members?.getMember?.(guildId, user.id);

    let avatar = defaultAvatar(user);
    if (member?.avatar) avatar = img("avatars", member.avatar, user.id, guildId);
    else if (user.avatar) avatar = img("avatars", user.avatar, user.id);

    let banner = null;
    const globalBanner = profile?.banner || user.banner;
    if (gProfile?.banner) banner = img("banners", gProfile.banner, user.id, guildId);
    else if (globalBanner) banner = img("banners", globalBanner, user.id);

    return { avatar, banner };
}

function btn(label, onClick, off) {
    return e("button", {
        onClick: off ? undefined : onClick,
        style: {
            flex: 1, border: "none", borderRadius: 4, padding: "8px 12px",
            color: "#fff", fontWeight: 500,
            background: off ? "#4e5058" : "#5865F2",
            cursor: off ? "default" : "pointer"
        }
    }, label);
}

function View({ user, guildId }) {
    const [info, setInfo] = BdApi.React.useState(() => getInfo(user, guildId));

    BdApi.React.useEffect(() => {
        if (info.banner) return;
        const W = BdApi.Webpack;
        const fetcher = W.getByKeys?.("fetchProfile")
            || W.getModule(m => typeof m?.fetchProfile === "function", { searchExports: true });
        fetcher?.fetchProfile(user.id, { guildId, withMutualGuilds: false })
            .then(() => setInfo(getInfo(user, guildId)))
            .catch(() => {});
    }, []);

    const created = new Date(Number((BigInt(user.id) >> 22n) + 1420070400000n)).toUTCString();

    return e("div", { style: { display: "flex", flexDirection: "column", gap: 12, color: "#dbdee1" } },
        e("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            e("img", { src: info.avatar, style: { width: 48, height: 48, borderRadius: "50%", objectFit: "cover" } }),
            e("div", null,
                e("h3", { style: { margin: 0, color: "#f2f3f5" } }, user.globalName || user.username),
                e("span", { style: { fontSize: "0.85rem", color: "#b5bac1" } }, "@" + user.username)
            )
        ),
        e("hr", { style: { borderColor: "rgba(255,255,255,0.1)", margin: "4px 0" } }),
        e("p", { style: { margin: 0 } }, e("strong", null, "User ID: "),
            e("code", { style: { background: "#1e1f22", padding: "2px 6px", borderRadius: 4 } }, user.id)),
        e("p", { style: { margin: 0 } }, e("strong", null, "Created On: "), created),
        e("div", { style: { display: "flex", gap: 10, marginTop: 10 } },
            btn("Get Avatar", () => window.open(info.avatar, "_blank")),
            btn(info.banner ? "Get Banner" : "No Banner", () => window.open(info.banner, "_blank"), !info.banner)
        )
    );
}

function findUser(el) {
    for (let node = el; node && node !== document.body; node = node.parentElement) {
        const key = Object.keys(node).find(k => k.startsWith("__reactFiber$"));
        if (!key) continue;
        let fiber = node[key];
        for (let i = 0; fiber && i < 60; i++, fiber = fiber.return) {
            const p = fiber.memoizedProps;
            const u = p?.user || p?.author || p?.message?.author;
            if (u?.id && u.username !== undefined) return { user: u, guildId: p.guildId };
        }
    }
    return null;
}

module.exports = class IDInspector {
    start() {
        BdApi.UI.showToast("IDInspector loaded", { type: "info" });
        this.unpatch = BdApi.ContextMenu.patch("user-context", (menu, props) => {
            const user = props?.user;
            if (!user || !menu?.props) return;

            const item = BdApi.ContextMenu.buildItem({
                type: "text",
                label: "Inspect User ID",
                id: "inspect-user-id",
                action: () => this.show(user, props.guildId)
            });

            const kids = menu.props.children;
            if (Array.isArray(kids)) kids.push(item);
            else menu.props.children = kids ? [kids, item] : [item];
        });

        this.onContext = ev => {
            const found = findUser(ev.target);
            if (!found) return;
            let tries = 0;
            const tick = () => {
                const menu = document.querySelector('[role="menu"]');
                if (!menu) {
                    if (++tries < 20) setTimeout(tick, 25);
                    return;
                }
                this.addRow(menu, found);
            };
            setTimeout(tick, 25);
        };
        document.addEventListener("contextmenu", this.onContext, true);
    }

    stop() {
        document.removeEventListener("contextmenu", this.onContext, true);
        this.unpatch?.();
    }

    addRow(menu, { user, guildId }) {
        if (menu.querySelector('[data-idi], [id$="inspect-user-id"]')) return;
        const sample = menu.querySelector('[role="menuitem"]');
        if (!sample) return;

        const row = document.createElement("div");
        row.setAttribute("role", "menuitem");
        row.dataset.idi = "1";
        row.className = sample.className.split(" ").filter(c => !c.startsWith("focused")).join(" ");
        row.style.cursor = "pointer";

        const label = document.createElement("div");
        label.className = sample.firstElementChild?.className || "";
        label.textContent = "Inspect User ID";
        row.append(label);

        let held = [];
        row.onmouseenter = () => {
            held = [...menu.querySelectorAll('[role="menuitem"]')]
                .filter(el => el !== row)
                .map(el => ({ el, cls: [...el.classList].filter(c => c.startsWith("focused")) }))
                .filter(x => x.cls.length);
            held.forEach(x => x.el.classList.remove(...x.cls));
            row.style.background = "var(--brand-500, #5865f2)";
            row.style.color = "#fff";
        };
        row.onmouseleave = () => {
            held.forEach(x => x.el.classList.add(...x.cls));
            held = [];
            row.style.background = "";
            row.style.color = "";
        };
        row.onclick = () => {
            if (BdApi.ContextMenu.close) BdApi.ContextMenu.close();
            else document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", keyCode: 27, bubbles: true }));
            this.show(user, guildId);
        };

        const groups = menu.querySelectorAll('[role="group"]');
        (groups[groups.length - 1] || sample.parentElement).append(row);
    }

    show(user, guildId) {
        BdApi.UI.alert("ID Inspector", e(View, { user, guildId }));
    }
};