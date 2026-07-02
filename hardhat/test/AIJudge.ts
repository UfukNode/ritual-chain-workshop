import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { encodeAbiParameters, keccak256, parseEther } from "viem";

const TITLE = "Privacy Preserving AI Bounty Judge";
const RUBRIC = "Judge revealed answers by correctness, clarity, and privacy reasoning.";
const ANSWER = "Use a commit-reveal flow so answers stay hidden until the deadline.";
const SALT =
  "0x1111111111111111111111111111111111111111111111111111111111111111";
const WRONG_SALT =
  "0x2222222222222222222222222222222222222222222222222222222222222222";

describe("AIJudge commit-reveal", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();

  async function deployBounty() {
    const [owner, participant] = await viem.getWalletClients();
    const aiJudge = await viem.deployContract("AIJudge");
    const latestBlock = await publicClient.getBlock();
    const deadline = latestBlock.timestamp + 60n;

    await aiJudge.write.createBounty([TITLE, RUBRIC, deadline], {
      value: parseEther("1"),
    });

    return { aiJudge, owner, participant, deadline };
  }

  function buildCommitment(
    answer: string,
    salt: `0x${string}`,
    submitter: `0x${string}`,
    bountyId = 1n,
  ) {
    return keccak256(
      encodeAbiParameters(
        [
          { type: "string" },
          { type: "bytes32" },
          { type: "address" },
          { type: "uint256" },
        ],
        [answer, salt, submitter, bountyId],
      ),
    );
  }

  async function movePastDeadline() {
    await publicClient.request({
      method: "evm_increaseTime",
      params: [90],
    });
    await publicClient.request({
      method: "evm_mine",
      params: [],
    });
  }

  it("stores only a commitment during the commit phase", async function () {
    const { aiJudge, participant } = await deployBounty();
    const commitment = buildCommitment(
      ANSWER,
      SALT,
      participant.account.address,
    );

    await aiJudge.write.submitCommitment([1n, commitment], {
      account: participant.account,
    });

    const submission = await aiJudge.read.getSubmission([1n, 0n]);

    assert.equal(submission[0].toLowerCase(), participant.account.address);
    assert.equal(submission[1], commitment);
    assert.equal(submission[2], "");
    assert.equal(submission[3], false);
  });

  it("rejects reveal before the deadline", async function () {
    const { aiJudge, participant } = await deployBounty();
    const commitment = buildCommitment(
      ANSWER,
      SALT,
      participant.account.address,
    );

    await aiJudge.write.submitCommitment([1n, commitment], {
      account: participant.account,
    });

    await assert.rejects(
      aiJudge.write.revealAnswer([1n, ANSWER, SALT], {
        account: participant.account,
      }),
      /reveal phase not open/,
    );
  });

  it("accepts the matching answer and salt after the deadline", async function () {
    const { aiJudge, participant } = await deployBounty();
    const commitment = buildCommitment(
      ANSWER,
      SALT,
      participant.account.address,
    );

    await aiJudge.write.submitCommitment([1n, commitment], {
      account: participant.account,
    });
    await movePastDeadline();

    await assert.rejects(
      aiJudge.write.revealAnswer([1n, ANSWER, WRONG_SALT], {
        account: participant.account,
      }),
      /invalid reveal/,
    );

    await aiJudge.write.revealAnswer([1n, ANSWER, SALT], {
      account: participant.account,
    });

    const submission = await aiJudge.read.getSubmission([1n, 0n]);

    assert.equal(submission[2], ANSWER);
    assert.equal(submission[3], true);
  });
});
