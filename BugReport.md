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