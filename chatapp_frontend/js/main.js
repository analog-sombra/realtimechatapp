const log = console.log;
log("Init...");

const error = document.getElementById("error");
const success = document.getElementById("success");
const username = document.getElementById("username");
const usercount = document.getElementById("usercount");
const users = document.getElementById("users");

const setError = (message) => {
  success.classList.add("hidden");

  error.textContent = message;
  error.classList.remove("hidden");

  setTimeout(() => {
    error.classList.add("hidden");
  }, 3000);
};

const setSuccess = (message) => {
  error.classList.add("hidden");

  success.textContent = message;
  success.classList.remove("hidden");

  setTimeout(() => {
    success.classList.add("hidden");
  }, 3000);
};

const setname = (value) => {
  personname.textContent = value;
};
const setupsercount = (value) => {
  usercount.textContent = `${value} ONLINE`;
};

const clearUser = () => {
  users.innerHTML = "";
};

const setUser = (nameofuser) => {
  // Create a new user element
  const userElement = document.createElement("div");
  userElement.classList.add(
    "bg-white",
    "rounded-xl",
    "bg-opacity-20",
    "backdrop-filter",
    "backdrop-blur-md",
    "py-2",
    "px-3",
    "grid",
    "place-items-center"
  );

  const usernameElement = document.createElement("p");
  usernameElement.classList.add(
    "text-center",
    "font-semibold",
    "text-sm",
    "text-white",
    "flex",
    "gap-2"
  );
  usernameElement.textContent = nameofuser;

  userElement.appendChild(usernameElement);
  users.appendChild(userElement);
};

const namesection = document.getElementById("namesection");
const mainchat = document.getElementById("mainchat");
const startchat = document.getElementById("startchat");
const chattext = document.getElementById("chattext");
const send = document.getElementById("send");
const chatarea = document.getElementById("chatarea");
const personname = document.getElementById("name");

const addChat = (message, user) => {
  let element = document.createElement("div");
  element.textContent = message;
  element.classList.add(
    "text-white",
    "text-xl",
    "font-semibold",
    "bg-white",
    "rounded-xl",
    "bg-opacity-20",
    "backdrop-filter",
    "backdrop-blur-md",
    "self-start",
    "px-4",
    "py-2"
  );
  if (user) {
    element.classList.add("self-end", "text-indigo-500");
  } else {
    element.classList.add("self-start", "text-black");
  }
  chatarea.appendChild(element);
};

startchat.addEventListener("click", () => {
  if (
    username.value == null ||
    username.value == undefined ||
    username.value == ""
  ) {
    return setError("Username is required");
  }

  namesection.classList.add("hidden");
  mainchat.classList.remove("hidden");

  initchat(username.value);
});

const initchat = (username) => {
  //   var sock = new WebSocket("ws://localhost:5001");
  var sock = new WebSocket("ws://192.168.2.201:5001");
  sock.onopen = (event) => {
    setSuccess("Connected to websocket");

    sock.send(
      JSON.stringify({
        type: "name",
        data: username,
      })
    );
    setname(username);
  };

  sock.onmessage = (event) => {
    console.log("working");
    let response = JSON.parse(event.data);
    setupsercount(response.users.length);

    clearUser();
    for (let i = 0; i < response.users.length; i++) {
      setUser(response.users[i]);
    }

    if (response.type == "nameerror") {
      setError(response.data);
      namesection.classList.remove("hidden");
      mainchat.classList.add("hidden");
      return;
    } else if (response.type == "error") {
      setError(response.data);
      return;
    } else if (response.type == "success") {
      setSuccess(response.data);
      return;
    }
    console.log(response);
    addChat(`${response.name} : ${response.data}`, false);
  };

  sock.onerror = (error) => {
    log(error);
  };

  send.addEventListener("click", () => {
    if (
      chattext.value == null ||
      chattext.value == undefined ||
      chattext.value == ""
    ) {
      return setError("Type something in order to send message.");
    }

    addChat(`You : ${chattext.value}`, true);

    sock.send(
      JSON.stringify({
        type: "message",
        data: chattext.value,
      })
    );
    chattext.value = "";
  });
};
