# Ritual AIJudge Hardhat Project

This folder contains the Solidity contract for the Ritual Academy AI bounty judge workshop.

This submission implements the required commit-reveal track:

- Participants submit `bytes32` commitments before the deadline.
- Participants reveal `answer + salt` after the deadline.
- The contract verifies `keccak256(abi.encode(answer, salt, msg.sender, bountyId))`.
- Only valid revealed answers can be judged and finalized.
- Ritual LLM judging remains batched through `judgeAll`.

Read:

- `COMMIT_REVEAL_README.md` for the lifecycle.
- `TEST_PLAN.md` for reveal and edge-case testing.
- `ARCHITECTURE_NOTE.md` for the privacy model and reflection answer.

## Usage

### Compile

To compile the contract:

```shell
npx hardhat compile
```

### Deploy

To deploy with Ignition:

```shell
npx hardhat ignition deploy ignition/modules/AIJudge.ts
```

For Ritual testnet, set `DEPLOYER_PRIVATE_KEY` and run:

```shell
npx hardhat ignition deploy --network ritual ignition/modules/AIJudge.ts
```
