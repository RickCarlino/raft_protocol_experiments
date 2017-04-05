/** Node states */
import { connection, MessageHandler, randomName } from "./irc";
import {
  NODE_STATE,
  FOLLOWER,
  HEARTBEAT_TIMEOUT,
  CANDIDATE,
  JOIN,
  REQ_VOTE,
  VOTE_OK,
  APPEND_ENTRIES,
  WRITE,
  READ
} from "./consts";
import {
  randomPolling,
  timeDiff,
  timestamp
} from "./util";
import { PeerDirectory } from "./peer_directory";

export class RaftNode {
  name: string;
  peers: PeerDirectory;
  send: (message: string) => void;
  state: NODE_STATE = FOLLOWER;
  value = "~~Default value~~";
  electionTerm = 0;
  get amLeader() { return this.peers.iAmLeader(); }
  /** Handles inbound message. */
  messageHandler = (from: string, message: string) => {
    // TODO: Write a "Message" class for .head/.tail/.from support.
    let tokens = message.split(" ");
    switch (tokens[0]) {
      case READ:
        this.maybeRead();
      case WRITE:
        this.maybeWrite(tokens[1]);
        break;
      case APPEND_ENTRIES:
        this.append();
        break;
      case JOIN:
        this.peers.upsert(from);
        break;
      case REQ_VOTE:
        this.maybeVote(from, parseInt(tokens.slice(-1)[0]));
        break;
      case VOTE_OK:
        this.countVoteFor(tokens.slice(-1)[0]);
        break;
      default:
        console.log("Got some other message: " + message);
        break;
    }
  };

  maybeRead = () => {
    if (this.amLeader) { this.send(this.value); }
  }

  maybeWrite = (value: string) => {
    if (this.amLeader) {
      this.send("I haven't written a means of commiting data yet, " +
        "but if we had, I would be the leader.");
    }
  }

  append = () => {
    console.log("Got an append message. So, what?");
  }

  countVoteFor = (name: string) => {
    this.peers.addVote(name);
  }

  heartBeat = () => {
    if (this.amLeader) {
      this.send(APPEND_ENTRIES);
    }
  }

  maybeVote = (name: string, term: number) => {
    if (term > this.electionTerm) {
      this.electionTerm = term;
      this.send(`${VOTE_OK} ${name}`);
    }
  }

  startElection = () => {
    this.electionTerm += 1;
    this.peers.resetVotes();
    this.send(`${REQ_VOTE} ${this.electionTerm}`);
  }

  onElectionTimeout = (randomInterval: number) => {
    /** When did I hear from the leader last? */
    let { lastSeen } = this.peers.currentLeader();
    if (timeDiff(lastSeen) > randomInterval) {
      this.state = CANDIDATE;
      this.startElection();
      this.peers.addVote(this.name);
    }
  }

  /** Send string to room. */
  constructor() {
    this.name = randomName();
    this.peers = new PeerDirectory(this.name);
    connection(this.messageHandler, this.name)
      .then(send => {
        // Don't do polling until we're connected.
        // And even then, give it 4 seconds because IRC is slow.
        this.send = send;
        setTimeout(() => {
          randomPolling(this.onElectionTimeout);
          setInterval(this.heartBeat, HEARTBEAT_TIMEOUT);
        }, 4000);
      });
  }
}

