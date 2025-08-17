export const rolesSeed = [
  {
    name: "admin",
    description: "Administrator role with full access",
    permissions: {
      users: ["create", "read", "update", "delete", "list"],
      roles: ["create", "read", "update", "delete", "list"],
      conversations: ["create", "read", "update", "delete", "list"],
      languages: ["create", "read", "update", "delete", "list"],
      aiCharacters: ["create", "read", "update", "delete", "list"],
    },
    isSystem: true,
  },
  {
    name: "user",
    description: "Standard user role",
    permissions: {
      users: ["read", "update"],
      roles: ["read"],
      conversations: ["create", "read", "update", "delete", "list"],
      languages: ["read", "list"],
      aiCharacters: ["read", "list"],
    },
    isSystem: true,
  },
  {
    name: "moderator",
    description: "Content moderator role",
    permissions: {
      users: ["read", "list"],
      roles: ["read"],
      conversations: ["read", "update", "list"],
      languages: ["read", "list"],
      aiCharacters: ["read", "list"],
    },
    isSystem: true,
  },
];
