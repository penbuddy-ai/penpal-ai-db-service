/* eslint-disable no-undef */
// Create the penpal-ai database
db = db.getSiblingDB("penpal-ai");

// Create a user for the penpal-ai database
db.createUser({
  user: "penpal_user",
  pwd: "penpal_password",
  roles: [
    {
      role: "readWrite",
      db: "penpal-ai",
    },
  ],
});

// Create some initial collections if needed
db.createCollection("users");
db.createCollection("messages");
db.createCollection("conversations");

// Switch to admin database to ensure proper initialization
db = db.getSiblingDB("admin");
