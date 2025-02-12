# Bug Report

## Discovered Issues & Fixes

### 1. "What is a wallet?" on the login page is not responsive or does not show anything.
**Issue:** Clicking on "What is a wallet?" does not trigger any action or display information.

**Fix:** Ensure the event listener is correctly bound and linked to a modal or tooltip providing wallet information.

### 2. Balance in dollars (Exchange rate) is not shown when trying to make a deposit.
**Issue:** Users cannot see the balance equivalent in dollars when making a deposit.

**Fix:** Fetch and display the exchange rate dynamically when loading the deposit page.

### 3. Portfolio page flex containing balance details visibly reloads instead of updating values alone.
**Issue:** The entire section refreshes instead of smoothly updating values.

**Fix:** Implement state management to update only the changing values without reloading the whole component.

### 4. Depositing is done in two phases (token approval and deposit approval), making it unintuitive.
**Issue:** Users find the process confusing.

**Fix:** Combine token approval and deposit approval into a single transaction if possible, or clearly indicate each step with UI explanations.

### 5. After P2P toggle, lenders page for ETH shows starknet beside "Borrowers Market" title instead of ETH.
**Issue:** Incorrect asset name is displayed.

**Fix:** Ensure asset selection persists correctly across pages and reflects the chosen asset.

### 6. P2P toggle requires asset re-selection when creating lending proposals.
**Issue:** Users must specify the asset again after toggling P2P.

**Fix:** Store the selected asset in state and auto-fill it when creating a proposal.

### 7. "1" appearing on the lenders and borrowers page does nothing but changes the cursor.
**Issue:** Unclear UI element with no functionality.

**Fix:** Remove the element or ensure it has an intended function.

### 8. ETH lending proposals can be accessed from starknet proposals and vice versa.
**Issue:** Cross-market data leakage.

**Fix:** Ensure proper filtering of lending proposals by network type.

### 9. Info hover pop-ups display nothing.
**Issue:** Hovering over info icons does not reveal any content.

**Fix:** Ensure tooltips are correctly implemented and contain relevant information.

### 10. Lenders Market displays tokens as "unknown" in the market (ETH).
**Issue:** Incorrect token display.

**Fix:** Ensure token metadata is correctly fetched and displayed.

### 11. No indication that a borrow was successful.
**Issue:** Users do not receive feedback after borrowing.

**Fix:** Implement success messages or transaction confirmation indicators.

### 12. Past lending proposals created by a user are not displayed on the borrowers' market.
**Issue:** Users cannot see their previous proposals.

**Fix:** Fetch and display all historical lending proposals from the backend.

### 13. Available balance does not update after borrowing and then creating a lending proposal.
**Issue:** Balance does not reflect the most recent transactions.

**Fix:** Ensure balance updates dynamically after transactions.

### 14. No indication of how to pay back after borrowing.
**Issue:** Users do not know the repayment process.

**Fix:** Provide clear repayment instructions and a visible "Repay" button.

### 15. Portfolio page transaction history does not update with new borrows and lends.
**Issue:** Only one transaction is shown, instead of updating dynamically.

**Fix:** Fetch and append new transactions in real time to the transaction history section.


