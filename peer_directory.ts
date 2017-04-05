import { sample } from "lodash";
import { timestamp } from "./util";

export class PeerDirectory {
  private dir: { [name: string]: PeerInfo };
  constructor(public ME: string) {
    this.dir = { [ME]: peerInfo(ME) };
  }
  upsert = (name: string) => { this.dir[name] = peerInfo(name); }
  remove = (name: string) => { delete this.dir[name]; }
  randomPeer = () => sample(Object.keys(this.dir));
  addVote = (name: string) => { this.dir[name].votes += 1; }
  iAmLeader = () => (this.currentLeader.name === this.ME);
  map = <T>(iterator: (p: PeerInfo) => T): T[] => {
    return Object.keys(this.dir).map(n => this.dir[n]).map(iterator);
  }
  resetVotes = () => this.map(p => p.votes = 0);
  markAsSeen(name: string) { this.dir[name].lastSeen = timestamp(); }
  lastSeen(name: string) { this.dir[name].lastSeen }
  currentWinner = (): PeerInfo => {
    let winner = this.dir[this.ME];
    this.map(p => {
      if (p.votes > winner.votes) { winner = p; }
    });
    return winner;
  }
  currentLeader = this.currentWinner; // ALIAS
}

function peerInfo(name: string): PeerInfo {
  return {
    name,
    votes: 0,
    lastSeen: timestamp()
  };
}

interface PeerInfo {
  votes: 0;
  name: string;
  lastSeen: number;
}
