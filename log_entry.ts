import { Peer } from "./peer_directory";

interface LogEntry {
  /** What the client sent us, eg `SET 5`. */
  value: string;
  /** Unique identifier for this log entry. */
  id: number;
  /** List of peers that have accepted the message.
   * Once there is a majority, it is commited.
   */
  replicatedBy: Peer[];
}
