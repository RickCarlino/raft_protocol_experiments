# Raft
## Over IRC

The Raft protocol keeps data in sync across (possibly partitioned) remote nodes.

I'm writing a Raft client from scratch to investigate its uses.

# Details

 * IRC is the communication medium, although it could easily be adapted to MQTT or TCP.
 * I probably won't use 150-300ms polling time like Raft recommends. That's way too fast for IRC.
 * The node will replicate a single string value as its state.
 * I will flash state to floppy disk when logs are committed because that's the only reasonable thing to do. It's an old "AOL Autodialer" disk, in case you need specifics.

# Usage

```

npm install
npm start

```

# TODO

 - [*] Communication layer
 - [*] Basic object strucuture
 - [] Elections / election timeout
 - [] heartbeat timeout / DO_APPEND / APPEND_OK
 - [] split votes?
 - [] partition healing?
 - [] flash state to disk
 - [] writeup docs (TSDoc it up)

# Last Left Off

 * Leader election sorta-kinda-works.
 * Leader will accept write commands like `set 5`.
 * NEXT TASK: Start writing replication logic in `RaftNode#doWrite()`.
 * I left some comments in the source of `doWrite()` and also half finished `peer_directory.ts`.
