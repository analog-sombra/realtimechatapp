import { Server, WebSocket } from "ws";

const s = new Server({ port: 5001 });

let users: string[] = [];

interface CustomWebSocket extends WebSocket {
  username?: string;
}

s.on("connection", (ws: CustomWebSocket) => {
  // when user send mesaage from frontend
  ws.on("message", (message) => {
    const responst = JSON.parse(message.toLocaleString());

    // usename setup start from here
    if (responst.type == "name") {
      const username = responst.data;

      //   if username already exist
      if (users.includes(username)) {
        ws.send(
          JSON.stringify({
            type: "nameerror",
            data: "This username alredy exist try different username",
            users: users,
          })
        );
      } else {
        // seting up new username
        ws.username = username;
        users.push(username);
        s.clients.forEach((client) => {
          // send message to user user that new user is joined
          client.send(
            JSON.stringify({
              type: "success",
              data: `User ${username} joined the chat.`,
              users: users,
            })
          );
        });
        return;
      }
      // usename setup end from here
    }

    // send message to user
    s.clients.forEach((client) => {
      if (ws != client)
        client.send(
          JSON.stringify({
            name: ws.username,
            data: responst.data,
            users: users,
          })
        );
    });
  });

  ws.on("close", () => {
    const username = ws.username;
    if (username) {
      users = users.filter((user) => user !== username);
      s.clients.forEach((client) => {
        if (ws != client)
          client.send(
            JSON.stringify({
              type: "error",
              data: `User ${username} left from chat.`,
              users: users,
            })
          );
      });
    } else {
      s.clients.forEach((client) => {
        if (ws != client)
          client.send(
            JSON.stringify({
              type: "error",
              data: `A client disconnected without setting a username.`,
              users: users,
            })
          );
      });
    }
  });
});
