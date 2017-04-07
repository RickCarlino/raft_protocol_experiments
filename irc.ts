import * as irc from "irc";
import * as uuid from "uuid";
import { IRC_SERVER, IRC_CHANNEL, JOIN } from "./consts";
import { timestamp, timeDiff } from "./util";

// SEE:
// https://node-irc.readthedocs.io/en/latest/API.html#events
export type MessageSender = (message: string) => void;
export type MessageHandler = (from: string, message: string) => void;

export let randomName = () => "RAFT_" + uuid().slice(0, 4);

export function connection(handler: MessageHandler, name: string) {
  let last = timestamp();
  return new Promise<MessageSender>(function (resolve, reject) {
    var c = new irc.Client(IRC_SERVER, name, { channels: [IRC_CHANNEL] });
    c.addListener("error", e => console.log(`${JSON.stringify(e)}`));
    console.log(`Connecting to ${IRC_CHANNEL} on ${IRC_SERVER} as ${name}`);
    c.addListener("message", (from, _, msg) => handler(from, msg));
    c.addListener(`names${IRC_CHANNEL}`, function (names) {
      console.log("NAMES!!!")
      Object
        .keys(names)
        .map(peerName => {
          let isPeer = peerName.includes("RAFT");
          let notMe = peerName !== name;
          (isPeer && notMe) ? handler(peerName, JOIN) : "";
        });
    })
    c.addListener(`join${IRC_CHANNEL}`, function () {
      function sender(message: string) {
        if (timeDiff(last) < 1000) {
          console.log("flood protection" + timeDiff(last))
        } else {
          console.log("Sending mesage: " + message)
          c.say(IRC_CHANNEL, message);
        }
      }
      resolve(sender);
    });
  });
}

