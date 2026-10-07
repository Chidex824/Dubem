// [route, icon, label]
export const MENUS = {
  seeker: {
    badge: ["info", "Seeker"],
    items: [
      ["/account", "bell", "Alerts"],
      ["/account", "bookmark", "Saved jobs"],
      ["/account", "upload", "CV"],
      ["/account", "user", "Profile"],
    ],
  },
  org: {
    badge: ["ok", "Verified organization"],
    items: [
      ["/post", "list", "My listings"],
      ["/post", "plus", "Post an opportunity"],
      ["/post", "chart", "Analytics"],
      ["/post", "user", "Profile"],
    ],
  },
  admin: {
    badge: ["info", "Admin"],
    items: [
      ["/admin", "shield", "Moderation queue"],
      ["/admin", "chart", "Analytics"],
      ["/post", "plus", "Post for an organization"],
    ],
  },
};