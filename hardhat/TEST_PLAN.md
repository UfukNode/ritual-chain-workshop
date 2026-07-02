# Test Plan

## Create Bounty

- Creates a bounty with a non-zero reward.
- Rejects a bounty with a deadline that is not in the future.
- Stores owner, title, rubric, reward, deadline, and default winner index.

## Commit Phase

- Accepts `submitCommitment` before the deadline.
- Rejects a zero commitment.
- Rejects duplicate commitments from the same address for the same bounty.
- Rejects commitments after the deadline.
- Rejects commitments after judging or finalization.
- Enforces `MAX_SUBMISSIONS`.

## Reveal Phase

- Accepts `revealAnswer` after the deadline when `keccak256(abi.encode(answer, salt, msg.sender, bountyId))` matches the stored commitment.
- Rejects reveal before the deadline.
- Rejects reveal from an address that did not commit.
- Rejects wrong salt.
- Rejects changed answer text.
- Rejects reveal from a different wallet.
- Rejects duplicate reveal.
- Rejects answers longer than `MAX_ANSWER_LENGTH`.

## Judging

- Rejects `judgeAll` before the deadline.
- Rejects `judgeAll` if no valid revealed submissions exist.
- Rejects `judgeAll` from non-owner addresses.
- Stores the AI review after a successful Ritual LLM precompile response.
- Marks the bounty as judged.

## Finalization

- Rejects `finalizeWinner` before `judgeAll`.
- Rejects non-owner finalization.
- Rejects an out-of-range winner index.
- Rejects selecting an unrevealed submission.
- Pays the reward to the selected revealed submitter.
- Prevents double finalization.
