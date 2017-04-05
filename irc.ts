import * as irc from "irc";
import * as uuid from "uuid";
import { IRC_SERVER, IRC_CHANNEL } from "./consts";
import { timestamp, timeDiff } from "./util";

// SEE:
// https://node-irc.readthedocs.io/en/latest/API.html#events
export type MessageHandler = (from: string, message: string) => void;

export let randomName = () => "RAFT_" + uuid().slice(0, 4);

export function connection(handler: MessageHandler, name: string) {
  var c = new irc.Client(IRC_SERVER, name, { channels: [IRC_CHANNEL] });
  console.log(`Connecting to ${IRC_CHANNEL} on ${IRC_SERVER} as ${name}`);
  c.addListener("connect", () => console.log("ONLINE!"));
  c.addListener("error", e => console.log(`${JSON.stringify(e)}`));
  c.addListener("message", (from, _, msg) => handler(from, msg));
  let last = timestamp();
  return function (message: string) {
    if (timeDiff(last) < 1000) {
      console.log("flood protection" + timeDiff(last))
    } else {
      console.log("Sending mesage: " + message)
      c.say(IRC_CHANNEL, message);
    }
  }
}

