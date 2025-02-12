# Bug report for p2p lending and borrowing flow

### Create lending proposal interface
- The UI currently allows setting a duration and interest rate that exceed the contract's maximum limits.
    - Duration: The contract requires a duration between 7 and 45 days. In the app, selecting a duration greater than 14 days returns a "Duration out of bounds" error.
    - Interest Rate: The contract limits the interest rate to a maximum of 7%. In the app, any value above 7% fails, but this limit should be clearly indicated.

### Borrowers / lenders market interface
- The interface displays a list of proposals with details such as Token Name, Net Value... The displayed token quantities are imprecise (likely due to rounding). For example, a proposal for $1 shows 4 STRK tokens instead of the expected 4.35 STRK tokens.

- I can't modify a proposal. Attempting to do so results in the error: "Failed to deserialize param #1."

- On successful borrow, there’s no pop-up message confirming that the borrowing process was completed. (same for repayment)

### Market page
- At the bottom of the page in main market section, they are a list of assets that can be lended or borrowed. The Supply APY and Borrow APY columns display "Lend" and "Borrow" buttons instead of the actual APY values.

### Portfolio page
- At the bottom of the page, when viewing Assets, Position Overview, or Transaction History, the pagination shows the current page (1 in this case). The left arrow is black, implying a previous page exists. It should be grayed out or hidden when on page 1.

- The top-left rectangle element displaying Available Balance, Total Lend, Total Borrow, and Interest Earned refreshes approximately every 15 seconds—even when no values change. This causes the entire text to briefly disappear and reappear.

- In the same rectangle, when reducing the screen width, the numerical values like Total Borrow value overflow their container.

- In Position Overview, when I check the borrowed assets i have to repay, the amount borrowed is in STRK, but the amount repaid is in dollars. Not a big deal, but it can be confusing.

- Also, in Position Overview, it may be good to remove repaid borrow from the list.

- When attempting a partial repayment (any percentage less than 100%), a “Failed. Try again” error appears. This likely occurs because small repayment amounts like 0.20, are not valid.

- After repayment, the data does not update dynamically. I need to refresh the page to get the updated datas.
  
### Global
- On page refresh, the login square briefly appears for about 1 second, likely while the site checks that the user is logged in. 

- Time values are displayed in UTC. we should instead use the user's local time.


### Suggestions
- For P2P proposals (lending and borrowing), simplify the process by integrating the deposit logic directly into the proposal request. Currently, users must first deposit a certain amount of STRK tokens and then create an offer in USD. Combining these steps would make the process significantly more convenient for users.

- Notify the user when a proposal is accepted or when a borrowed amount has been repaid.

- I think The most recent proposals should appear at the top of the list. Adding sorting and search features would improve navigation, allowing users to filter by their own proposals or search by specific criteria like price.
