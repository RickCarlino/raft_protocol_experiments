# Raft
## Over IRC

Keeping state in sync across nodes is hard. The Raft protocol seemed surprisingly simple. I've always wanted to try to implement a raft client from scratch. Here goes!

# Details

 * IRC is the communication medium
 * I probably won't use 150-300ms polling time like Raft recommends. That's way too fast for IRC.
 * The node will contain a single string.
 * I will flash state to floppy disk when logs are committed because that's the only reasonable thing to do. It's an old "AOL Autodialer" disk, incase you need specifics.
