import * as irc from "irc";
import * as uuid from "uuid";

const CHANNEL = "#bot_programming";
const SERVER = "irc.​2600.​net";

// SEE:
// https://node-irc.readthedocs.io/en/latest/API.html#events
type MessageHandler = (sender: string, message: string) => void;

export function client(handler: MessageHandler) {
  let name = "RAFT_" + uuid().slice(0, 4);
  var c = new irc.Client(SERVER, name, { channels: [CHANNEL] });

  c.addListener("connect", () => console.log("ONLINE!"));
  c.addListener("error", e => console.log(`${JSON.stringify(e)}`));
  c.addListener("message", (from, _, msg) => handler(from, msg));

  return (message: string) => c.say(CHANNEL, message);
}

let c = client((f, m) => console.log(`${f}>${m}`))
setInterval(() => c("Pinggg"), 9000);

