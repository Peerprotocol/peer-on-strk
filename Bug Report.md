
# Bug Report

## Discovered Issues & Fixes

### 1. Depositing is done in two phases (token approval and deposit approval), making it unintuitive.
**Issue:** Users find the process confusing as they must approve the token first and then approve the deposit separately. This additional step adds friction to the user experience and may result in abandoned transactions.

**Fix:** Combine token approval and deposit approval into a single transaction if technically feasible. If not, provide clear UI instructions, visual indicators, and user feedback to explain the process step-by-step.

### 2. After P2P toggle, lenders page for ETH shows starknet beside "Borrowers Market" title instead of ETH.
**Issue:** When switching to P2P mode, the asset name does not update correctly, leading to confusion about which asset market is being displayed.

**Fix:** Ensure asset selection persists correctly across pages. Implement proper state management to maintain the selected asset context throughout the user journey.

### 3. P2P toggle requires asset re-selection when creating lending proposals.
**Issue:** After switching to P2P mode, users must manually select the asset again when creating a lending proposal. This redundancy slows down the process and leads to a poor experience.

**Fix:** Store the selected asset in state or session storage and pre-fill it in the lending proposal form to improve usability and consistency.

### 4. ETH lending proposals can be accessed from starknet proposals and vice versa.
**Issue:** Lending proposals are not properly segmented by network, allowing users to access ETH lending proposals from Starknet and vice versa. This can lead to transaction errors and confusion.

**Fix:** Implement stricter filtering of lending proposals based on network type. Ensure that users only see proposals relevant to their selected network.

### 5. No indication that a borrow was successful.
**Issue:** After borrowing, users do not receive any confirmation or feedback, leaving them uncertain whether the transaction was completed successfully.

**Fix:** Implement success messages, notifications, or UI indicators such as modals or banners that confirm the borrow action was successful. Display transaction details to reassure users.

### 6. Available balance does not update after borrowing and then creating a lending proposal.
**Issue:** When a user borrows assets and subsequently creates a lending proposal, the available balance is not updated correctly. This can mislead users into thinking they have more funds available than they actually do.

**Fix:** Ensure balance updates dynamically after each transaction. Implement real-time state management to refresh displayed balances immediately after a transaction occurs.

### 7. No indication of how to pay back after borrowing.
**Issue:** Users who have borrowed assets are not provided with clear repayment instructions, making it difficult for them to complete the borrowing cycle.

**Fix:** Add a clearly visible "Repay" button along with detailed repayment instructions. Include information on interest calculations, repayment deadlines, and step-by-step guidance.

### 8. Nothing is shown in position overview, halting the repayment process.
**Issue:** The position overview section, which should display active loans and lending positions, is blank. This prevents users from seeing their outstanding loans, making it impossible to initiate repayments.

**Fix:** Ensure the position overview fetches and displays real-time data. Debug API calls and state management to ensure accurate and timely data retrieval.
=======
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

