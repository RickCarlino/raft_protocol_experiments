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
  APPEND_ENTRIES
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
  value = "";
  electionTerm = 0;
  /** Handles inbound message. */
  messageHandler = (from: string, message: string) => {
    // TODO: Write a "Message" class for .head/.tail/.from support.
    let tokens = message.split(".");
    switch (tokens[0]) {
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
        console.log("Got some other message????");
        break;
    }
  };

  countVoteFor = (name: string) => {
    this.peers.addVote(name);
  }

  heartBeat = () => {
    if (this.peers.currentLeader().name === this.name) {
      this.send(APPEND_ENTRIES);
    }
  }

  maybeVote = (name: string, term: number) => {
    if (term > this.electionTerm) {
      this.electionTerm = term;
      this.send(VOTE_OK + name);
    }
  }

  startElection = () => {
    this.electionTerm += 1;
    this.peers.resetVotes();
    this.send(REQ_VOTE + this.electionTerm);
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
    this.send = connection(this.messageHandler, this.name);
    randomPolling(this.onElectionTimeout);
    setInterval(this.heartBeat, HEARTBEAT_TIMEOUT);
  }
}

