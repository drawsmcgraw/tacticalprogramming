Built with [Hugo](https://gohugo.io/) and deployed by Netlify (see `netlify.toml`).
Netlify builds with Hugo 0.131.0; use a matching (extended) version locally.

Starting the dev server (includes drafts):
```
hugo server -D
```

The dev server listens on `localhost:1313` by default.

Building the site the same way Netlify does:
```
hugo --gc --minify
```

Output is written to `public/`.
