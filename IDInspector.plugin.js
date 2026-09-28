/**
 * @name IDInspector
 * @author datae
 * @description Inspect user details and download avatars/banners.
 * @version 1.1.8
 */

module.exports = class IDInspector {
    start() {
        // Only show notice if it hasn't been shown before
        const hasShownNotice = BdApi.Data.load("IDInspector", "hasShownNotice");
        if (!hasShownNotice) {
            BdApi.UI.showNotice("ID Inspector Enabled!", { type: "info", timeout: 2000 });
            BdApi.Data.save("IDInspector", "hasShownNotice", true);
        }

        this.unpatchContextMenu = BdApi.ContextMenu.patch("user-context", (menu, { user, guildId }) => {
            if (!user) return;

            menu.props.children.push(
                BdApi.ContextMenu.buildItem({
                    type: "text",
                    label: "Inspect User ID",
                    id: "inspect-user-id",
                    action: () => {
                        this.showInspectorModal(user, guildId);
                    }
                })
            );
        });
    }

    stop() {
        if (this.unpatchContextMenu) this.unpatchContextMenu();
    }

    showInspectorModal(user, guildId) {
        const userId = user.id;
        const epoch = 1420070400000n;
        const creationTimestamp = Number((BigInt(userId) >> 22n) + epoch);
        const creationDate = new Date(creationTimestamp).toUTCString();

        const formatAvatar = (avatarHash, pathId) => {
            if (!avatarHash) {
                return `https://cdn.discordapp.com/embed/avatars/${(BigInt(userId) >> 22n) % 5n}.png`;
            }
            const isAnimated = avatarHash.startsWith("a_");
            const ext = isAnimated ? "gif" : "png";
            return `https://cdn.discordapp.com/avatars/${pathId}/${avatarHash}.${ext}?size=4096`;
        };

        const initialAvatar = formatAvatar(user.avatar, userId);

        const InspectorView = () => {
            const [avatarUrl, setAvatarUrl] = BdApi.React.useState(initialAvatar);
            const [bannerUrl, setBannerUrl] = BdApi.React.useState(null);

            BdApi.React.useEffect(() => {
                const ProfileStore = BdApi.Webpack.getStore("UserProfileStore");
                const Fetcher = BdApi.Webpack.getModule(m => m?.fetchProfile && m?.getUserProfile === undefined);

                const extractFromCache = () => {
                    if (!ProfileStore) return false;
                    const cached = ProfileStore.getUserProfile(userId);
                    const guildMember = guildId && ProfileStore.getGuildMemberProfile ? ProfileStore.getGuildMemberProfile(userId, guildId) : null;

                    const bannerHash = guildMember?.banner || cached?.banner || user?.banner;
                    if (bannerHash) {
                        const isAnimated = bannerHash.startsWith("a_");
                        const ext = isAnimated ? "gif" : "png";
                        const path = (guildMember?.banner && guildId) ? `guilds/${guildId}/users/${userId}` : `${userId}`;
                        setBannerUrl(`https://cdn.discordapp.com/banners/${path}/${bannerHash}.${ext}?size=4096`);
                    }

                    const avatarHash = guildMember?.avatar || cached?.user?.avatar || user?.avatar;
                    if (avatarHash) {
                        const path = (guildMember?.avatar && guildId) ? `guilds/${guildId}/users/${userId}` : `${userId}`;
                        setAvatarUrl(formatAvatar(avatarHash, path));
                    }

                    return !!bannerHash;
                };

                const found = extractFromCache();

                if (!found && Fetcher?.fetchProfile) {
                    Fetcher.fetchProfile(userId, { guildId, withMutualGuilds: false }).then(() => {
                        extractFromCache();
                    }).catch(() => {});
                }
            }, []);

            return BdApi.React.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: "12px", color: "#dbdee1", fontFamily: "sans-serif" } },
                [
                    BdApi.React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "12px" } }, [
                        BdApi.React.createElement("img", { src: avatarUrl, style: { width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" } }),
                        BdApi.React.createElement("div", null, [
                            BdApi.React.createElement("h3", { style: { margin: 0, color: "#f2f3f5" } }, user.globalName || user.username),
                            BdApi.React.createElement("span", { style: { fontSize: "0.85rem", color: "#b5bac1" } }, `@${user.username}`)
                        ])
                    ]),
                    BdApi.React.createElement("hr", { style: { borderColor: "rgba(255,255,255,0.1)", margin: "4px 0" } }),
                    BdApi.React.createElement("p", { style: { margin: 0 } }, [
                        BdApi.React.createElement("strong", null, "User ID: "),
                        BdApi.React.createElement("code", { style: { background: "#1e1f22", padding: "2px 6px", borderRadius: "4px" } }, userId)
                    ]),
                    BdApi.React.createElement("p", { style: { margin: 0 } }, [
                        BdApi.React.createElement("strong", null, "Created On: "),
                        creationDate
                    ]),
                    BdApi.React.createElement("div", { style: { display: "flex", gap: "10px", marginTop: "10px" } }, [
                        BdApi.React.createElement("button", {
                            style: {
                                background: "#5865F2",
                                color: "#ffffff",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "500",
                                flex: "1"
                            },
                            onClick: () => window.open(avatarUrl, "_blank")
                        }, "Get Avatar"),
                        BdApi.React.createElement("button", {
                            style: {
                                background: bannerUrl ? "#5865F2" : "#4e5058",
                                color: "#ffffff",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                cursor: bannerUrl ? "pointer" : "default",
                                fontWeight: "500",
                                flex: "1"
                            },
                            onClick: () => {
                                if (bannerUrl) {
                                    window.open(bannerUrl, "_blank");
                                } else {
                                    BdApi.UI.showNotice("This user does not have a custom banner.", { type: "warning" });
                                }
                            }
                        }, bannerUrl ? "Get Banner" : "No Banner")
                    ])
                ]
            );
        };

        BdApi.UI.alert("ID Inspector", BdApi.React.createElement(InspectorView));
    }
};