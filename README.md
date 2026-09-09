# Acme

A fake product with real help text.

Every explanation on this page comes from [HelpCCMS](https://www.helpccms.com) at
runtime, fetched by key over one public GET. Nothing explanatory is written in this
repository. Rewrite a sentence in HelpCCMS, publish it, and this page shows the new
version within five minutes. No release here, no deploy, nobody touching this code.

## What to look at

**[`help.js`](help.js)** is the entire integration. About twenty lines. No package to
install, no API key, no build step. It takes a key and returns the text.

**[`index.html`](index.html)** is an ordinary settings screen. Three places show help,
and they are the three places every product has:

| Surface | Where | Key |
|---|---|---|
| Tooltip | the `i` next to "API keys" | `settings.api-keys` |
| Field help | under the secret key field | `settings.rotate-key` |
| Help panel | the `?` button, opens on the right | `settings.api-keys` |
| Banner | the Billing tab | `billing.payment-failed` |

**[`app.js`](app.js)** wires the two together. It is plain DOM code; the only thing
worth noting is what happens when a key returns nothing.

## The thing that is easy to miss

Two of the four keys above are published. The other two are not.

You cannot tell by looking. A key with nothing behind it renders nothing at all: no
empty box, no error, no gap where an explanation should be. That is the rule the API is
built for and the one we recommend to anyone integrating it. Help must never break a
screen. A missing explanation is a small loss; a broken panel is a bug report.

Publish the missing two in HelpCCMS and they appear here on the next load, with no
change to this repository.

## Try it

Open the page, then open the network tab. You will see one request per key:

```
GET https://www.helpccms.com/api/deploy/{collection}/{key}
```

```json
{
  "key": "settings.api-keys",
  "title": "API keys",
  "short_desc": null,
  "html": "<p>Every request to the Acme API carries a key…</p>",
  "text": "Every request to the Acme API carries a key…",
  "updated_at": "2026-09-02T20:38:47.225Z"
}
```

`html` drops straight into a panel. `text` is the same content without markup, for a
native tooltip, a log line or a search index.

`short_desc` is the one-line version, and on this topic it happens to be empty. That is
worth seeing rather than hiding: a tooltip that renders the full body is four paragraphs
long and no longer a tooltip. So `app.js` falls back to the first paragraph, and the
better fix is to fill the field in. The API hands you both and lets you decide.

Responses are cached at the edge for five minutes, so a key requested a million times
reaches the origin a few hundred times a day.

## Running it

There is nothing to build, but it does have to be served: `app.js` is an ES module, and
a browser refuses to load modules over `file://`.

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Delivery is public and read-only, so it works from any origin. The response carries
`Access-Control-Allow-Origin: *`; no proxy, no server, no secret.
