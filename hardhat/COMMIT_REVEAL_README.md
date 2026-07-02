# Privacy-Preserving AI Bounty Judge

This submission updates the bounty judge contract from plaintext submissions to a commit-reveal flow.

## Lifecycle

1. The bounty owner calls `createBounty(title, rubric, deadline)` and funds the reward with `msg.value`.
2. Before the deadline, a participant computes:

```solidity
keccak256(abi.encode(answer, salt, participantAddress, bountyId))
```

3. The participant calls `submitCommitment(bountyId, commitment)`.
4. The answer is not stored on-chain during the commit phase. Only the `bytes32` commitment is public.
5. After the deadline, the participant calls `revealAnswer(bountyId, answer, salt)`.
6. The contract recomputes the commitment and accepts only matching reveals.
7. The owner calls `judgeAll(bountyId, llmInput)` after at least one valid reveal.
8. The AI review is stored in `aiReview`, but the owner still calls `finalizeWinner(bountyId, winnerIndex)`.
9. The contract verifies the winner index points to a revealed submission before paying the reward.

## Required Functions

- `submitCommitment(uint256 bountyId, bytes32 commitment)`
- `revealAnswer(uint256 bountyId, string calldata answer, bytes32 salt)`
- `judgeAll(uint256 bountyId, bytes calldata llmInput)`
- `finalizeWinner(uint256 bountyId, uint256 winnerIndex)`

## Notes

- `submissionIndexByUser` uses 1-based indexes so `0` means "no commitment".
- `winnerIndex` is 0-based and maps to the submission array.
- `block.timestamp` is normalized because Ritual testnet timestamps can appear in millisecond scale.
- Only revealed submissions are eligible for AI judging and reward finalization.
