export const IRC_CHANNEL = "#raft_expirements";
export const IRC_SERVER = "irc.2600.net";

export const FOLLOWER = "follower";
export const CANDIDATE = "candidate";
export const LEADER = "leader";
export type NODE_STATE = typeof FOLLOWER | typeof CANDIDATE | typeof LEADER;

export const JOIN = "hey!";
export const REQ_VOTE = "vote?";
export const VOTE_OK = "vote!";
export const APPEND_ENTRIES = "append?";
export const APPEND_OK = "append!";
export const WRITE = "set";
export const READ = "get";

export const POLLING_INTERVAL_HI = 20000 * 1.8;
export const POLLING_INTERVAL_LO = 15000 * 1.8;
export const HEARTBEAT_TIMEOUT = 7000 * 1.8;
