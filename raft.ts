/** Node states */
const STUB = (...x: any[]): any => { }
const FOLLOWER = "follower";
const CANDIDATE = "candidate";
const LEADER = "leader";
type NODE_STATE =
    | typeof FOLLOWER
    | typeof CANDIDATE
    | typeof LEADER;
class RaftNode<T> {
    static randomNode = STUB;
    value: T;
    state: NODE_STATE = FOLLOWER;
    term = 0;
    lastVote = 0;
    electionWaitTime: number = 300; // Max ms.
    constructor(value: T) { this.value = value; }
    become(state: NODE_STATE) { this.state = state; }
    requestVotes() { };
    voteFor(candidate: RaftNode<T>) { this.lastVote = this.term; };
    resetElectionTimeout() { };
    /** Send log to followers */
    replicate(log: Log<T>) { }
    /**   */
    commit(log: Log<T>) { log.state = "comitted"; }
    startElectionTerm() { }
    onElectionTimeout() {
        this.become(CANDIDATE);
        this.startElectionTerm();
        this.voteFor(this);
        this.requestVotes();
    }
    sendAppendEntryMessage() { }
    appendMessage() { }
    onHeartbeat() {
        // SEND append entries
        this.sendAppendEntryMessage();
    }
    onHeartBeatStop() { this.onElectionTimeout(); }
    countVote(from: RaftNode<T>) {
        /** If this */
    }
    onVoteRequest() {
        if (this.lastVote === this.term) {
            this.voteFor(RaftNode.randomNode());
            this.resetElectionTimeout();
        }
    }
    onLeaderLoss() {
        /** Haven't heard from leader in a while... */
    };
}

/** Log states */
const UNCOMMITED = "uncomitted";
const COMMITED = "comitted";
type LOG_STATE =
    | typeof UNCOMMITED
    | typeof COMMITED;
class Log<T> {
    entries: T[];
    set state(state: LOG_STATE) { this.state = state; }
}

interface Client<T> {
    send(message: T): void;
}
