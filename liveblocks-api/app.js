import { createClient } from "@liveblocks/client";

let PUBLIC_KEY = "pk_live_eU3a0XPigqcID3l5AbrZW3Ak";
let roomId = "javascript-live-cursors";

overrideApiKeyAndRoomId();

if (!/^pk_(live|test)/.test(PUBLIC_KEY)) {
  console.warn(
    `Replace "${PUBLIC_KEY}" by your public key from https://liveblocks.io/dashboard/apikeys.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/javascript-live-cursors#getting-started.`
  );
}

const client = createClient({
  publicApiKey: PUBLIC_KEY,
});

const room = client.enter(roomId, { cursor: null });

const cursorsContainer = document.getElementById("cursors-container");
const text = document.getElementById("text");

room.subscribe("my-presence", (presence) => {
  const cursor = presence?.cursor ?? null;

  text.innerHTML = cursor
    ? `${cursor.x} × ${cursor.y}`
    : "Move your cursor to broadcast its position to other people in the room.";
});

/**
 * Subscribe to every others presence updates.
 * The callback will be called if you or someone else enters or leaves the room
 * or when someone presence is updated
 */
room.subscribe("others", (others, event) => {
  switch (event.type) {
    case "reset": {
      // Clear all cursors
      cursorsContainer.innerHTML = "";
      for (const user of others.toArray()) {
        updateCursor(user);
      }
      break;
    }
    case "leave": {
      deleteCursor(event.user);
      break;
    }
    case "enter":
    case "update": {
      updateCursor(event.user);
      break;
    }
  }
});

document.addEventListener("pointermove", (e) => {
  room.updatePresence({
    cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) },
  });
});

document.addEventListener("pointerleave", (e) => {
  room.updatePresence({ cursor: null });
});

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

// Update cursor position based on user presence
function updateCursor(user) {
  const cursor = getCursorOrCreate(user.connectionId);

  if (user.presence?.cursor) {
    cursor.style.transform = `translateX(${user.presence.cursor.x}px) translateY(${user.presence.cursor.y}px)`;
    cursor.style.opacity = "1";
  } else {
    cursor.style.opacity = "0";
  }
}

function getCursorOrCreate(connectionId) {
  let cursor = document.getElementById(`cursor-${connectionId}`);

  if (cursor == null) {
    cursor = document.getElementById("cursor-template").cloneNode(true);
    cursor.id = `cursor-${connectionId}`;
    cursor.style.fill = COLORS[connectionId % COLORS.length];
    cursorsContainer.appendChild(cursor);
  }

  return cursor;
}

function deleteCursor(user) {
  const cursor = document.getElementById(`cursor-${user.connectionId}`);
  if (cursor) {
    cursor.parentNode.removeChild(cursor);
  }
}

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function overrideApiKeyAndRoomId() {
  const query = new URLSearchParams(window?.location?.search);
  const apiKey = query.get("apiKey");
  const roomIdSuffix = query.get("roomId");

  if (apiKey) {
    PUBLIC_KEY = apiKey;
  }

  if (roomIdSuffix) {
    roomId = `${roomId}-${roomIdSuffix}`;
  }
}

async function run() {
  let PUBLIC_KEY = "pk_live_eU3a0XPigqcID3l5AbrZW3Ak";
  let roomId = "javascript-todo-list";

  overrideApiKeyAndRoomId();

  if (!/^pk_(live|test)/.test(PUBLIC_KEY)) {
    console.warn(
      `Replace "${PUBLIC_KEY}" by your public key from https://liveblocks.io/dashboard/apikeys.\n` +
        `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/javascript-todo-list#getting-started.`
    );
  }

  const client = createClient({
    publicApiKey: PUBLIC_KEY,
  });

  const room = client.enter(roomId);

  const whoIsHere = document.getElementById("who_is_here");
  const todoInput = document.getElementById("todo_input");
  const someoneIsTyping = document.getElementById("someone_is_typing");
  const todosContainer = document.getElementById("todos_container");

  room.subscribe("others", (others) => {
    whoIsHere.innerHTML = `There are ${others.count} other users online`;

    someoneIsTyping.innerHTML = others
      .toArray()
      .some((user) => user.presence?.isTyping)
      ? "Someone is typing..."
      : "";
  });

  const { root } = await room.getStorage();

  let todos = root.get("todos");

  if (todos == null) {
    todos = new LiveList();
    root.set("todos", todos);
  }

  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      room.updatePresence({ isTyping: false });
      todos.push({ text: todoInput.value });
      todoInput.value = "";
    } else {
      room.updatePresence({ isTyping: true });
    }
  });

  todoInput.addEventListener("blur", () => {
    room.updatePresence({ isTyping: false });
  });

  function render() {
    todosContainer.innerHTML = "";

    for (let i = 0; i < todos.length; i++) {
      const todo = todos.get(i);

      const todoContainer = document.createElement("div");
      todoContainer.classList.add("todo_container");

      const todoText = document.createElement("div");
      todoText.classList.add("todo");
      todoText.innerHTML = todo.text;
      todoContainer.appendChild(todoText);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete_button");
      deleteButton.innerHTML = "✕";
      deleteButton.addEventListener("click", () => {
        todos.delete(i);
      });
      todoContainer.appendChild(deleteButton);

      todosContainer.appendChild(todoContainer);
    }
  }

  room.subscribe(todos, () => {
    render();
  });

  /**
   * This function is used when deploying an example on liveblocks.io.
   * You can ignore it completely if you run the example locally.
   */
  function overrideApiKeyAndRoomId() {
    const query = new URLSearchParams(window?.location?.search);
    const apiKey = query.get("apiKey");
    const roomIdSuffix = query.get("roomId");

    if (apiKey) {
      PUBLIC_KEY = apiKey;
    }

    if (roomIdSuffix) {
      roomId = `${roomId}-${roomIdSuffix}`;
    }
  }

  render();
}

run();
