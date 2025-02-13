

  # Peer Protocol Bug Report
  This test was done using Chrome desktop browser and Argent X Wallet  
  
  ## Review 
  1. The wallet was connected succesfully, with seamless switching
  2. Deposit done successfully, balances updated accordingly
  3. Lending proposal created successfully, lending funds were locked. The locked funds was short by about 1%. But displayed the non-shorted funds on display in the p2p lending market. (Observation)
  4. Switched wallets, deposit successful, deposited collateral locked successfully with respect to the borrowed amount.
  5. Prior to No. 4, Lending proposal was found and accepted successfully and optimally.
  6. All required balances were updated correctly in all corresponding wallets.
  7. Created Proposals were able to be canceled successfully before acceptance, and all locked funds and deposit balance were updated correctly.
  
  ## Summary
  The flow of p2p lending and borrowing passed successfully with no bugs found. 🎉💯
  

# Peer Protocol P2P Lending and Borrowing Bug Report
This testing was done with Chrome as the Browser, and Argent X and Braavos Desktop Extension for the wallets

## Activities (Steps) Carried out
- Wallet Connection
- Filling of form details (email and X username)
- Making of Deposit from wallet balance, in the Portfolio route
- Creating P2P Lending proposal
- Signing in with another wallet
- Repeating steps 1 and 2
- Making of Deposit from wallet balance, in the Portfolio route
- Accepting a Lending Proposal
- Viewing of Activity on Activity graph in Portfolio route, to see how many lending, borrowing and deposit transactions
- Creating of Proposal and subsequent Cancellation
- Checking to see if a user can borrow money he made a lend proposal for

## Observation & Recommendation
- In the step that involves making a deposit, a deposit can be attempted without inputing any value. Deposit button should be deactivated if no value of deposit has been selected or input manually. There should be a tooltip that appears on hover 
- When a user goes to create a p2p lend proposal, if the user has previously created a proposal, he does not see it there. He should see a list of the proposals in the route.
- The functionality for deleting proposal previously created by a user is in the route for seeing other people's proposals. It should be in the portfolio, in the activity table below, and/or in the route where the button to create a proposal is located.
- Braavos wallet seems majorly unresponsive, returning errors such as "Not enough collateral", or "Not enough token", despite availability of these.
- Graph could be respresented differently, with date ranges for selection, and the default being a number of days (possibly 7) between the current day and a week behind. A composite bar chart could be better for illustration, and ease of user understanding, where there will be three bars in each group, one for lends, one for borrows and the other for deposits. In the same way, three groups for a day, and 7 days for the entire chart.
- Does not matter much, but dApp could use a bit more colour generally, but structure is perfect

## Final Result
The dApp works well for P2P lending and borrowing, and seems to have much more convenient experience using Argent Wallet

