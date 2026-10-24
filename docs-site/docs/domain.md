---
title: 4. Connect your own domain
---

A domain gives the website a memorable address. It is separate from the website files and hosting.

## Register a domain—or use one you own

In Cloudflare Registrar, choose **Register domains**, search for a name, and review availability. Before purchase, check the initial price, renewal price, registration period, contact information, and auto-renew settings. Complete the purchase yourself and respond to any registrant verification email.

Domain registration is not free simply because your website is static. Read the [Cloudflare domain registration guide](https://developers.cloudflare.com/registrar/get-started/register-domain/) before checkout.

If you already own a domain elsewhere, you do not have to buy another one or transfer ownership. Add the domain as a zone in Cloudflare and follow its nameserver setup instructions at your registrar. Preserve existing DNS records, especially email-related records. Wait until the zone is active. See [full DNS setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).

:::warning Protect existing services
Changing nameservers or deleting DNS records can interrupt an existing website or email. Review the current setup first. Do not delete a conflicting record just to make an error disappear.
:::

## Attach the domain to your Worker

1. Open the deployed Worker in **Workers & Pages**.
2. Find **Settings → Domains & Routes** (or the current Domains area).
3. Choose **Add → Custom Domain**.
4. Enter the hostname you own, such as `example.com`, and review the change before confirming.
5. Wait for DNS and the HTTPS certificate to become active, then test the address.

Here, `example.com` is a reserved example—not a domain you can claim. Cloudflare's Custom Domains flow manages the necessary DNS record and certificate for an eligible active zone. A conflicting existing CNAME needs review. See the [official Custom Domains instructions](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

The root hostname and `www` are different. If you want both, configure each intentionally and choose which one is your main address; add a redirect separately if appropriate. Do not assume adding one automatically covers the other.

:::success Checkpoint
Your own hostname opens the correct website over HTTPS on both a computer and a phone. Existing email still works. You know when the domain renews.
:::
