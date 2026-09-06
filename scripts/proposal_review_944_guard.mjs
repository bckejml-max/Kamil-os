import fs from 'node:fs';
const review=fs.readFileSync('js/proposalReview944.js','utf8');
const more=fs.readFileSync('js/personalMore640.js','utf8');
const must=[
 "PROPOSAL_REVIEW944_VERSION='944.0.0'",
 'decideProposal944',
 'proposalAudit944',
 'proposalQueue944',
 'openProposalReview944',
 'proposalDecisionDoesNotExecute:true',
 'noFinancialExecution:true',
 'noBettingExecution:true',
 'noAutomaticUiMutation:true'
];
for(const token of must)if(!review.includes(token))throw new Error(`OS944 missing ${token}`);
for(const token of ['proposalReview944.js','Proposal Review & Approval','proposal-review'])if(!more.includes(token))throw new Error(`OS944 More missing ${token}`);
if(/executed\s*:\s*true/.test(review))throw new Error('OS944 must not execute approved proposals');
console.log('OS944 Proposal Review QA passed');
