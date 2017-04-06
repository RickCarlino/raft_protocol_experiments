import { PeerDirectory } from "../peer_directory";

const ME = "ME";
function newDir() { return new PeerDirectory(ME); }

test('Initializes with defaults', () => {
  let x = newDir();
  let info = x.peer(ME);

  expect(Object.keys(x)).toContain(ME);
  expect(x.ME).toBe(ME);
  expect(x.count).toBe(1);
  expect(info && info.name).toBe(ME);
  expect(info && info.votes).toBe(0);
  expect(info && info.lastSeen).toBeGreaterThan(0);

  let FRED = "FRED";
  x.add(FRED);
  let fredInfo = x.peer(FRED);
  expect(x.count).toBe(2);
  expect(x.peer(FRED)).toBeTruthy();
  x.addVote(FRED);
  if (fredInfo && info) {
    expect(fredInfo.votes).toBe(1);
    expect(x.currentWinner()).toEqual(fredInfo);
    expect(x.iAmLeader()).toBe(false);
    x.resetVotes();
    expect(fredInfo.votes).toBe(0);
    expect(info.votes).toBe(0);
    let oldTime = fredInfo.lastSeen;
    x.markAsSeen(FRED);
    expect(x.lastSeen(FRED)).toBeGreaterThan(oldTime);
  } else {
    fail("x.peer() did not find FRED. Thought it would.")
  }
  x.remove(FRED)
  expect(x.iAmLeader()).toBe(true);
  expect(x.count).toBe(1);

});
