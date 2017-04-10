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
  get amLeader() { return this.peers.currentWinner().name === this.name; }
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
        L`ADDING PEER!`
        this.peers.add(from);
        break;
      case REQ_VOTE:
        console.log("Maybe voting in term " + tokens[1]);
        this.maybeVote(from, parseInt(tokens[1]));
        break;
      case VOTE_OK:
        console.log(`Adding vote for ${tokens[1]}`);
        this.countVoteFor(tokens[1]);
        break;
      default:
        console.log("Got some other message: " + message);
        break;
    }
  };

  maybeRead = () => {
    if (this.amLeader) {
      L`IM THE LEADER I WILL READ`
      this.send(this.value);
    } else {
      L`Not leader, wont read.`
    }
  }

  doWrite(value: string) {
    // Append log entry.
    // Wait for followers to replicate.
    // Commit once there is a majority.
    // Notify leaders that you've commit.
  }

  maybeWrite = (value: string) => {
    if (this.amLeader) {
      this.doWrite(value);
    } else {
      L`Not my responsiblity to write data.`
    }
  }

  append = () => {
    let winner = this.peers.currentWinner();
    this.peers.markAsSeen(winner.name);
    console.log("Got an append message. Marking leader as 'seen'." +
      " TODO: Everything else.");
  }

  countVoteFor = (name: string) => {
    this.peers.addVote(name);
  }

  heartBeat = () => {
    if (this.amLeader) {
      L`Im the leader, so I will request append entries.`
      this.send(APPEND_ENTRIES);
    } else {
      L`Not leader. Won't append`
    }
  }

  maybeVote = (name: string, term: number) => {
    if (term > this.electionTerm) {
      L`I'm going to vote.`
      this.electionTerm = term;
      this.peers.resetVotes();
      this.peers.addVote(name);
      this.send(`${VOTE_OK} ${name}`);
    } else {
      L`I won't vote!`
    }
  }

  startElection = () => {
    L`Starting election..`
    this.electionTerm += 1;
    this.peers.resetVotes();
    this.send(`${REQ_VOTE} ${this.electionTerm}`);
  }

  onElectionTimeout = (randomInterval: number) => {
    /** When did I hear from the leader last? */
    let leader = this.peers.currentWinner();
    let { lastSeen } = leader;
    if ((this.name === leader.name) || timeDiff(lastSeen) > randomInterval) {
      L`ELECTION HAS TIMED OUT!`
      this.state = CANDIDATE;
      this.startElection();
      this.peers.addVote(this.name);
    } else {
      L`Election has not timed out....yet`
    }
  }

  /** Send string to room. */
  constructor() {
    console.log(`
    WHERE I LEFT OFF:
     * Fixed issues where nodes did not see peers that joined before them.
     * Need to go back to docs and finish this.append() logic.
    `)
    this.name = randomName();
    this.peers = new PeerDirectory(this.name);
    L`Booting up....`
    connection(this.messageHandler, this.name)
      .then(send => {
        // Don't do polling until we're connected.
        // And even then, give it 4 seconds because IRC is slow.
        this.send = send;
        L`Connected. Waiting 4s.`
        setTimeout(() => {
          randomPolling(this.onElectionTimeout);
          setTimeout(() => this.send(JOIN), HEARTBEAT_TIMEOUT);
          setInterval(this.heartBeat, HEARTBEAT_TIMEOUT);
        }, 1000);
      });
  }
}

function L(message: TemplateStringsArray) { console.log(message.join("")); }
