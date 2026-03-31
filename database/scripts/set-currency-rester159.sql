-- Give user rester159 1,000,000 virtual_currency
-- Run in Neon: SQL Editor → paste → Run (or use backend script: node scripts/set-currency.js rester159 1000000)

UPDATE users
SET virtual_currency = 1000000
WHERE username = 'rester159'
RETURNING user_id, username, virtual_currency;
