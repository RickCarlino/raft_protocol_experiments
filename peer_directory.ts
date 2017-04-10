import { sample } from "lodash";
import { timestamp } from "./util";

export class PeerDirectory {
  private dir: { [name: string]: Peer };
  constructor(public ME: string) { this.dir = { [ME]: peerInfo(ME) }; }
  get count() { return Object.keys(this.dir).length; }
  peer = (name: string): Readonly<Peer> | undefined => {
    return this.dir[name];
  }
  add = (name: string) => { this.dir[name] = peerInfo(name); }
  remove = (name: string) => { delete this.dir[name]; }
  randomPeer = () => sample(Object.keys(this.dir));
  addVote = (name: string) => { this.dir[name].votes += 1; }
  iAmLeader = () => (this.currentWinner().name === this.ME);
  map = <T>(iterator: (p: Peer) => T): T[] => {
    return Object.keys(this.dir).map(n => this.dir[n]).map(iterator);
  }
  resetVotes = () => this.map(p => p.votes = 0);
  markAsSeen(name: string) { this.dir[name].lastSeen = timestamp(); }
  lastSeen(name: string) {
    let x = this.dir[name];
    if (x) {
      return x.lastSeen;
    } else {
      throw new Error(`Cant find peer "${name}"`);
    }
  }
  currentWinner = (): Peer => {
    let winner = this.dir[this.ME];
    this.map(p => {
      if (p.votes > winner.votes) { winner = p; }
    });
    return winner;
  }
}

function peerInfo(name: string): Peer {
  return {
    name,
    votes: 0,
    lastSeen: timestamp()
  };
}

export interface Peer {
  votes: 0;
  name: string;
  lastSeen: number;
}
