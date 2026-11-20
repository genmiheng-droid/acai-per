# Prompts History — BellyBellyGood

This document collates all prompts used to build and iterate on the **BellyBellyGood** web application in chronological order.

---

## Part 1: Early Project Milestones (From Repository Commit History)

> Note: The initial conversation turns prior to context compaction are summarized from the repository commit history (`3137735` through `8376f65`).

1. **Initial App Creation** (`3137735`)
   - Build a Singapore organic açaí ordering web application modeled on *An Açaí Affair*, featuring Signature Bowls, Build Your Own Bowl, Take-Home Pints, Bundles, Toasts & Popsicles, Singapore islandwide delivery tiers, and outlet self-pickup.
2. **Rebrand & Member Rewards** (`9e492be`)
   - Rename the store to **BellyBellyGood**, add member sign-in/sign-up, launch a $20 welcome voucher (`WELCOME20`) banner, and track member sign-ups.
3. **Promotional Spotlight Styling** (`b80c7fb`)
   - Highlight the New Member $20 Offer spotlight with a green border and white text.
4. **Banner Sizing & Cleanup** (`8376f65`)
   - Enlarge the top member sign-up banner and remove visible member sign-up counters from the UI.

---

## Part 2: Recorded User Prompts (Chronological Order)

### Prompt 1
> Lock the new members offer banner so that as users scroll, the banner is fixed and attract user.
>
> Under Member sign-in, show membership card with name and number of points. Calculate that for every $10, they get 1 point and when they reach 10 points, they get $10 off the total price

### Prompt 2
> git push

### Prompt 3
> Change the "bag" to "cart". Amend the code so that after the the user adds the product to the cart, the cart appears on the right hand side of the screen.
>
> Add GST to the payment checkout. Show number of loyalty point after checkout is completed.

### Prompt 4
> git push

### Prompt 5
> When the user signs in, the user should be immediately shown the page with the different products to choose.
> After user picks the product and adds to cart, the cart should be shown on he right but the left should still allow user to pick prooducts screen should be smaller) so that both cart and selection of products can still be seen and activated

### Prompt 6
> git push

### Prompt 7
> embed Microsoft Clarity to this web page using the following code:
> ```html
> <script type="text/javascript">
>     (function(c,l,a,r,i,t,y){
>         c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
>         t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
>         y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
>     })(window, document, "clarity", "script", "zgi6oblpde");
> </script>
> ```

### Prompt 8
> git push

### Prompt 9
> Put the code I paste below into the file src/pt.ts, next to src/App.tsx, exactly as written. If the file exists, replace all of it.
> Keep SUPABASE_URL and SUPABASE_KEY in src/pt.ts as they are. The key is a Supabase publishable key, which is made to be public, so do not move it to an environment variable, a .env file or a server.
> Keep the app front-end only, with no server, server.ts, Express, Gemini calls or secrets.
> Then make the app show one of two versions of the same screen:
> 1. Import { variant, track, consent, setConsent, loadClarity } from "./pt".
> 2. The one element under test is: Encourage customers to sign up as members. Read variant() once when the screen first renders. Show that element only when variant() returns "B". Version A is the same screen without it.
> 3. Nothing else may differ between version A and version B. Every other feature, text, price and picture looks and behaves the same in both. Keep every other persuasive element in both versions.
> 4. The visitor's first screen is the product page itself, in version A or B. If the app opens on a comparison of two designs, a dashboard or a walkthrough, move that behind a link at the bottom of the page.
> 5. Call track("screen_view") once when the screen first appears.
> 6. Call track("cta_click") when the main button is pressed. The main button is: Join now.
> 7. Call track("goal_complete") when the visitor More people will sign up when checking out.
> 8. Show a consent notice at the bottom of the screen until the visitor chooses. It says: "This class prototype records which version you saw and what you pressed, to test a design. Nothing about your visit leaves this browser unless you agree." It has two buttons of the same size, colour and weight: "Accept" calls setConsent("granted") and "Decline" calls setConsent("denied").
> 9. When the app starts and consent() is "granted", call loadClarity().
> If index.html holds a Microsoft Clarity script, remove it. src/pt.ts loads Clarity after the visitor presses Accept.
> Do not add any other tracking, timer, counter or pop-up.

### Prompt 10
Provided the `src/pt.ts` source module (`EXPERIMENT = "trigger_test"`, `CLARITY_ID = "zgi6oblpde"`, Supabase publishable client config, `visitorId`, `variant`, `consent`, `setConsent`, `loadClarity`, `track`, and Supabase member auth helpers).

### Prompt 11
> collate all prompts and store in prompts.md in github
