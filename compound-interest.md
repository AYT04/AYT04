---

### 🧮 **Math Question (Compound Interest Version):**

You're running an Android app that makes **50 API queries per second**, with a cost of **$5 per million queries**. This results in a **weekly cost of $151.20**.

You want to **pre-fund this cost** using a one-time investment that earns **compound interest**. The investment compounds **daily** at an annual interest rate of **5%**.

### ❓ Question:

How much money do you need to invest **one time today**, so that it generates **at least $151.20 per week forever**, assuming the interest is compounded **daily** and you withdraw the $151.20 every week?

---

### 💡 Hints:
- Convert the weekly payout to an **annual payout**:  
  $151.20 × 52 weeks = **$7,862.40/year**
  
- Use the **present value of a perpetuity** formula:  

  $$
  PV = \frac{\text{Annual Withdrawal}}{\text{Effective Annual Interest Rate}}
  $$

- Since it compounds daily, the effective annual interest rate is:

$$
  r_{\text{effective}} = \left(1 + \frac{0.05}{365}\right)^{365} - 1
$$

---

### ✅ Final Task:
Solve for the **present value (PV)** — the amount you need to invest today to sustainably fund your API costs forever.

Let me know if you'd like the step-by-step solution!
