# Bug Report

## Discovered Issues & Fixes

### 1. Depositing is done in two phases (token approval and deposit approval), making it unintuitive.
**Issue:** Users find the process confusing.
**Fix:** Combine token approval and deposit approval into a single transaction if possible, or clearly indicate each step with UI explanations.

### 2. After P2P toggle, lenders page for ETH shows starknet beside "Borrowers Market" title instead of ETH.
**Issue:** Incorrect asset name is displayed.
**Fix:** Ensure asset selection persists correctly across pages and reflects the chosen asset.

### 3. P2P toggle requires asset re-selection when creating lending proposals.
**Issue:** Users must specify the asset again after toggling P2P.
**Fix:** Store the selected asset in state and auto-fill it when creating a proposal.

### 4. ETH lending proposals can be accessed from starknet proposals and vice versa.
**Issue:** Cross-market data leakage.
**Fix:** Ensure proper filtering of lending proposals by network type.

### 5. No indication that a borrow was successful.
**Issue:** Users do not receive feedback after borrowing.
**Fix:** Implement success messages or transaction confirmation indicators.

### 6. Available balance does not update after borrowing and then creating a lending proposal.
**Issue:** Balance does not reflect the most recent transactions.
**Fix:** Ensure balance updates dynamically after transactions.

### 7. No indication of how to pay back after borrowing.
**Issue:** Users do not know the repayment process.
**Fix:** Provide clear repayment instructions and a visible "Repay" button.