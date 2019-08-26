const Chatroom = require("./Chatroom");
const chatroomTemplates = (module.exports = [
  {
    name: "Terminus",
    image: "chatrooms/terminus.jpg"
  },
  {
    name: "Alexandria",
    image: "chatrooms/alexandria.jpg"
  },
  {
    name: "Sanctuary",
    image: "chatrooms/sanctuary.jpg"
  },
  {
    name: "Hilltop",
    image: "chatrooms/hilltop.jpg"
  }
]);

module.exports = function() {
  // mapping of all available chatrooms
  const chatrooms = new Map(chatroomTemplates.map(c => [c.name, Chatroom(c)]));

  function removeClient(client) {
    chatrooms.forEach(c => c.removeUser(client));
  }

  function getChatroomByName(chatroomName) {
    return chatrooms.get(chatroomName);
  }

  function serializeChatrooms() {
    return Array.from(chatrooms.values()).map(c => c.serialize());
  }

  return {
    removeClient,
    getChatroomByName,
    serializeChatrooms
  };
};
