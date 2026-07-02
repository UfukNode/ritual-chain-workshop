# Architecture Note

## Commit-Reveal Track

The required implementation works on any EVM chain. During the submission phase, the contract stores only a `bytes32` commitment. The plaintext answer is not stored on-chain until the reveal phase. The commitment binds the answer to the salt, submitter address, and bounty id:

```solidity
keccak256(abi.encode(answer, salt, msg.sender, bountyId))
```

This prevents a participant from copying another user's plaintext answer during the submission phase. After the deadline, participants reveal their answer and salt. Only successfully revealed answers are eligible for `judgeAll` and `finalizeWinner`.

## Ritual Judging

The `judgeAll` function keeps the Ritual LLM precompile integration from the workshop. The frontend or operator builds one batch prompt containing every valid revealed submission and sends that as `llmInput`. The contract forwards the bytes to the LLM precompile, decodes the response, and stores the returned AI review.

The AI review is advisory. The owner still finalizes the winner, and the contract enforces that the selected winner index points to a revealed submission.

## Advanced Hidden Submission Design

A stronger Ritual-native design would keep plaintext hidden even during reveal by storing encrypted answers off-chain or as encrypted/private inputs. On-chain state would keep commitments, eligibility metadata, deadlines, and reward state. Plaintext would exist only inside the TEE-backed executor during the batch judging step. The LLM would receive all eligible plaintext submissions in one batch so judging remains comparable and avoids one LLM call per answer.

## Reflection

In a bounty system, bounty metadata, deadlines, reward size, commitments, and final payout should be public because they define the rules and make the process auditable. Plaintext submissions should stay hidden during the submission phase so participants cannot copy or adapt other people's ideas. After the deadline, plaintext can become public in a normal commit-reveal design because everyone has already committed. AI should help evaluate submissions against the rubric, summarize tradeoffs, and recommend a winner. A human should decide the final winner because LLMs can hallucinate, misunderstand code, or be manipulated by prompt injection inside submissions. The contract should enforce objective rules such as deadlines, valid reveals, owner-only finalization, and reward payment. The AI should never be the only authority that moves funds without a human review step.
