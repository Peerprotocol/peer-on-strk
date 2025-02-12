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